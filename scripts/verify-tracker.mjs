// Optional integration check using the real downloaded Umami tracker.
// node scripts/verify-tracker.mjs /path/to/script.js
// The production origin is simulated and all analytics requests intercepted.
import { chromium } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import assert from 'node:assert/strict';
const tracker = await readFile(process.argv[2], 'utf8');
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser = await chromium.launch(existsSync(chrome) ? { executablePath: chrome } : {});
const context = await browser.newContext();
const payloads = [];
await context.route('https://cloud.umami.is/script.js', route => route.fulfill({ contentType: 'text/javascript', body: tracker }));
await context.route('https://gateway.umami.is/**', async route => {
  payloads.push(route.request().postDataJSON());
  await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
});
await context.route('https://getmaxday.com/**', async route => {
  const url = new URL(route.request().url());
  const response = await context.request.get('http://127.0.0.1:4173' + url.pathname + url.search);
  await route.fulfill({ response });
});
try {
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  page.setDefaultNavigationTimeout(10000);
  page.on('pageerror', error => console.log('Browser error:', error.message));
  await page.goto('https://getmaxday.com/?utm_source=facebook&utm_campaign=rest_v1&fbclid=TEST_CLICK_ID#reflection');
  console.log('Production-origin page loaded.');
  await page.waitForFunction(() => typeof window.umami?.track === 'function');
  // Actual file downloads are covered by flow.spec.js. Keep this simulated
  // production-origin page open to inspect the real SDK network payloads.
  await page.locator('#hero-download').evaluate(link => link.addEventListener('click', event => event.preventDefault()));
  await page.locator('#hero-download').click();
  await page.waitForFunction(() => sessionStorage.getItem('maxday:rest-v1:card_requested') === '1');
  // Tracker network requests settle with the mocked provider response.
  await page.waitForLoadState('networkidle');
  const pageview = payloads.find(p => p.type === 'event' && !p.payload.name);
  const action = payloads.find(p => p.payload.name === 'card_requested');
  assert(pageview, 'Real SDK pageview must reach the network interceptor');
  assert(action, 'Real SDK conversion must reach the network interceptor');
  assert.equal(action.payload.website, '9449f369-eb10-4dab-9299-b4e2d6920a91');
  assert.equal(action.payload.hostname, 'getmaxday.com');
  assert.equal(action.payload.data.placement, 'hero');
  assert.match(action.payload.url, /utm_source=facebook/);
  assert(!action.payload.url.includes('fbclid'));
  assert(!action.payload.url.includes('#'));
  await page.locator('#hero-download').click();
  await page.waitForLoadState('networkidle');
  assert.equal(payloads.filter(p => p.payload.name === 'card_requested').length, 1);
  console.log(JSON.stringify({ realSdk: 'passed', pageviews: payloads.filter(p => !p.payload.name).length, conversionRequests: 1, utmPreserved: true, clickIdsRemoved: true, requestsDeliveredToUmami: 0 }, null, 2));
} finally { await browser.close(); }

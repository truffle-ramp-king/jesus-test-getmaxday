import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

async function stubAnalytics(context) {
  await context.route('https://cloud.umami.is/**', route => {
    if (route.request().url().endsWith('/script.js')) {
      return route.fulfill({ contentType: 'text/javascript', body: `window.__analyticsCalls = []; window.umami = { track: (name, properties) => { window.__analyticsCalls.push({name, properties}); return Promise.resolve(); } };` });
    }
    return route.abort();
  });
}

test('a real card downloads; repeated requests do not inflate the conversion event', async ({ page, context }) => {
  await stubAnalytics(context);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/?utm_source=facebook&utm_medium=organic_social&utm_campaign=rest_v1');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Find a moment of peace.');
  await expect.poll(() => page.evaluate(() => window.__analyticsCalls)).toEqual([]);
  const first = page.waitForEvent('download');
  await page.locator('#hero-download').click();
  const download = await first;
  expect(download.suggestedFilename()).toBe('MaxDay-Matthew-11-28.png');
  const bytes = await readFile(await download.path());
  expect(bytes.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  expect(bytes.readUInt32BE(16)).toBe(1080);
  expect(bytes.readUInt32BE(20)).toBe(1350);
  await expect(page.getByRole('status')).toContainText('press and hold');
  const second = page.waitForEvent('download');
  await page.locator('#hero-download').click();
  await second;
  const calls = await page.evaluate(() => window.__analyticsCalls);
  expect(calls.filter(call => call.name === 'card_requested')).toEqual([{ name: 'card_requested', properties: { placement: 'hero' } }]);
  await page.reload();
  const third = page.waitForEvent('download');
  await page.locator('#hero-download').click();
  await third;
  expect(await page.evaluate(() => window.__analyticsCalls)).toEqual([]);
  expect(errors).toEqual([]);
});

test('blocked analytics leaves the download and surrounding passage usable', async ({ page, context }) => {
  await context.route('https://cloud.umami.is/**', route => route.abort());
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  const resource = page.waitForEvent('download');
  await page.locator('#hero-download').click();
  expect(await (await resource).failure()).toBeNull();
  await page.locator('summary').click();
  await expect(page.locator('.passage-text')).toContainText('gentle and humble in heart');
  expect(errors).toEqual([]);
});

test('the whole reading and real resources work without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  await context.route('https://cloud.umami.is/**', route => route.abort());
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('#prayer-title')).toHaveText('Bring him what’s heavy.');
  await page.locator('summary').click();
  await expect(page.locator('.passage-text')).toBeVisible();
  const resource = page.waitForEvent('download');
  await page.locator('#hero-download').click();
  expect(await (await resource).failure()).toBeNull();
  await expect(page.locator('#share-button')).toBeHidden();
  await context.close();
});

test('small phone widths remain readable, with a follow-up action after scrolling', async ({ page, context }) => {
  await stubAnalytics(context);
  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    const layout = await page.evaluate(() => ({ width: innerWidth, content: document.documentElement.scrollWidth, card: document.querySelector('.verse-card').getBoundingClientRect(), action: document.querySelector('#hero-download').getBoundingClientRect() }));
    expect(layout.content).toBeLessThanOrEqual(layout.width);
    expect(layout.action.width).toBeGreaterThanOrEqual(275);
    await expect(page.locator('#mobile-bar')).toBeHidden();
    await page.locator('#prayer-title').scrollIntoViewIfNeeded();
    await expect(page.locator('#mobile-bar')).toBeVisible();
    await expect(page.locator('#mobile-bar .download-link')).toBeVisible();
  }
  await page.screenshot({ path: 'test-results/mobile.png', fullPage: true });
});

test('all HTML declares noindex and static navigation/resources return successfully', async ({ page, context, request }) => {
  await stubAnalytics(context);
  for (const path of ['/', '/about.html', '/privacy.html', '/404.html', '/assets/matthew-11-28-print.html']) {
    await page.goto(path);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
    await expect(page.locator('body')).not.toBeEmpty();
  }
  await page.goto('/');
  for (const path of await page.locator('[src], link[rel="stylesheet"]').evaluateAll(nodes => nodes.map(n => n.getAttribute('src') || n.getAttribute('href')).filter(value => !value.startsWith('https://')))) {
    expect((await request.get(path)).status(), path).toBe(200);
  }
  expect((await request.get('/assets/social-preview.jpg')).status()).toBe(200);
  expect((await request.get('/robots.txt')).status()).toBe(200);
  await page.getByRole('link', { name: 'Privacy', exact: true }).click();
  await expect(page).toHaveURL(/privacy\.html$/);
});

test('short Facebook entry keeps working assets and campaign attribution', async ({ page, context }) => {
  await stubAnalytics(context);
  await page.goto('/rest/');
  await expect(page.locator('h1')).toContainText('peace');
  expect(await page.locator('.landscape').evaluate(img => img.complete && img.naturalWidth > 0)).toBeTruthy();
  const tracked = await page.evaluate(() => window.maxdayBeforeSend('event', { url: location.href }).url);
  const url = new URL(tracked);
  expect(url.pathname).toBe('/');
  expect(url.searchParams.get('utm_source')).toBe('facebook');
  expect(url.searchParams.get('utm_campaign')).toBe('rest_v1');
  expect(page.url()).toBe('http://127.0.0.1:4173/rest/');
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#hero-download').click();
  expect((await downloadPromise).suggestedFilename()).toBe('MaxDay-Matthew-11-28.png');
  await page.goto('/rest/?utm_source=qa&utm_campaign=launch_check&fbclid=test');
  const qa = await page.evaluate(() => window.maxdayBeforeSend('event', { url: location.href }).url);
  expect(qa).toContain('utm_source=qa');
  expect(qa).toContain('utm_campaign=launch_check');
  expect(qa).not.toContain('fbclid');
});

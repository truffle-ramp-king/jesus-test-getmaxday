// Temporary rollout: main domain forwards now, legacy Bible entry stays live
// until bible.getmaxday.com has a valid certificate. Then deploy build-forwarding.
import './build-pages.mjs';
import { cp, writeFile } from 'node:fs/promises';
await cp('public', 'forwarding-public', {recursive:true});
await writeFile('forwarding-public/CNAME', 'getmaxday.com\n');
await writeFile('forwarding-public/index.html', `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, nofollow"><meta name="referrer" content="no-referrer"><title>Continue to MaxDay</title><noscript><meta http-equiv="refresh" content="0;url=https://maxday.ai/"></noscript><style>body{font:18px/1.6 system-ui,sans-serif;max-width:40rem;margin:12vh auto;padding:24px;color:#2d352b;background:#fcfaf3}a{color:#475b37}</style></head><body><p>Taking you to your destination…</p><a id="continue" href="https://maxday.ai/">Continue</a><script>(()=>{const current=new URL(location.href);const target=new URL('https://maxday.ai/');if(current.searchParams.get('utm_campaign')==='rest_v1'){target.href='https://getmaxday.com/rest/';target.search=current.search;target.hash=current.hash;}document.getElementById('continue').href=target.href;location.replace(target.href);})();</script></body></html>`);

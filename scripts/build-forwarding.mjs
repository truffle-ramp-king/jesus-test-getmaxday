import { mkdir, writeFile, cp, readdir } from 'node:fs/promises';
import { join } from 'node:path';
// Publish a separate output directory; retain the previous source in Git.
const out = 'forwarding-public';
await mkdir(out, { recursive: true });
await cp('public/assets', join(out, 'assets'), { recursive: true });
const logic = `(() => {
  const current = new URL(location.href);
  const biblePath = /^\\/rest(?:\\/|$)/.test(current.pathname) || /^\\/assets\\//.test(current.pathname) || ['/about.html', '/privacy.html'].includes(current.pathname);
  const bibleCampaign = current.searchParams.get('utm_campaign') === 'rest_v1';
  const destination = new URL(biblePath || bibleCampaign ? 'https://bible.getmaxday.com/' : 'https://maxday.ai/');
  if (biblePath || bibleCampaign) {
    destination.pathname = ['/rest', '/rest/', '/rest/index.html'].includes(current.pathname) ? '/' : current.pathname;
    destination.search = current.search;
    destination.hash = current.hash;
  }
  document.getElementById('continue').href = destination.href;
  location.replace(destination.href);
})();`;
function html(destination) {
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, nofollow"><meta name="referrer" content="no-referrer"><title>Continue to MaxDay</title><noscript><meta http-equiv="refresh" content="0;url=${destination}"></noscript><style>body{font:18px/1.6 system-ui,sans-serif;max-width:40rem;margin:12vh auto;padding:24px;color:#2d352b;background:#fcfaf3}a{color:#475b37}</style></head><body><p>Taking you to your destination…</p><a id="continue" href="${destination}">Continue</a><script>${logic}</script></body></html>`;
}
await writeFile(join(out,'index.html'), html('https://maxday.ai/'));
await writeFile(join(out,'404.html'), html('https://maxday.ai/'));
await mkdir(join(out,'rest'), {recursive:true});
await writeFile(join(out,'rest/index.html'), html('https://bible.getmaxday.com/'));
for (const page of ['about.html','privacy.html']) await writeFile(join(out,page), html('https://bible.getmaxday.com/'+page));
async function prints(dir) {
 for (const entry of await readdir(dir,{withFileTypes:true})) {
  const path = join(dir,entry.name);
  if (entry.isDirectory()) await prints(path);
  else if (path.endsWith('.html')) await writeFile(path,html('https://bible.getmaxday.com/'+path.slice(out.length+1)));
 }
}
await prints(join(out,'assets'));
await writeFile(join(out,'CNAME'),'getmaxday.com\n');
await writeFile(join(out,'.nojekyll'),'');
await writeFile(join(out,'robots.txt'),'User-agent: *\nAllow: /\n');

import { chromium } from '@playwright/test';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const cards = [
 {id:'rest',title:'A prayer for rest',reference:'Matthew 11:28',verse:'Come to me, all you who labor and are heavily burdened, and I will give you rest.',prayer:'Jesus, help me bring you what feels heavy today. Teach me to receive your rest and meet this day with gentleness. Amen.'},
 {id:'guidance',title:'A prayer for guidance',reference:'Psalm 23:1',verse:'Yahweh is my shepherd: I shall lack nothing.',prayer:'Lord, guide my next step. Help me trust your care, notice what you have provided, and share generously with others. Amen.'},
 {id:'strength',title:'A prayer for strength',reference:'Psalm 46:1',verse:'God is our refuge and strength, a very present help in trouble.',prayer:'God, be my refuge in this moment. Give me courage for what is ahead and wisdom to accept the help I need. Amen.'},
 {id:'care',title:'A prayer for anxious moments',reference:'1 Peter 5:7',verse:'casting all your worries on him, because he cares for you.',prayer:'Father, you know the worries I carry. Help me place them in your care and take this day one faithful step at a time. Amen.'}
];
const escape = s => s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
await mkdir('public/assets/prayers', {recursive:true});
const art = (await readFile('public/assets/olive-hills.jpg')).toString('base64');
const browser = await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try {
 const page = await browser.newPage({viewport:{width:1080,height:1350},deviceScaleFactor:1});
 for (const card of cards) {
  await page.setContent(`<!doctype html><html><head><style>*{box-sizing:border-box}body{margin:0;background:#fcfaf3;color:#2d352b;text-align:center}img{width:1080px;height:300px;object-fit:cover;object-position:50% 68%}.body{padding:50px 85px}.title{font:19px Arial;letter-spacing:3px;text-transform:uppercase;color:#475b37}blockquote{font:49px/1.3 Georgia;margin:38px 0 25px}.ref{font:18px Arial;letter-spacing:2px}.translation{font:12px Arial;letter-spacing:2px;color:#596151}.prayer{border-top:1px solid #b8c1ac;margin-top:35px;padding-top:30px;font:34px/1.5 Georgia}.brand{position:absolute;bottom:45px;width:100%;font:24px Georgia}.brand small{display:block;font:12px Arial;letter-spacing:2px;margin-top:12px}</style></head><body><img src="data:image/jpeg;base64,${art}"><div class="body"><p class="title">${escape(card.title)}</p><blockquote>“${escape(card.verse)}”</blockquote><p class="ref">${escape(card.reference)}</p><p class="translation">WORLD ENGLISH BIBLE</p><p class="prayer">${escape(card.prayer)}</p></div><div class="brand">MaxDay<small>GETMAXDAY.COM · PRAYER BY MAXDAY</small></div></body></html>`);
  await page.locator('img').evaluate(img => img.decode());
  if (await page.locator('.prayer').evaluate(el => el.getBoundingClientRect().bottom > 1210)) throw new Error('Card text overlaps footer: '+card.id);
  await page.screenshot({path:`public/assets/prayers/${card.id}.png`});
  await writeFile(`public/assets/prayers/${card.id}.html`, `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>${escape(card.title)} · MaxDay</title><style>body{text-align:center;background:#fcfaf3;font:18px Arial}img{display:block;width:min(100%,540px);margin:20px auto}button{padding:14px 28px;font:inherit}@media print{button,a{display:none}img{width:125mm;margin:auto}}</style><button onclick="window.print()">Print this card</button> <a href="/">Back to MaxDay</a><img src="${card.id}.png" width="1080" height="1350" style="height:auto" alt="${escape(card.verse+' '+card.reference+'. '+card.prayer)}"></html>`);
 }
} finally { await browser.close(); }
await writeFile('public/prayer-cards.js', 'window.maxdayPrayerCards = '+JSON.stringify(cards)+';\n');

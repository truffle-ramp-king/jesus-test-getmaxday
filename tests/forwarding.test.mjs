import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const html = await readFile('forwarding-public/index.html','utf8');
const code = html.match(/<script>([\s\S]*?)<\/script>/)[1];
for (const [input, expected] of [
 ['https://getmaxday.com/','https://maxday.ai/'],
 ['https://www.getmaxday.com/','https://maxday.ai/'],
 ['https://getmaxday.com/?next=https://evil.example','https://maxday.ai/'],
 ['https://getmaxday.com/rest/?utm_content=post02&fbclid=abc#reflection','https://bible.getmaxday.com/rest/?utm_content=post02&fbclid=abc#reflection'],
 ['https://getmaxday.com/rest?utm_content=post03','https://bible.getmaxday.com/rest/?utm_content=post03'],
 ['https://getmaxday.com/?utm_campaign=rest_v1&utm_source=facebook','https://bible.getmaxday.com/?utm_campaign=rest_v1&utm_source=facebook'],
 ['https://getmaxday.com/assets/prayers/rest.html','https://bible.getmaxday.com/assets/prayers/rest.html'],
 ['https://getmaxday.com/privacy.html','https://bible.getmaxday.com/privacy.html'],
 ['https://getmaxday.com/unrelated','https://maxday.ai/'],
]) {
 let actual; const link = {};
 vm.runInNewContext(code,{URL,location:{href:input,replace:value=>actual=value},document:{getElementById:()=>link}});
 assert.equal(actual,expected); assert.equal(link.href,expected);
}
assert(html.includes('noindex, nofollow'));
const rest = await readFile('forwarding-public/rest/index.html','utf8');
assert(rest.includes('<noscript><meta http-equiv="refresh" content="0;url=https://bible.getmaxday.com/rest/">'));
assert(!rest.includes('cloud.umami.is'));
console.log('9 forwarding routes, tracking preservation, fixed destinations, noindex, and no-JS fallback passed.');

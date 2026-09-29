import { readFile, mkdir, writeFile } from 'node:fs/promises';
// Generate the Facebook entry page from the homepage so the content stays in sync.
const homepage = await readFile('public/index.html', 'utf8');
const shortPage = homepage.replace(/(href|src)="([^"#:/][^"]*)"/g, (match, attribute, value) => {
  if (value === './') return `${attribute}="/"`;
  return `${attribute}="/${value}"`;
});
await mkdir('public/rest', { recursive: true });
await writeFile('public/rest/index.html', shortPage);

import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const SITE_URL = 'https://krahd.github.io/musifold/';
const INDEXNOW_KEY = '187698fd6565dcfce23484648701f559';
const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

for (const path of [
  './sitemap.xml',
  './site.webmanifest',
  `./${INDEXNOW_KEY}.txt`,
  './assets/social-preview.png',
]) {
  assert.ok(existsSync(new URL(path, import.meta.url)), `${path} must exist`);
}

const html = read('./index.html');
assert.match(html, new RegExp(`<link rel="canonical" href="${SITE_URL.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}"`));
assert.match(html, /<link rel="manifest" href="site\.webmanifest">/u);
assert.match(html, /<link rel="sitemap" type="application\/xml" href="sitemap\.xml">/u);
assert.match(html, /<script type="application\/ld\+json">/u);
assert.match(html, /"@type": "WebApplication"/u);
assert.match(html, /"name": "Tomas Laurenzo"/u);
assert.match(html, /"codeRepository": "https:\/\/github\.com\/krahd\/musifold"/u);
assert.match(html, /og:image:width/u);
assert.match(html, /twitter:image:alt/u);

const jsonLdText = html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/u)?.[1];
assert.ok(jsonLdText, 'Structured data must be present');
const jsonLd = JSON.parse(jsonLdText);
assert.equal(jsonLd['@type'], 'WebApplication');
assert.equal(jsonLd.url, SITE_URL);
assert.equal(jsonLd.isAccessibleForFree, true);
assert.equal(jsonLd.author.url, 'https://laurenzo.net');

const manifest = JSON.parse(read('./site.webmanifest'));
assert.equal(manifest.name, 'Musifold');
assert.equal(manifest.start_url, './');
assert.equal(manifest.display, 'standalone');
assert.ok(manifest.categories.includes('music'));

const sitemap = read('./sitemap.xml');
assert.match(sitemap, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/u);
assert.match(sitemap, new RegExp(`<loc>${SITE_URL.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}</loc>`));
assert.equal((sitemap.match(/<url>/gu) ?? []).length, 1, 'Only the canonical app URL should be indexed');

assert.equal(read(`./${INDEXNOW_KEY}.txt`).trim(), INDEXNOW_KEY);

const workflow = read('./.github/workflows/pages.yml');
for (const filename of ['sitemap.xml', 'site.webmanifest', `${INDEXNOW_KEY}.txt`]) {
  assert.match(workflow, new RegExp(filename.replaceAll('.', '\\.')), `Pages workflow must deploy ${filename}`);
}
assert.doesNotMatch(workflow, /robots\.txt/u, 'Project Pages must not pretend to control the host-level robots file');

console.log('Discoverability metadata and deployment tests passed.');

import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const output = resolve(root, 'dist');
const requiredFiles = [
  'index.html',
  '404.html',
  'login.html',
  'register.html',
  'forgot-password.html',
  'reset-password.html',
  'verify-email.html',
  'account.html',
  'config-access.js',
  'auth-gate.js',
  'auth.js',
  'supabase-config.js',
  'assets/index-B8_eNnuB-fortigate-dhcp.js',
  'assets/index-Cb2PVZKF.css',
  'assets/rolldown-runtime-B0Z9INg1.js',
  'assets/hw-TcABu2mr.js',
  'assets/site-BkMk_C_1.js',
  'assets/index-BDnf0KE9.css',
];

for (const relativePath of requiredFiles) {
  assert.ok(existsSync(resolve(output, relativePath)), `Missing build output: ${relativePath}`);
}

const rootPages = readdirSync(root).filter((name) => name.endsWith('.html'));
for (const page of rootPages) {
  const sourcePage = readFileSync(resolve(root, page));
  const builtPage = readFileSync(resolve(output, page));
  assert.ok(builtPage.length > 0, `Missing built HTML entry: ${page}`);
  if (page !== 'index.html') {
    assert.deepEqual(builtPage, sourcePage, `Legacy HTML page changed during build: ${page}`);
  }
}

const indexHtml = readFileSync(resolve(output, 'index.html'), 'utf8');
const configAccess = readFileSync(resolve(output, 'config-access.js'), 'utf8');
assert.match(indexHtml, /\/vite-assets\/[^"']+\.js/, 'Vite React source entry was not emitted');
assert.match(indexHtml, /\/vite-assets\/[^"']+\.css/, 'Vite-managed source stylesheet was not emitted');
assert.doesNotMatch(indexHtml, /\/src\/main\.jsx/, 'Built HTML still points at source JSX');
assert.match(indexHtml, /\/config-access\.js\?login=/, 'Auth/bootstrap loader reference was lost');
assert.match(configAccess, /\/assets\/index-B8_eNnuB-fortigate-dhcp\.js\?public-access=/, 'Pinned legacy app bundle reference was lost');

const sourceAssetCount = readdirSync(resolve(root, 'assets')).length;
const builtAssetCount = readdirSync(resolve(output, 'assets')).length;
assert.equal(builtAssetCount, sourceAssetCount, 'Legacy assets were not copied verbatim');

console.log(`Build smoke test passed: ${rootPages.length} HTML pages, ${builtAssetCount} legacy assets, Vite React entry present.`);

import { cpSync, copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'dist');
const legacyFiles = [
  'assets',
  'auth-gate.js',
  'auth.css',
  'auth.js',
  'brand-refresh.js',
  'config-access.js',
  'manifest.json',
  'manus-routes.json',
  'profile-bridge.js',
  'robots.txt',
  'supabase-config.js',
];

if (!existsSync(resolve(output, 'index.html'))) {
  throw new Error('Vite output is missing dist/index.html; run this script after vite build.');
}

mkdirSync(output, { recursive: true });
for (const relativePath of legacyFiles) {
  const source = resolve(root, relativePath);
  if (!existsSync(source)) throw new Error(`Required legacy file is missing: ${relativePath}`);
  cpSync(source, resolve(output, relativePath), { recursive: true, force: true });
}

const legacyPages = readdirSync(root, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.html') && entry.name !== 'index.html')
  .map((entry) => entry.name);
for (const page of legacyPages) copyFileSync(resolve(root, page), resolve(output, page));

console.log(`Copied ${legacyFiles.length} legacy asset paths and ${legacyPages.length} legacy HTML pages into dist unchanged.`);

import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const files = [
  'auth-gate.js',
  'auth.js',
  'brand-refresh.js',
  'config-access.js',
  'profile-bridge.js',
  'supabase-config.js',
  'assets/index-B8_eNnuB-fortigate-dhcp.js',
];

for (const relativePath of files) {
  const result = spawnSync(process.execPath, ['--check', resolve(root, relativePath)], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log(`Syntax checks passed for ${files.length} browser modules.`);

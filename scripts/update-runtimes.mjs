import fs from 'node:fs';

const file = new URL('../runtimes.json', import.meta.url);
const policy = JSON.parse(fs.readFileSync(file, 'utf8'));
if (!policy.argent || !/^\d+\.\d+\.\d+$/.test(policy.argent.version)) throw new Error('Invalid Argent policy');
const response = await fetch('https://registry.npmjs.org/@swmansion%2fargent/latest', { signal: AbortSignal.timeout(15000) });
if (!response.ok) throw new Error('Argent registry check failed: ' + response.status);
const latest = await response.json();
if (typeof latest.version !== 'string' || !/^\d+\.\d+\.\d+$/.test(latest.version)) throw new Error('Invalid stable Argent release');
const current = policy.argent.version.split('.').map(Number);
const next = latest.version.split('.').map(Number);
const changed = next.findIndex((value, index) => value !== current[index]);
if (changed < 0 || next[changed] < current[changed]) {
  console.log('Argent already at approved version ' + policy.argent.version);
} else {
  const tag = await fetch('https://api.github.com/repos/software-mansion/argent/git/ref/tags/v' + latest.version, { headers: { 'User-Agent': 'agents-runtime-updater' }, signal: AbortSignal.timeout(15000) });
  if (!tag.ok) throw new Error('Argent release has no matching skill tag: ' + latest.version);
  const before = policy.argent.version;
  policy.argent.version = latest.version;
  fs.writeFileSync(file, JSON.stringify(policy, null, 2) + '\n');
  console.log('Argent: ' + before + ' → ' + latest.version);
}

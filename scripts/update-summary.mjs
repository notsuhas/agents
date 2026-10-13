import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const before = file => {
  try { return JSON.parse(execFileSync('git', ['show', 'HEAD:' + file], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })); }
  catch { return {}; }
};
const previous = before('backbone.json');
const current = read('backbone.json');
const lines = ['Updates accumulated from tracked upstream packages and approved CLI releases.', '', 'Changes:'];
for (const pkg of current.packages) {
  const old = previous.packages?.find(item => item.name === pkg.name);
  const from = old?.upstream?.approved_commit;
  const to = pkg.upstream?.approved_commit;
  if (!to || from === to) continue;
  lines.push('- ' + pkg.name + ': ' + (from?.slice(0, 12) || 'new') + ' → ' + to.slice(0, 12) + ' (' + pkg.upstream.path + ').');
  if (from && pkg.upstream.repository.startsWith('https://github.com/')) lines.push('  ' + pkg.upstream.repository.replace(/\.git$/, '') + '/compare/' + from + '...' + to);
}
const oldArgent = before('runtimes.json').argent?.version;
const newArgent = read('runtimes.json').argent?.version;
if (oldArgent !== newArgent) lines.push('- Argent CLI: ' + (oldArgent || 'not configured') + ' → ' + newArgent + '. Its installer refreshes matching skills on each machine.');
lines.push('', 'Package paths, skill metadata and links passed validation. Review changed instructions and test affected workflows before merging. Host adapters and local credentials remain local. Disabled shared skills stay disabled.', '', 'This PR accumulates all pending updates. Merging it approves the source revisions and runtime version for machine refresh.');
fs.writeFileSync(path.join(root, '.update-summary.md'), lines.join('\n') + '\n');

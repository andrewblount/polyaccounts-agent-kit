// Verify the actual published npm-compatible release through its executable name.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const packageRef = process.argv[2] || `https://github.com/andrewblount/polyaccounts-agent-kit/releases/download/v${version}/polyaccounts-agent-kit-${version}.tgz`;
const input = [{ id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18' } }, { id: 2, method: 'tools/call', params: { name: 'expense_changes', arguments: {} } }].map(r => JSON.stringify({ jsonrpc: '2.0', ...r })).join('\n') + '\n';
const result = spawnSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['--yes', `--package=${packageRef}`, 'polyaccounts-demo'], { encoding: 'utf8', input, timeout: 60000, shell: process.platform === 'win32' });
assert.equal(result.status, 0, result.stderr);
assert.ok(result.stdout.trim(), 'Installed binary exited without starting MCP');
const replies = result.stdout.trim().split('\n').map(JSON.parse);
assert.equal(replies[0].result.serverInfo.version, version);
assert.equal(replies[1].result.structuredContent.change, '650.0000');
assert.equal(replies[1].result.structuredContent.evidence.length, 7);
console.log(JSON.stringify({ installedPackage: packageRef, version, expenseChange: '650.0000', evidenceEntries: 7, status: 'passed' }));

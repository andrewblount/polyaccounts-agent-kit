import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dispatch } from '../demo.mjs';
import { entries, ledger, trialBalance, expenseChanges, units, decimal } from '../fixture.mjs';
test('expense changes reconcile to retrieved entries using exact arithmetic', () => {
  const result = expenseChanges();
  assert.equal(result.previous, '1200.0000'); assert.equal(result.current, '1850.0000'); assert.equal(result.change, '650.0000');
  for (const row of result.rows) {
    for (const period of ['previous', 'current']) assert.equal(decimal(entries.filter(e => row[`${period}_entry_ids`].includes(e.id)).reduce((n, e) => n + units(e.debit) - units(e.credit), 0n)), row[period]);
    assert.equal(units(row.current) - units(row.previous), units(row.change));
  }
});
test('both posting legs balance in each period and deleted records stay excluded', () => {
  for (const [from, to] of [['2026-07-01', '2026-07-31'], ['2026-08-01', '2026-08-31']]) assert.equal(trialBalance({ from, to }).totals.difference, '0.0000');
  entries.push({ ...entries[0], id: 'deleted-test', is_deleted: true });
  try { assert.ok(!ledger().some(e => e.id === 'deleted-test')); } finally { entries.pop(); }
});
test('tool input rejects unknown fields, invalid dates and unsupported accounts', () => {
  for (const args of [{ from: '2026-02-31' }, { from: '2026-09-01', to: '2026-08-01' }, { account: 'other-company' }, { sql: 'select 1' }, { from: null }]) assert.equal(dispatch('tools/call', { name: 'ledger_entries', arguments: args }).isError, true);
});
test('all advertised tools, prompts and resources work without credentials', () => {
  for (const tool of dispatch('tools/list').tools) { assert.equal(tool.annotations.readOnlyHint, true); assert.ok(!dispatch('tools/call', { name: tool.name }).isError); }
  for (const prompt of dispatch('prompts/list').prompts) assert.ok(dispatch('prompts/get', { name: prompt.name }).messages.length);
  const [resource] = dispatch('resources/list').resources; assert.ok(dispatch('resources/read', { uri: resource.uri }).contents.length);
});
test('real stdio example retrieves evidence and completes successfully', () => {
  const result = spawnSync(process.execPath, ['examples/expense-review.mjs'], { cwd: new URL('..', import.meta.url), encoding: 'utf8', timeout: 15000 });
  assert.equal(result.status, 0, result.stderr); assert.match(result.stdout, /Verified 7 expense entries/);
});
test('npm-style executable symlink starts the MCP server', { skip: process.platform === 'win32' }, () => {
  const dir = mkdtempSync(join(tmpdir(), 'polyaccounts-bin-'));
  try {
    const link = join(dir, 'polyaccounts-demo'); symlinkSync(fileURLToPath(new URL('../demo.mjs', import.meta.url)), link);
    const child = spawnSync(process.execPath, [link], { input: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }) + '\n', encoding: 'utf8', timeout: 5000 });
    assert.equal(child.status, 0, child.stderr); assert.equal(JSON.parse(child.stdout).result.tools.length, 4);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

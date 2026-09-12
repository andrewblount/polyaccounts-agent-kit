// Exercise the actual stdio MCP transport. No model, API key, dependencies or network.
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const child = spawn(process.execPath, [fileURLToPath(new URL('../demo.mjs', import.meta.url))], { stdio: ['pipe', 'pipe', 'inherit'] });
const lines = createInterface({ input: child.stdout });
const pending = new Map(); let id = 0;
lines.on('line', line => { const response = JSON.parse(line); const item = pending.get(response.id); if (item) { pending.delete(response.id); response.error ? item.reject(new Error(response.error.message)) : item.resolve(response.result); } });
child.on('exit', () => { for (const item of pending.values()) item.reject(new Error('Demo stopped before responding')); });
const timer = setTimeout(() => { child.kill(); }, 10000);
const request = (method, params = {}) => new Promise((resolve, reject) => { const requestId = ++id; pending.set(requestId, { resolve, reject }); child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: requestId, method, params }) + '\n'); });
const call = async (name, args = {}) => { const result = await request('tools/call', { name, arguments: args }); if (result.isError) throw new Error(result.content[0].text); return result.structuredContent; };
try {
  await request('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'expense-review-example', version: '1.0.2' } });
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
  const context = await call('accounting_context');
  const report = await call('expense_changes');
  const evidence = await call('ledger_entries', { from: context.previous_period.from, to: context.current_period.to });
  for (const row of report.rows) for (const entryId of [...row.previous_entry_ids, ...row.current_entry_ids]) assert.ok(evidence.entries.some(e => e.id === entryId), `Missing evidence ${entryId}`);
  assert.equal(report.change, '650.0000');
  console.log(`${context.name}\nAugust 2026 compared with July 2026\nExpenses increased from USD ${report.previous} to USD ${report.current}, a change of USD ${report.change}.\n`);
  for (const row of report.rows) console.log(`${row.account}\n  July ${row.previous} | August ${row.current} | Change ${row.change}\n  Evidence ${[...row.previous_entry_ids, ...row.current_entry_ids].join(', ')}`);
  console.log(`\n${report.interpretation}\n\nVerified ${report.evidence.length} expense entries through the MCP connection.`);
} finally { clearTimeout(timer); child.stdin.end(); lines.close(); child.kill(); }

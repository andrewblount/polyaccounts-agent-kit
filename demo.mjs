#!/usr/bin/env node
import { createInterface } from 'node:readline';
import { pathToFileURL } from 'node:url';
import { realpathSync } from 'node:fs';
import { company, entries, ledger, trialBalance, expenseChanges } from './fixture.mjs';
const date = { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$', description: 'Inclusive YYYY-MM-DD date in the synthetic fixture' };
const schema = properties => ({ type: 'object', properties, additionalProperties: false });
export const tools = [
  { name: 'accounting_context', description: 'Inspect Juniper Studio, an invented USD company, its accounts and available periods. No credentials, customer records or network access.', inputSchema: schema({}) },
  { name: 'ledger_entries', description: 'Read exact decimal strings and stable entry IDs from synthetic July and August 2026 ledger data. Both debit and credit legs are available.', inputSchema: schema({ from: date, to: date, account: { type: 'string', description: 'Exact account name from accounting_context' } }) },
  { name: 'trial_balance', description: 'Calculate period activity from both legs of synthetic journal entries using exact integer arithmetic. A balanced trial balance alone does not establish correct books.', inputSchema: schema({ from: date, to: date }) },
  { name: 'expense_changes', description: 'Compare synthetic August 2026 with July 2026 and return exact expense differences with ledger evidence. The fixture clock is August 31, 2026, independent of today.', inputSchema: schema({}) },
].map(tool => ({ ...tool, title: tool.name.replaceAll('_', ' '), annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } }));
const prompts = [
  { name: 'expense_review', description: 'Explain expense changes with source entries in the synthetic demo' },
  { name: 'review_books', description: 'Check synthetic trial balance and inspect ledger evidence' },
];
export function dispatch(method, params = {}) {
  if (method === 'initialize') return { protocolVersion: ['2024-11-05', '2025-03-26', '2025-06-18'].includes(params.protocolVersion) ? params.protocolVersion : '2025-06-18', capabilities: { tools: {}, resources: {}, prompts: {} }, serverInfo: { name: 'polyaccounts-demo', version: '1.2.1' }, instructions: 'This server contains only invented data. Its current month is August 2026. Cite entry IDs. This demo is read-only. The separately installed hosted connector provides company-scoped read and write access.' };
  if (method === 'ping') return {};
  if (method === 'tools/list') return { tools };
  if (method === 'prompts/list') return { prompts };
  if (method === 'prompts/get') {
    if (!prompts.some(p => p.name === params.name)) throw new Error('Unknown prompt');
    return { messages: [{ role: 'user', content: { type: 'text', text: params.name === 'expense_review' ? 'Use accounting_context to establish the synthetic periods. What changed in expenses this month? Use expense_changes, verify each cited ID with ledger_entries and explain the August versus July 2026 comparison. Distinguish recorded facts from inferred causes. Show exact amounts, currency, dates and entry IDs.' : 'Read accounting_context, run trial_balance for each available month, and inspect ledger_entries. Report debit and credit totals and evidence. Do not equate a balanced trial balance with complete or correct books.' } }] };
  }
  if (method === 'resources/list') return { resources: [{ uri: 'polyaccounts://demo/company', name: 'Synthetic demonstration company', mimeType: 'application/json' }] };
  if (method === 'resources/read') {
    if (params.uri !== 'polyaccounts://demo/company') throw new Error('Unknown resource');
    return { contents: [{ uri: params.uri, mimeType: 'application/json', text: JSON.stringify({ company, entries }) }] };
  }
  if (method === 'tools/call') {
    try {
      const tool = tools.find(t => t.name === params.name);
      if (!tool) throw new Error('Unknown tool');
      const args = params.arguments ?? {};
      if (typeof args !== 'object' || Array.isArray(args) || !args || Object.keys(args).some(key => !(key in tool.inputSchema.properties))) throw new Error('Unexpected tool arguments');
      for (const value of Object.values(args)) if (typeof value !== 'string') throw new Error('Arguments must be strings');
      const data = params.name === 'accounting_context' ? { ...company, accounts: [...new Set(entries.map(e => e.account))].sort(), access: 'synthetic_read_only' } : params.name === 'ledger_entries' ? { synthetic: true, currency: 'USD', entries: ledger(args), next_cursor: null } : params.name === 'trial_balance' ? trialBalance(args) : expenseChanges();
      return { content: [{ type: 'text', text: JSON.stringify(data) }], structuredContent: data };
    } catch (error) { return { isError: true, content: [{ type: 'text', text: error.message }] }; }
  }
  const error = new Error('Method not found'); error.code = -32601; throw error;
}
if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  for await (const line of createInterface({ input: process.stdin, crlfDelay: Infinity })) {
    if (!line.trim()) continue;
    let request;
    try {
      request = JSON.parse(line);
      if (!request || typeof request !== 'object' || Array.isArray(request) || request.jsonrpc !== '2.0' || typeof request.method !== 'string') throw Object.assign(new Error('Invalid request'), { code: -32600 });
      if (request.id === undefined) continue;
      process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: request.id, result: dispatch(request.method, request.params) }) + '\n');
    } catch (error) { process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: request?.id ?? null, error: { code: error.code || (error instanceof SyntaxError ? -32700 : -32602), message: error.message } }) + '\n'); }
  }
}

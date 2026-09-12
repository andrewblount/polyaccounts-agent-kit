// Entirely invented, deterministic evaluation data. No customer data or network access.
export const company = { id: 'demo-juniper', name: 'Juniper Studio (synthetic)', currency: 'USD', synthetic: true, as_of: '2026-08-31', current_period: { from: '2026-08-01', to: '2026-08-31' }, previous_period: { from: '2026-07-01', to: '2026-07-31' } };
const transactions = [
  ['07-SALE', '2026-07-02', 'Demo project income', 'Assets:Bank', 'Income:Services', '4000.0000'],
  ['07-SOFTWARE', '2026-07-04', 'Demo software subscription', 'Expenses:Software', 'Assets:Bank', '300.0000'],
  ['07-WORKSPACE', '2026-07-05', 'Demo workspace rental', 'Expenses:Workspace', 'Assets:Bank', '800.0000'],
  ['07-FEES', '2026-07-31', 'Demo processing fees', 'Expenses:Fees', 'Assets:Bank', '100.0000'],
  ['08-SALE', '2026-08-02', 'Demo project income', 'Assets:Bank', 'Income:Services', '4500.0000'],
  ['08-SOFTWARE', '2026-08-04', 'Demo software subscription', 'Expenses:Software', 'Assets:Bank', '300.0000'],
  ['08-CLOUD', '2026-08-15', 'Demo cloud compute usage', 'Expenses:Software', 'Assets:Bank', '500.0000'],
  ['08-WORKSPACE', '2026-08-05', 'Demo workspace rental', 'Expenses:Workspace', 'Assets:Bank', '800.0000'],
  ['08-FEES', '2026-08-31', 'Demo processing fees', 'Expenses:Fees', 'Assets:Bank', '250.0000'],
];
export const entries = transactions.flatMap(([id, date, description, debit, credit, amount]) => [
  { id: `DEMO-${id}-D`, transaction_id: `DEMO-${id}`, date, description, account: debit, debit: amount, credit: '0.0000', is_deleted: false },
  { id: `DEMO-${id}-C`, transaction_id: `DEMO-${id}`, date, description, account: credit, debit: '0.0000', credit: amount, is_deleted: false },
]);
export const units = amount => BigInt(amount.replace('.', ''));
export function decimal(value) { const sign = value < 0n ? '-' : ''; const digits = (value < 0n ? -value : value).toString().padStart(5, '0'); return `${sign}${digits.slice(0, -4)}.${digits.slice(-4)}`; }
export function ledger({ from = '2026-07-01', to = company.as_of, account } = {}) {
  for (const date of [from, to]) if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) throw new Error('Use a valid YYYY-MM-DD date');
  if (from > to) throw new Error('The start must be on or before the end');
  if (account !== undefined && (typeof account !== 'string' || !entries.some(e => e.account === account))) throw new Error('Use an account from accounting_context');
  return entries.filter(e => !e.is_deleted && e.date >= from && e.date <= to && (!account || e.account === account)).sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}
export function trialBalance(args = {}) {
  const rows = ledger(args);
  const accounts = [...new Set(rows.map(e => e.account))].sort().map(account => {
    const evidence = rows.filter(e => e.account === account);
    const debits = evidence.reduce((sum, e) => sum + units(e.debit), 0n);
    const credits = evidence.reduce((sum, e) => sum + units(e.credit), 0n);
    return { account, debits: decimal(debits), credits: decimal(credits), balance: decimal(debits - credits), entry_ids: evidence.map(e => e.id) };
  });
  const debits = accounts.reduce((sum, a) => sum + units(a.debits), 0n);
  const credits = accounts.reduce((sum, a) => sum + units(a.credits), 0n);
  return { synthetic: true, currency: 'USD', basis: 'period_activity', accounts, totals: { debits: decimal(debits), credits: decimal(credits), difference: decimal(debits - credits), balanced: debits === credits } };
}
export function expenseChanges() {
  const accounts = [...new Set(entries.filter(e => e.account.startsWith('Expenses:')).map(e => e.account))].sort();
  const rows = accounts.map(account => {
    const previous_entries = ledger({ ...company.previous_period, account });
    const current_entries = ledger({ ...company.current_period, account });
    const sum = rows => rows.reduce((n, e) => n + units(e.debit) - units(e.credit), 0n);
    const previous = sum(previous_entries), current = sum(current_entries);
    return { account, previous: decimal(previous), current: decimal(current), change: decimal(current - previous), previous_entry_ids: previous_entries.map(e => e.id), current_entry_ids: current_entries.map(e => e.id) };
  });
  const previous = rows.reduce((n, r) => n + units(r.previous), 0n), current = rows.reduce((n, r) => n + units(r.current), 0n);
  return { synthetic: true, company, previous: decimal(previous), current: decimal(current), change: decimal(current - previous), rows, evidence: ledger().filter(e => e.account.startsWith('Expenses:')), interpretation: 'Software increased by USD 500.0000 from an added demo cloud compute entry. Fees increased by USD 150.0000. Workspace costs were unchanged. This describes the supplied entries and does not infer an unrecorded business cause.' };
}

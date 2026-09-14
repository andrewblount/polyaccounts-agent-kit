# Trust (client funds) three-way reconciliation

Goal: prove that the trust bank balance, the trust liability balance and the
sum of client trust subledger balances agree as of a date, and explain any
difference with ledger evidence. This workflow is read-only.

1. `accounting_context` with `{}`. Confirm the firm and home currency. Trust
   is always kept in the home currency.
2. `run_operation billing.trust.balances` with `{}`. Record each client's
   balance and the total. No client may be negative; if one is, that is a
   finding.
3. `trial_balance` cumulative through the reconciliation date. Read the trust
   bank asset account and the trust liability account balances as exact
   decimal strings.
4. `ledger_entries` for the period, filtered to the trust accounts, following
   every `next_cursor` with the same filters. Group by `source`
   (trust-deposit, trust-disbursement, trust-apply) and by client.
5. Compare: trust bank = trust liability = sum of client balances. Report each
   figure and the differences as exact decimals. For any difference, list the
   entries that explain it with IDs and dates.
6. Do not post corrections. Present findings to the responsible person with the
   evidence. Corrections go through the billing trust workflows with their own
   authorization and idempotency keys.

Report the date, the three balances, the per-client table, any negative or
unexplained items, and the entry IDs consulted. State whether the data is
synthetic.

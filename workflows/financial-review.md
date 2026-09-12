# Financial review

1. Establish the authorized company, reporting currency and exact period.
2. Retrieve trial_balance and ledger_entries for that period. Follow pagination
   without changing filters. Exclude soft-deleted records.
3. Reconcile totals to entries using decimal arithmetic. A zero trial-balance
   difference checks arithmetic, not completeness or accounting correctness.
4. Explain unusual movements and link each finding to entry IDs and dates.
5. Report missing evidence and unanswered questions. Do not invent invoices,
   exchange rates, tax treatments or business explanations.

When separately asked to change records through the hosted connector, read current
revisions, use a stable idempotency key, and use the documented workflow for the
operation. Retain the receipt. Follow existing approval and period controls.
Payment corrections use billing workflows and any required provider refund.

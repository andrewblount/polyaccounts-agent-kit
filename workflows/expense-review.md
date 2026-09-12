# Expense review

Use accounting_context to establish company, currency and available dates. In
the demo, this month means August 2026 and the comparison is July 2026.
Call expense_changes, then verify every cited ID using ledger_entries. Report
each category's previous amount, current amount and difference as exact decimal
strings. Include currency, both periods and entry IDs. Separate the description
of a recorded charge from an inferred business cause. State the synthetic scope.

For the hosted connector, discover the current tools and schema first. Read both
periods using ledger_entries, follow every next_cursor with the same filters and
aggregate expense debit less credit using decimal arithmetic. Do not assume the
demo-only expense_changes tool exists on the hosted connector. Verify both sides
of a posting before suggesting a correction. Never modify books during a review.

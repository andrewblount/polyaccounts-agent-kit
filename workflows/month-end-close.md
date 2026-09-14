# Month-end close (startup or small company)

Goal: reconcile the bank, review budget variance, route adjusting entries for
approval, refresh the forecast and close the period, leaving evidence at each
step. Read first, write only what the owner has authorized.

1. `accounting_context` with `{}`. Note home currency and the month to close
   (`startDate`, `endDate`).
2. `trial_balance` for the month (period activity) and cumulative (omit
   `startDate`). Keep exact decimal strings.
3. `run_operation reports.reconcile.start` with the bank `accountCode`,
   `statementDate` and `endBalance` from the statement. Then
   `reports.reconcile.auto-match` with the same arguments, read
   `reports.reconcile.rows`, and `reports.reconcile.complete` with the
   `sessionId` and the matched `ledgerIds`. Unmatched statement lines are
   findings for the owner, not entries to invent.
4. `run_operation budgets.list`, then `budgets.bva` with the active
   `versionId` (and `tag` for one entity). Report the three largest variances
   with account codes and amounts.
5. For each adjusting entry the owner authorizes, `run_operation
   approvals.je-request` with a `payload` describing date, amount, debit and
   credit accounts and description. Do not decide your own requests; a person
   uses `approvals.je-decide`. Wait for approval before treating the entry as
   posted.
6. `run_operation forecast.scenarios`, then `forecast.compute` with the
   `scenarioId`, then `forecast.accuracy`. If the owner authorizes,
   `forecast.promote`.
7. `reports.cash-flow`, `reports.cash-position` and `reports.cash-forecast`
   for the month. Cite the entry IDs behind any number the owner questions.
8. `run_operation reports.periods.set` with the period `name`, `status:
   "closed"` and a `reason`. Confirm with `reports.periods.closed`. A closed
   period rejects further postings; reopening is an explicit workflow with a
   reason.

Deliverable: a close memo listing company, currency, period, reconciliation
result (matched count, unmatched lines), budget variances, approvals requested
and their status, forecast accuracy, statement links and the period lock. Every
write's `idempotencyKey` and `operationId` should appear in the memo.

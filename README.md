# PolyAccounts agent kit

**Accounting for companies that work with AI agents.**

Evaluate exact balances and traceable ledger evidence before connecting a company.
This repository contains only public connector code and invented demonstration data.

| Connection | What it does | What you need |
| --- | --- | --- |
| Sandbox | A synthetic company with a starter chart of accounts, two months of activity and a 7-day full-access credential, created by the agent itself | `npx -y --package=https://github.com/andrewblount/polyaccounts-agent-kit/releases/download/v1.2.1/polyaccounts-mcp-1.2.1.tgz polyaccounts-mcp`, then call `create_sandbox` |
| Remote MCP | Streamable HTTP at `https://polyaccounts.com/mcp` with OAuth 2.1 | A client that supports remote MCP (Claude, ChatGPT, Cursor and others); an administrator approves once |
| Hosted connector (stdio) | Full company-scoped reads, creation, updates, soft deletion and documented accounting workflows | Node.js 20 or later and a credential from Settings, or a sandbox |
| Synthetic demo | Four read-only tools, two review prompts, an invented company | Node.js 20 or later, or an MCPB-compatible desktop client |

```sh
npx -y --package=https://github.com/andrewblount/polyaccounts-agent-kit/releases/download/v1.2.1/polyaccounts-mcp-1.2.1.tgz polyaccounts-mcp        # full connector. with no credential, call create_sandbox
npx -y --package=https://github.com/andrewblount/polyaccounts-agent-kit/releases/download/v1.2.1/polyaccounts-mcp-1.2.1.tgz polyaccounts-demo   # read-only synthetic demo
```

PolyAccounts is in early access. Evaluate with synthetic data in a sandbox or an
approved workspace. Do not use this release for real customer books or statutory
accounting. Reads are not metered. Limits and quotas: https://polyaccounts.com/limits.

## Workflows

Reusable, model-agnostic procedures in [`workflows/`](workflows/): expense review,
financial review, [matter billing cycle](workflows/matter-billing-cycle.md) for law
firms, [month-end close](workflows/month-end-close.md), and [trust three-way
reconciliation](workflows/trust-reconciliation.md).

## Install the demo

Download [polyaccounts-demo.mcpb](https://github.com/andrewblount/polyaccounts-agent-kit/releases/download/v1.2.1/polyaccounts-demo.mcpb)
and open it in an MCPB-compatible client. For Claude Desktop, use Settings,
Extensions, Advanced settings, Install Extension. Review the extension before installing.
No account, database, API key or network connection is needed after installation.

For a stdio client, use this pinned configuration.

```json
{
  "mcpServers": {
    "polyaccounts-demo": {
      "command": "npx",
      "args": [
        "--yes",
        "--package=https://github.com/andrewblount/polyaccounts-agent-kit/releases/download/v1.2.1/polyaccounts-mcp-1.2.1.tgz",
        "polyaccounts-demo"
      ]
    }
  }
}
```

Windows clients that cannot launch `npx` directly can install the package once and
configure `node` with the absolute path to `demo.mjs`. Client settings differ.

## Ask a useful question

> What changed in expenses this month? Show the entries.

The synthetic company is **Juniper Studio**. Its clock is **August 31, 2026**.
“This month” always means August compared with July, regardless of today's date.
Expenses rise from **USD 1200.0000** to **USD 1850.0000**, a **USD 650.0000** change.
Software accounts for 500.0000 and fees for 150.0000. Workspace costs do not change.

Use `accounting_context`, `expense_changes` and `ledger_entries`. Each category
includes stable evidence IDs. `trial_balance` includes both sides of postings.
The fixture uses exact integer arithmetic and returns decimal strings.

Run the working example without a model or external service.

```sh
git clone https://github.com/andrewblount/polyaccounts-agent-kit.git
cd polyaccounts-agent-kit
npm run example
npm test
```

The example starts the real MCP stdio process, retrieves the report and verifies
all seven expense entries through the connection. It fails if an evidence ID is
missing or the expected change does not reconcile. [Inspect the evidence in a browser](https://polyaccounts.com/demo).

## Connect with full accounting access

Download [polyaccounts-hosted.mcpb](https://github.com/andrewblount/polyaccounts-agent-kit/releases/download/v1.2.1/polyaccounts-hosted.mcpb)
for the hosted connector. In an approved workspace, an administrator opens Settings,
For AI agents, and issues a company credential. Enter it in the extension's sensitive
configuration field. The client can read and write that company's accounting data.

Or run the included standalone bridge with a protected token file.

```json
{
  "mcpServers": {
    "polyaccounts": {
      "command": "node",
      "args": ["/absolute/path/polyaccounts-mcp.mjs"],
      "env": {
        "POLYACCOUNTS_TOKEN_FILE": "/absolute/path/agent-token"
      }
    }
  }
}
```

Keep credentials out of prompts, logs, screenshots, source control and issue reports.
Use operating-system file permissions or a secret manager. The hosted bridge talks
only to the configured HTTPS API and refuses redirects. Credentials can be revoked.

Start with `accounting_context` and confirm the company. Discover tools and operation
schemas before acting. Record updates use revisions. Every write uses one stable
idempotency key and a durable receipt. An uncertain result must be reconciled before
trying a different action. Soft deletion preserves history. Approval, period and
payment controls still apply. Recording a payment does not move bank funds.

The demo-only `expense_changes` tool is not in the hosted catalog. For hosted expense
reviews, retrieve both periods and every ledger page, then aggregate exact values.
Do not sum rounded display amounts or infer business causes without evidence.

- [Full setup and accounting contract](https://polyaccounts.com/agents.md)
- [Generated hosted tools](https://polyaccounts.com/agent-tools.json)
- [Supported workflows](https://polyaccounts.com/agent-operations.json)
- [Expense review workflow](workflows/expense-review.md)
- [Financial review workflow](workflows/financial-review.md)
- [Early-access pricing](https://polyaccounts.com/pricing)
- [Request an integration evaluation](https://polyaccounts.com/integration-partners)

## Privacy Policy

The demo reads only its bundled fixture, makes no network calls and writes no files.
The hosted connector sends requested accounting operations to the company API and
returns results to your chosen client. That client or its model provider may process
the results under its own terms. Review the [PolyAccounts privacy policy](https://polyaccounts.com/privacy).
Support issues must contain only synthetic examples. Report credential or security
issues privately to support@polyaccounts.com, not in a public GitHub issue.

The demo stores no accounting inputs or usage data and has no telemetry. Its fixture
is bundled in the installation. Your MCP client may retain conversations according
to its own settings. The hosted service retains company records and write receipts
under its privacy policy. Contact support@polyaccounts.com with privacy requests.

This kit is MIT licensed. The license covers this repository, not the hosted service.
Directory acceptance and recommendations are not guaranteed.

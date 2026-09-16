# n8n-nodes-chatagent

This is an n8n community node. It lets you use [ChatAgent.so](https://www.chatagent.so) in your n8n workflows.

ChatAgent.so is a CRM + AI inbox platform (contacts, companies, deals/pipelines, conversations) with an AI agent stack that answers from a connected knowledge base. This node wraps chatagent-api's authenticated REST endpoints so workflows can sync ChatAgent data with tools like Notion, Xero, and Google Sheets via their existing n8n nodes — and, since the node is `usableAsTool`, so an n8n AI Agent can call ChatAgent operations directly as tools.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Usage](#usage)
[Examples](#examples)
[Error Handling](#error-handling)
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

Every operation follows n8n's declarative-routing pattern (resource → operation → routing), so no custom `execute()` method is involved.

- **Contact** — Create / Get / Get Many / Update / Delete against `/contacts`. Get Many uses page-based pagination and exposes filters (assignee, deal activity, pipeline/stage, tag, company, search, sort).
- **Company** — Create / Get / Get Many / Update / Delete against `/companies`, same shape as Contact. Requires the org's `company_management` plan feature.
- **Pipeline** — read-only: Get Many (`/pipelines`) and Get Stages, for looking up `pipelineId`/`stageId` before working with deals.
- **Deal** — Create / Get / Get Many / Update / Move / Delete against `/pipelines/:pipelineId/deals`. Move is a separate operation from Update because it triggers pipeline automation. Get Many uses cursor-based pagination.
- **Conversation** — Get / Get Many / Get Messages / Send Message / Update Status / Assign / Claim / Mark as Read / Retry Message / Get Unread Count against `/conversations`, for working with the inbox. Get Many and Get Messages use cursor-based pagination.

Pipeline, stage, tag, and assignee dropdowns fill dynamically from your organization's data — no ID copy-pasting.

Not yet covered: knowledge base (documents/products), AI agent configuration, deal activities/automation rules, and conversation media/search/delete — see [lat.md/nodes.md](lat.md/nodes.md) for the full breakdown of what's in and out of scope.

## Credentials

Requires a **ChatAgent API** credential:

- **Base URL** — defaults to `https://api.chatagent.so`; override for self-hosted or staging deployments.
- **API Key** — a long-lived API key scoped to a ChatAgent organization, sent as an `x-api-key` header.

## Compatibility

Tested against n8n's `n8n-workflow` API version 1. Built with `@n8n/node-cli`.

## Usage

Every operation exposes an `action` and `description` used by n8n's AI Agent to pick the right tool — the whole node can be used as a tool without extra configuration.

## Examples

**Sync new contacts to a Google Sheet**
`Manual Trigger` → `ChatAgent: Contact / Get Many` (with a Filters → Search value) → `Google Sheets: Append`

**Move a deal to the next pipeline stage from an external event**
`Webhook` → `ChatAgent: Pipeline / Get Stages` (look up the target `stageId`) → `ChatAgent: Deal / Move`

**Reply to a conversation from an AI Agent**
`Chat Trigger` → `AI Agent` (with the ChatAgent node added as a tool, `usableAsTool: true`) → the agent calls `Conversation / Send Message` directly to reply, no separate HTTP node needed.

## Error Handling

Errors surface as standard n8n HTTP errors (status code + response body); the most common ones:

| Status | Cause | Fix |
| --- | --- | --- |
| 401 | API Key missing or revoked | Issue a new key and update the credential. |
| 403 on Company operations | Org's plan doesn't include the `company_management` feature | Upgrade the ChatAgent plan, or avoid the Company resource. |
| 404 | Wrong ID (`contactId`, `pipelineId`, `dealId`, `conversationId`, …) or wrong Base URL for a self-hosted instance | Verify the ID and the credential's Base URL. |
| 429 | Rate limited | The node has no built-in retry/backoff — add an n8n `Wait` node + retry, or lower request concurrency in the workflow. |
| Timeout | Slow response from chatagent-api | Requests time out after 30s by default (`requestDefaults.timeout`); check chatagent-api status if this recurs. |

Use each node's **Continue On Fail** setting to keep a workflow running past a single failed item instead of aborting the whole execution.

**Duplicate Contacts/Companies from AI Agent tool use:** Contact Create and Company Create have no dedupe/upsert — each call always inserts a new record. When the ChatAgent node is used as an AI Agent tool, a model that retries or re-plans mid-turn can call Create several times in one execution, producing duplicate records. Their tool descriptions now tell the agent to check Get Many with the Search filter first, but a workflow that must guarantee no duplicates should still search-then-create explicitly with an `IF` node, or dedupe server-side.

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [ChatAgent.so](https://www.chatagent.so)

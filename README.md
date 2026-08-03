# n8n-nodes-chatagent

This is an n8n community node. It lets you use [ChatAgent.so](https://www.chatagent.so) in your n8n workflows.

ChatAgent.so is a CRM + AI inbox platform (contacts, companies, deals/pipelines, conversations) with an AI agent stack that answers from a connected knowledge base. This node wraps chatagent-api's authenticated REST endpoints so workflows can sync ChatAgent data with tools like Notion, Xero, and Google Sheets via their existing n8n nodes — and, since the node is `usableAsTool`, so an n8n AI Agent can call ChatAgent operations directly as tools.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Usage](#usage)
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

Every operation follows n8n's declarative-routing pattern (resource → operation → routing), so no custom `execute()` method is involved.

- **Contact** — Create / Get / Get Many / Update / Delete against `/contacts`. Get Many uses page-based pagination.
- **Company** — Create / Get / Get Many / Update / Delete against `/companies`, same shape as Contact. Requires the org's `company_management` plan feature.
- **Pipeline** — read-only: Get Many (`/pipelines`) and Get Stages, for looking up `pipelineId`/`stageId` before working with deals.
- **Deal** — Create / Get / Get Many / Update / Move / Delete against `/pipelines/:pipelineId/deals`. Move is a separate operation from Update because it triggers pipeline automation. Get Many uses cursor-based pagination.
- **Conversation** — Get / Get Many / Get Messages / Send Message / Update Status / Assign / Claim against `/conversations`, for working with the inbox. Get Many and Get Messages use cursor-based pagination.

Not yet covered: knowledge base (documents/products/tags), AI agent configuration, deal activities/automation rules, and conversation media/search/retry — see [lat.md/nodes.md](lat.md/nodes.md) for the full breakdown of what's in and out of scope.

## Credentials

Requires a **ChatAgent API** credential:

- **Base URL** — defaults to `https://api.chatagent.so`; override for self-hosted or staging deployments.
- **Access Token** — a bearer token for a ChatAgent organization user. This is a short-lived JWT issued by ChatAgent auth, not a long-lived API key, so it will need periodic renewal.

## Compatibility

Tested against n8n's `n8n-workflow` API version 1. Built with `@n8n/node-cli`.

## Usage

Every operation exposes an `action` and `description` used by n8n's AI Agent to pick the right tool — the whole node can be used as a tool without extra configuration.

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [ChatAgent.so](https://www.chatagent.so)

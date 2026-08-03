# Nodes

n8n community nodes for ChatAgent.so. Each node follows n8n's declarative-routing pattern: a resource dropdown, an operation dropdown per resource, and per-field `routing` blocks that build the HTTP request — no custom `execute()` method needed.

## ChatAgent node

[[nodes/ChatAgent/ChatAgent.node.ts#ChatAgent]] wraps chatagent-api's authenticated REST endpoints as n8n actions, so workflows can sync ChatAgent CRM data with tools like Notion, Xero, and Google Sheets via their existing n8n nodes.

See chatagent-api's own `lat.md/api` docs for the full HTTP surface this node draws from.

The node sets `usableAsTool: true`, so the whole node (every resource/operation) is directly pickable as a tool by n8n's AI Agent node — no separate tool-node wrapper needed. Each operation's `action` + `description` (set per-option in every resource's `index.ts`, e.g. Conversation's Send Message: "Send a text or internal-note message on a conversation") is what the LLM sees when choosing which operation to call, so keep those strings accurate and specific when adding new operations.

Auth is [[credentials/ChatAgentApi.credentials.ts#ChatAgentApi]] — a bearer-token credential with a configurable Base URL (defaults to `https://api.chatagent.so`), since the token is a short-lived Better Auth JWT scoped to one organization, not a long-lived API key. The node's `requestDefaults.baseURL` reads from `{{$credentials.baseUrl}}` so self-hosted or staging deployments can override it.

All chatagent-api responses share the envelope `{ message, data }`; every operation's routing sets `output.postReceive` with a `rootProperty` extractor (`data` for single-entity operations, `data.items` for list operations) to unwrap it before n8n sees the result.

### Contact resource

[[nodes/ChatAgent/resources/contact/index.ts#contactDescription]] covers Create/Get/Get Many/Update/Delete against chatagent-api's `/contacts` routes.

Get Many implements page-based pagination (`page`/`limit` query params, not offset) via a `generic`-type `routing.operations.pagination` on the "Return All" field, since chatagent-api's list endpoints return `{ items, total, page, limit }` rather than a link header.

Only the fields most workflows need are exposed (displayName, companyId, email, phone, avatarUrl, tagNames, customFields) — the list endpoint's full filter set (assignee/pipeline/deal-activity filters) is intentionally left out of v1 to keep the node surface small; add filters as `getAll.ts` options if a workflow needs them.

### Company resource

[[nodes/ChatAgent/resources/company/index.ts#companyDescription]] covers Create/Get/Get Many/Update/Delete against chatagent-api's `/companies` routes, same shape as the Contact resource (name/domain/phone/email/websiteUrl/customFields fields, same page-based Get Many pagination).

Companies are gated behind the `company_management` product feature on the chatagent-api side — orgs without that plan feature get a 403 from every company operation, surfaced to the workflow as a regular HTTP error since this node has no feature-flag pre-check of its own.

### Pipeline resource

[[nodes/ChatAgent/resources/pipeline/index.ts#pipelineDescription]] is read-only: Get Many (`/pipelines`) and Get Stages (`/pipelines/:pipelineId/stages`). It exists so a workflow can look up `pipelineId`/`stageId` values before calling the Deal resource — pipeline/stage CRUD itself is out of scope for v1.

### Deal resource

[[nodes/ChatAgent/resources/deal/index.ts#dealDescription]] covers Create/Get/Get Many/Update/Move/Delete against chatagent-api's `/pipelines/:pipelineId/deals` routes.

Every deal operation requires `pipelineId` as a separate top-level field since deals are always addressed relative to a pipeline, not as a flat `/deals/:id` resource.

Move is a distinct operation rather than a field on Update, mirroring chatagent-api's own `PATCH .../deals/:dealId/move` — moving a deal is a stage-placement action (`stageId` + `stageSortOrder`, optionally a different target pipeline) with different side effects (pipeline automation reacts to moves) than an ordinary field update. Calling Update does not trigger automation rules; only Move does — see chatagent-api's `lat.md/api/crm#Pipelines & deals` for why.

Get Many uses cursor-based pagination (`{ items, hasMore, nextCursor }`), unlike Contact/Company's page-based pagination — its "Return All" `routing.operations.pagination` checks `$response.body.data.hasMore` and re-sends `$response.body.data.nextCursor` as the `cursor` query param, instead of incrementing a `page` number.

Deal activities and automation rules (the other two nested resources under `/pipelines`) are not yet covered.

### Conversation resource

[[nodes/ChatAgent/resources/conversation/index.ts#conversationDescription]] covers the inbox: Get/Get Many/Get Messages/Send Message/Update Status/Assign/Claim against chatagent-api's `/conversations` routes.

Get Many and Get Messages both use the same cursor-based `{ items|messages, hasMore, nextCursor }` pagination as the Deal resource. Send Message's response is double-wrapped (`{ data: { message: {...} } }`), so its `postReceive` unwraps `data.message` specifically rather than the usual `data`.

Assign sends `userId: null` when the field is left empty, matching chatagent-api's schema where unassigning requires an explicit `null` rather than an omitted field — Claim is a separate no-body operation for the "assign to me" case rather than reusing Assign with the current user's ID, since the API doesn't expose "who am I" to the node for that purpose.

Not covered: media messages/upload-url flow, message retry, message/global search, mark-as-read, delete, and the admin-only agent-insight route — the CRM/messaging domains most relevant to n8n workflow use cases (contacts, companies, deals, sending/reading messages) come first.

Other chatagent-api domains (knowledge base, agents) are not yet covered — add a sibling `resources/<name>/` directory following the same index.ts + operation-file pattern when needed.

## GitHub Issues node

[[nodes/GithubIssues/GithubIssues.node.ts#GithubIssues]] is the pre-existing reference implementation this package's structure is modeled on — same resource/operation/routing pattern, against the GitHub REST API instead of chatagent-api.

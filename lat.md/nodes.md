# Nodes

n8n community nodes for ChatAgent.so. Each node follows n8n's declarative-routing pattern: a resource dropdown, an operation dropdown per resource, and per-field `routing` blocks that build the HTTP request — no custom `execute()` method.

## ChatAgent node

[[nodes/ChatAgent/ChatAgent.node.ts#ChatAgent]] wraps chatagent-api's authenticated REST endpoints as n8n actions, so workflows can sync ChatAgent CRM data with tools like Notion, Xero, and Google Sheets via their existing n8n nodes.

See chatagent-api's own `lat.md/api` docs for the full HTTP surface this node draws from.

The node sets `usableAsTool: true`, so the whole node (every resource/operation) is directly pickable as a tool by n8n's AI Agent node — no separate tool-node wrapper needed. Each operation's `action` + `description` (set per-option in every resource's `index.ts`, e.g. Conversation's Send Message: "Send a text or internal-note message on a conversation") is what the LLM sees when choosing which operation to call, so keep those strings accurate and specific when adding new operations. The node-level `description` is the same surface at tool-picker level: it enumerates the resources and domains ("Manage ChatAgent.so CRM contacts, companies, pipelines, and deals, and work the inbox: …") so the agent can match the tool to the request at all; `documentationUrl` points the n8n UI's Docs link at ChatAgent's homepage.

The node is declarative — routing blocks build every HTTP request, there is no `execute()` method — with exactly one piece of hand-written code: [[nodes/ChatAgent/ChatAgent.node.ts#ChatAgent]]`'s `methods.loadOptions`, which fills the dynamic options dropdowns by calling chatagent-api. Four loaders exist: `getOrgMembers` (Assign's User ID, from `GET /auth/org-members` — each member's `userId` is the option value, `user.name (user.email)` the label), `getPipelines` (`GET /pipelines`, non-archived only, `isDefault` shown as a description), `getStages` (`GET /pipelines/:pipelineId/stages`, re-fetched whenever the pipeline changes via `loadOptionsDependsOn`), and `getTags` (`GET /tags?limit=100`). All go through a shared `loadOptionsApiGet` helper that authenticates via `helpers.httpRequestWithAuthentication`, so the `x-api-key` header comes from the credential's own `authenticate` config, not a hand-set header — this repo's ESLint `no-http-request-with-manual-auth` rule enforces that.

Auth is [[credentials/ChatAgentApi.credentials.ts#ChatAgentApi]] — an API-key credential with a configurable Base URL (defaults to `https://api.chatagent.so`). The key is long-lived and scoped to one organization, sent as `x-api-key: {{$credentials.apiKey}}` — chatagent-api's `ApiKeyOrJwtAuthGuard` reads `x-api-key` for API keys and reserves `Authorization: Bearer` for short-lived Better Auth JWTs, so the two headers must not both be set. The node's `requestDefaults.baseURL` reads from `{{$credentials.baseUrl}}` so self-hosted or staging deployments can override it; the expression also defaults an empty Base URL to production and strips trailing slashes, since either would otherwise produce broken or double-slash request URLs. The credential's `test` request hits chatagent-api's `GET /auth/org-context` — a cheap whoami that validates the key and org membership without returning any org data (previously it hit `/contacts?limit=1`, which worked but pulled real records). `requestDefaults.timeout` is a fixed 30s — there's no per-operation override or automatic retry/backoff on 429, so a workflow hitting chatagent-api rate limits needs its own `Wait` + retry (see README's Error Handling section).

All chatagent-api responses share the envelope `{ message, data }`; every operation's routing sets `output.postReceive` with a `rootProperty` extractor (`data` for single-entity operations, `data.items` for list operations) to unwrap it before n8n sees the result.

### Contact resource

[[nodes/ChatAgent/resources/contact/index.ts#contactDescription]] covers Create/Get/Get Many/Update/Delete against chatagent-api's `/contacts` routes.

Get Many implements page-based pagination (`page`/`limit` query params, not offset) via a `generic`-type `routing.operations.pagination` on the "Return All" field, since chatagent-api's list endpoints return `{ items, total, page, limit }` rather than a link header.

Get Many's Filters collection exposes the list endpoint's main filter set — `companyId`, `search`, `tagId`, `assigneeFilter` (me/unassigned), `assigneeUserId`, `dealFilter` (has_deal/no_deal), `dealActivityPreset` (active_7d/active_30d/none/stale_30d), `pipelineId`, `stageId`, plus `sortBy`/`sortOrder` — mirroring the query params chatagent-api's contact list DTO accepts. The multi-value variants (`tagIds`, `pipelineIds`, `stageIds`, `assigneeUserIds`, …) and `archived` are still unexposed; add them as `getAll.ts` options if a workflow needs them.

### Company resource

[[nodes/ChatAgent/resources/company/index.ts#companyDescription]] covers Create/Get/Get Many/Update/Delete against chatagent-api's `/companies` routes, same shape as the Contact resource (name/domain/phone/email/websiteUrl/customFields fields, same page-based Get Many pagination).

Companies are gated behind the `company_management` product feature on the chatagent-api side — orgs without that plan feature get a 403 from every company operation, surfaced to the workflow as a regular HTTP error since this node has no feature-flag pre-check of its own.

### Pipeline resource

[[nodes/ChatAgent/resources/pipeline/index.ts#pipelineDescription]] is read-only: Get Many (`/pipelines`) and Get Stages (`/pipelines/:pipelineId/stages`). It exists so a workflow can look up `pipelineId`/`stageId` values before calling the Deal resource — pipeline/stage CRUD itself is out of scope for v1.

Get Stages' `pipelineId` is a dynamic dropdown filled by the node's `getPipelines` loader (see the node section above), so the lookup can happen without copy-pasting IDs.

### Deal resource

[[nodes/ChatAgent/resources/deal/index.ts#dealDescription]] covers Create/Get/Get Many/Update/Move/Delete against chatagent-api's `/pipelines/:pipelineId/deals` routes.

Every deal operation requires `pipelineId` as a separate top-level field since deals are always addressed relative to a pipeline, not as a flat `/deals/:id` resource. It's a dynamic dropdown (node's `getPipelines` loader) in every deal operation file, and the `stageId` fields on Create and Move are stage dropdowns (`getStages`) with `loadOptionsDependsOn: ['pipelineId']` so they re-fetch when the pipeline changes; Move's `targetPipelineId` is a pipeline dropdown too.

Move is a distinct operation rather than a field on Update, mirroring chatagent-api's own `PATCH .../deals/:dealId/move` — moving a deal is a stage-placement action (`stageId` + `stageSortOrder`, optionally a different target pipeline) with different side effects (pipeline automation reacts to moves) than an ordinary field update. Calling Update does not trigger automation rules; only Move does — see chatagent-api's `lat.md/api/crm#Pipelines & deals` for why.

Get Many uses cursor-based pagination (`{ items, hasMore, nextCursor }`), unlike Contact/Company's page-based pagination — its "Return All" `routing.operations.pagination` checks `$response.body.data.hasMore` and re-sends `$response.body.data.nextCursor` as the `cursor` query param, instead of incrementing a `page` number.

Deal activities and automation rules (the other two nested resources under `/pipelines`) are not yet covered.

### Conversation resource

[[nodes/ChatAgent/resources/conversation/index.ts#conversationDescription]] covers the inbox: Get/Get Many/Get Messages/Send Message/Update Status/Assign/Claim/Mark as Read/Retry Message/Get Unread Count against chatagent-api's `/conversations` routes.

Mark as Read posts to `/conversations/:id/read` (response is the `{ data: { read: true } }` marker), Retry Message posts to `/conversations/:id/messages/:messageId/retry` and unwraps the same double-wrapped `{ data: { message } }` envelope as Send Message, and Get Unread Count hits `/conversations/unread-count` (returns `data.count`) — the one operation that takes no IDs, useful as a trigger-branch check in polling workflows.

Get Many and Get Messages both use the same cursor-based `{ items|messages, hasMore, nextCursor }` pagination as the Deal resource. Send Message's response is double-wrapped (`{ data: { message: {...} } }`), so its `postReceive` unwraps `data.message` specifically rather than the usual `data`. Both Get Many's `tagId` filter and Contact Get Many's are dynamic dropdowns filled by the node's `getTags` loader.

Assign's User ID is a dynamic options dropdown filled by `methods.loadOptions.getOrgMembers` (see the node section above) — chatagent-api's `GET /auth/org-members` returns members with nested `user.name`/`user.email`, so the label shows both and the value is `userId`. Assign still sends `userId: null` when the field is left empty, matching chatagent-api's schema where unassigning requires an explicit `null` rather than an omitted field — Claim is a separate no-body operation for the "assign to me" case rather than reusing Assign with the current user's ID, since the API doesn't expose "who am I" to the node for that purpose.

Not covered: media messages/upload-url flow, message/global search, conversation delete, and the admin-only agent-insight route — the CRM/messaging domains most relevant to n8n workflow use cases (contacts, companies, deals, sending/reading messages) come first.

Other chatagent-api domains (knowledge base, agents) are not yet covered — add a sibling `resources/<name>/` directory following the same index.ts + operation-file pattern when needed.

## Testing

The `test/` directory holds vitest coverage over the declarative node/credential config: structural checks (every operation has a usable `action`/`description`, valid `routing.request`) plus the three places with real hand-written logic.

Those three are the pagination continue/cursor expressions (page-based for Contact/Company, cursor-based for Deal/Conversation), the Assign-conversation empty-to-`null` value expression, and the Base URL normalization expression (default-empty-to-production + trailing-slash strip, shared by `requestDefaults.baseURL` and the credential test). Since `routing` expression strings (`={{ ... }}`) are evaluated by n8n's own expression engine at runtime, not by this package, tests don't `eval`/`new Function` them — this repo's ESLint config (`@n8n/community-nodes/no-dangerous-functions`) forbids that anyway. Instead each test asserts the expression's exact source string (catches accidental edits) alongside a hand-written pure-JS function mirroring its intended semantics (catches logic regressions) — see [[test/pagination.test.ts]] for the pattern. The `methods.loadOptions` helpers are only asserted for wiring — every `loadOptionsMethod` used by a field must name a loader that actually exists, and the stage dropdowns must re-fetch on pipeline change — in [[test/load-options.test.ts]], since exercising their HTTP calls needs a live credential.

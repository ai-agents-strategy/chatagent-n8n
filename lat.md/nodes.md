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

Create has no dedupe/upsert — chatagent-api's `POST /contacts` always inserts, so calling Create twice with the same email/phone makes two contacts. This bit an AI Agent workflow where a retried tool call created many duplicate contacts in one execution; the fix (given the node has no `execute()` to add a pre-check in) is in Create's `action`/`description` string in [[nodes/ChatAgent/resources/contact/index.ts#contactDescription]] — that's the text the LLM tool-picker reads, so it now tells the agent to search by email/phone via Get Many first.

### Company resource

[[nodes/ChatAgent/resources/company/index.ts#companyDescription]] covers Create/Get/Get Many/Update/Delete against chatagent-api's `/companies` routes, same shape as the Contact resource (name/domain/phone/email/websiteUrl/customFields fields, same page-based Get Many pagination).

Companies are gated behind the `company_management` product feature on the chatagent-api side — orgs without that plan feature get a 403 from every company operation, surfaced to the workflow as a regular HTTP error since this node has no feature-flag pre-check of its own.

Same no-dedupe/upsert caveat as Contact Create applies here — see above.

Address is not a field on Company — chatagent-api models it as a separate `addresses` table (shared with Contact, one-to-many via `companyId`/`contactId` FK), so it's exposed as four extra operations folded into this same resource rather than fields on Create/Update: `createAddress`/`getAddresses`/`updateAddress`/`deleteAddress` in [[nodes/ChatAgent/resources/company/index.ts#companyDescription]], routing to `/companies/:companyId/addresses[/:addressId]`. Folded rather than split into a separate top-level resource because every address operation requires a `companyId` anyway (same nested-under-parent shape as Deal's `pipelineId`), unlike Contact/Company which are independently listable.

- [[nodes/ChatAgent/resources/company/createAddress.ts#companyCreateAddressDescription]] — `companyId` plus an "Address Fields" collection (label, line1, line2, city, state, postalCode, country, formattedAddress, isPrimary, latitude, longitude, metadata JSON), mirroring chatagent-api's `CreateAddressDto`. `isPrimary` defaults to unset — the API auto-promotes the first address created for an owner to primary.
- [[nodes/ChatAgent/resources/company/getAddresses.ts#companyGetAddressesDescription]] — `companyId` only. The response is a bare array under `data` (not `data.items` — chatagent-api doesn't paginate an owner's address list), so its `postReceive` extractor in `index.ts` differs from every other Company operation.
- [[nodes/ChatAgent/resources/company/updateAddress.ts#companyUpdateAddressDescription]] — `companyId` + `addressId`, same field set as Create but inside an "Update Fields" collection (only fields the caller sets are patched).
- [[nodes/ChatAgent/resources/company/deleteAddress.ts#companyDeleteAddressDescription]] — `companyId` + `addressId`, no body.

Geocoding fields (`geocodeStatus`, `geocodeProvider`, `geocodePlaceId`, `geocodedAt`) are deliberately not exposed — chatagent-api resolves them server-side (background geocode on create/update when `line1`/`city`/etc text changes and no manual lat/lng is given), so surfacing them would let a workflow set inconsistent state. Write operations (create/update/delete) require the `manage_profiles` org permission on top of the `company_management` feature gate above; Get Addresses only needs base access.

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

## ChatAgent Search Customer node

[[nodes/ChatAgentSearchCustomer/ChatAgentSearchCustomer.node.ts#ChatAgentSearchCustomer]] is a single-purpose sibling node — `GET /contacts?search=...` only — that exists to give the n8n AI Agent a narrow, crisp tool instead of making it navigate the main ChatAgent node's full Resource/Operation surface.

The main [[nodes/ChatAgent/ChatAgent.node.ts#ChatAgent]] node's `usableAsTool: true` already makes it pickable by the AI Agent, but as *one* tool covering every resource and operation — the LLM has to fill Resource, Operation, and every field itself, which is close to the generic `action`/`payload` shape that's hard for an LLM to use reliably. A dedicated node per common AI action avoids that: this node exposes only `Query` (required, free-text over name/email/phone) and `Limit` (default 50) as fillable parameters — everything else the request needs (`GET /contacts`, the `data.items` response unwrap) is fixed on a `type: 'hidden'` field, invisible to both the n8n UI and the AI Agent's tool schema.

It shares the same `chatAgentApi` credential and `requestDefaults.baseURL` expression as the main node (see above), and is registered as its own entry in `package.json`'s `n8n.nodes` array and its own `ChatAgentSearchCustomer.node.json` codex file, since n8n treats each node type as a separate file rather than a resource within one node. Add further single-purpose AI-tool nodes the same way rather than growing this one node past its one action.

## ChatAgent Conversation History node

[[nodes/ChatAgentConversationHistory/ChatAgentConversationHistory.node.ts#ChatAgentConversationHistory]] is a single-purpose sibling node — `GET /conversations/:id/messages` only — built the same way as [[nodes/ChatAgentSearchCustomer/ChatAgentSearchCustomer.node.ts#ChatAgentSearchCustomer]].

A hidden `operation` field carries the fixed request and `data.messages` unwrap, leaving only `Conversation ID` (required) and `Limit` (default 50) fillable by the AI Agent. It intentionally does not expose the main Conversation resource's `returnAll`/cursor pagination or `direction` field — an AI tool call is a single request-response turn, so unbounded pagination isn't a fit; an agent that needs older messages should raise `Limit` or call again with judgement, not auto-paginate.

## ChatAgent Send Message node

[[nodes/ChatAgentSendMessage/ChatAgentSendMessage.node.ts#ChatAgentSendMessage]] is a single-purpose sibling node — `POST /conversations/:id/messages` only — exposing just `Conversation ID` and `Message` to the AI Agent.

Its hidden `operation` field fixes `messageType: 'text'` via a static `routing.send.value` (the same "field with a literal `send.value` rather than the field's own value" pattern Contact Get Many's `Return All` pagination uses), so this tool can only ever send a customer-visible message — never silently write an internal note — unlike the main node's Send Message operation, which exposes `messageType` as a choice.

Both new nodes need a `Conversation ID`, but no exposed lookup goes customer → conversation directly: chatagent-api's conversations list doesn't accept a `contactId` filter (only [[nodes/ChatAgent/resources/contact/index.ts#contactDescription]]'s Get Many search does), so a workflow/agent chaining Search Customer → Conversation History today needs a conversation ID from elsewhere (e.g. Conversation Get Many's own `Search`, or a value already in context) — this is a chatagent-api-side gap, not something to work around in this node package.

The tools.md roadmap's other two proposed tools — Relationship Memory and Create Follow-up — have no backing chatagent-api endpoint yet (no `follow-up` or `memory` concept exists in its modules as of this writing); building either here would call a route that doesn't exist. They stay unbuilt until chatagent-api adds the underlying feature.

## Testing

The `test/` directory holds vitest coverage over the declarative node/credential config: structural checks (every operation has a usable `action`/`description`, valid `routing.request`) plus the three places with real hand-written logic.

Those three are the pagination continue/cursor expressions (page-based for Contact/Company, cursor-based for Deal/Conversation), the Assign-conversation empty-to-`null` value expression, and the Base URL normalization expression (default-empty-to-production + trailing-slash strip, shared by `requestDefaults.baseURL` and the credential test). Since `routing` expression strings (`={{ ... }}`) are evaluated by n8n's own expression engine at runtime, not by this package, tests don't `eval`/`new Function` them — this repo's ESLint config (`@n8n/community-nodes/no-dangerous-functions`) forbids that anyway. Instead each test asserts the expression's exact source string (catches accidental edits) alongside a hand-written pure-JS function mirroring its intended semantics (catches logic regressions) — see [[test/pagination.test.ts]] for the pattern. The `methods.loadOptions` helpers are only asserted for wiring — every `loadOptionsMethod` used by a field must name a loader that actually exists, and the stage dropdowns must re-fetch on pipeline change — in [[test/load-options.test.ts]], since exercising their HTTP calls needs a live credential.

[[test/chatagent-search-customer-node.test.ts]] covers the Search Customer node the same way as [[test/chatagent-node.test.ts]] covers the main node, plus asserting the hidden operation field's fixed `GET /contacts` routing and that only `query`/`limit` are non-hidden (i.e. exposed to the AI Agent tool schema). [[test/chatagent-conversation-history-node.test.ts]] and [[test/chatagent-send-message-node.test.ts]] follow the identical pattern for their own hidden-field routing and fillable-parameter set.

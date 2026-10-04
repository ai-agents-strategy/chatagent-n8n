import { describe, expect, it, vi } from 'vitest';
import type { ILoadOptionsFunctions, INodeProperties, INodePropertyMode } from 'n8n-workflow';
import { ChatAgent } from '../nodes/ChatAgent/ChatAgent.node';
import { contactDescription } from '../nodes/ChatAgent/resources/contact';
import { companyDescription } from '../nodes/ChatAgent/resources/company';
import { dealDescription } from '../nodes/ChatAgent/resources/deal';
import { conversationDescription } from '../nodes/ChatAgent/resources/conversation';
import { ID_FIELD_SPECS, UUID_REGEX, type IdFieldName } from '../nodes/ChatAgent/shared/idLocator';

/**
 * v2 path-ID fields are resource locators (see lat.md/nodes.md). Their
 * "From List" mode only shows records from the API key's own org, and the
 * By ID / By URL modes reject malformed IDs before any request is sent.
 */

const node = new ChatAgent();
const listSearchMethods = Object.keys(node.methods?.listSearch ?? {});
const allFields = [...contactDescription, ...companyDescription, ...dealDescription, ...conversationDescription];
const idNames = Object.keys(ID_FIELD_SPECS) as IdFieldName[];

const isV2 = (f: INodeProperties) => JSON.stringify(f.displayOptions?.show?.['@version']) === '[{"_cnd":{"gte":2}}]';
const isV1 = (f: INodeProperties) => JSON.stringify(f.displayOptions?.show?.['@version']) === '[1]';

function mode(field: INodeProperties, name: string): INodePropertyMode | undefined {
	return field.modes?.find((m) => m.name === name);
}

function regexOf(m: INodePropertyMode | undefined): string {
	const rule = m?.validation?.[0] as { properties: { regex: string } } | undefined;
	return rule?.properties.regex ?? '';
}

function extract(regex: string, url: string): string | undefined {
	return new RegExp(regex).exec(url)?.[1];
}

describe('node versioning', () => {
	it('defaults new nodes to v2 while still loading v1 workflows', () => {
		expect(node.description.version).toEqual([1, 2]);
		expect(node.description.defaultVersion).toBe(2);
	});
});

describe('path-ID fields', () => {
	const idFields = allFields.filter((f) => idNames.includes(f.name as IdFieldName) && f.required);

	it('every v2 ID field has a v1 string twin with the same name and operations', () => {
		const v2 = idFields.filter(isV2);
		expect(v2.length).toBe(24);
		const showWithoutVersion = (f: INodeProperties) =>
			JSON.stringify({ ...f.displayOptions!.show!, '@version': undefined });
		for (const field of v2) {
			const twin = idFields.find(
				(f) => isV1(f) && f.name === field.name && showWithoutVersion(f) === showWithoutVersion(field),
			);
			expect(twin?.type, `${field.name} for ${showWithoutVersion(field)}`).toBe('string');
		}
		expect(idFields.filter(isV1).length).toBe(v2.length);
	});

	it.each(idFields.filter(isV2).map((f) => [f.name, f]))('%s v2 is a resource locator defaulting to From List', (_n, field) => {
		const f = field as INodeProperties;
		expect(f.type).toBe('resourceLocator');
		expect(f.default).toEqual({ mode: 'list', value: '' });
		expect(f.modes?.[0]?.name).toBe('list');
		const method = f.modes?.[0]?.typeOptions?.searchListMethod;
		expect(listSearchMethods).toContain(method);
		expect(regexOf(mode(f, 'id'))).toBe(UUID_REGEX);
	});

	it('deal and address lists re-run when their parent changes', () => {
		for (const f of idFields.filter((x) => isV2(x) && x.name === 'dealId')) {
			expect(f.typeOptions?.loadOptionsDependsOn).toEqual(['pipelineId']);
		}
		for (const f of idFields.filter((x) => isV2(x) && x.name === 'addressId')) {
			expect(f.typeOptions?.loadOptionsDependsOn).toEqual(['companyId']);
			expect(mode(f, 'url')).toBeUndefined();
		}
	});
});

describe('By ID validation', () => {
	const uuid = new RegExp(UUID_REGEX);

	it('accepts a UUID', () => {
		expect(uuid.test('c4e7e246-4b31-42e0-8ec7-f12dfbd28958')).toBe(true);
	});

	it('rejects whitespace, junk and truncated IDs', () => {
		expect(uuid.test(' c4e7e246-4b31-42e0-8ec7-f12dfbd28958')).toBe(false);
		expect(uuid.test('c4e7e246-4b31-42e0-8ec7-f12dfbd28958\n')).toBe(false);
		expect(uuid.test('abc')).toBe(false);
		expect(uuid.test('c4e7e246-4b31-42e0-8ec7')).toBe(false);
	});
});

describe('By URL extraction (real app.chatagent.so links)', () => {
	const contactUrl = 'https://app.chatagent.so/customers/c4e7e246-4b31-42e0-8ec7-f12dfbd28958';
	const companyUrl = 'https://app.chatagent.so/customers/companies/8952c00b-beb8-47d4-a48f-f3b0fce1df07';
	const inboxUrl = 'https://app.chatagent.so/inbox?id=94ca66cb-136d-4738-be6d-7f1caa06f63c';
	const dealUrl =
		'https://app.chatagent.so/pipelines/53ec4ccd-d34e-4d67-be37-f91e38411ca7/deals?dealId=a572d856-6ae2-49e0-8078-2fefe9cfdd9c';
	const { contactId, companyId, conversationId, dealId } = ID_FIELD_SPECS;

	it('contact URL yields the contact ID and does not match company URLs', () => {
		expect(extract(contactId.url.regex, contactUrl)).toBe('c4e7e246-4b31-42e0-8ec7-f12dfbd28958');
		expect(extract(contactId.url.regex, companyUrl)).toBeUndefined();
	});

	it('company URL yields the company ID and does not match contact URLs', () => {
		expect(extract(companyId.url.regex, companyUrl)).toBe('8952c00b-beb8-47d4-a48f-f3b0fce1df07');
		expect(extract(companyId.url.regex, contactUrl)).toBeUndefined();
	});

	it('inbox URL yields the conversation ID, even after other query params', () => {
		expect(extract(conversationId.url.regex, inboxUrl)).toBe('94ca66cb-136d-4738-be6d-7f1caa06f63c');
		expect(
			extract(conversationId.url.regex, 'https://app.chatagent.so/inbox?tab=open&id=94ca66cb-136d-4738-be6d-7f1caa06f63c'),
		).toBe('94ca66cb-136d-4738-be6d-7f1caa06f63c');
	});

	it('deal URL yields the deal ID, not the pipeline ID', () => {
		expect(extract(dealId.url.regex, dealUrl)).toBe('a572d856-6ae2-49e0-8078-2fefe9cfdd9c');
	});

	it('URL modes validate with the same regex they extract with', () => {
		for (const f of allFields.filter((x) => isV2(x) && mode(x, 'url'))) {
			const m = mode(f, 'url')!;
			expect(regexOf(m)).toBe((m.extractValue as { regex: string }).regex);
		}
	});
});

describe('listSearch requests', () => {
	function fakeContext(response: unknown, params: Record<string, unknown> = {}) {
		const request = vi.fn().mockResolvedValue(response);
		const ctx = {
			getCredentials: vi.fn().mockResolvedValue({ baseUrl: 'https://api.example.com/' }),
			getCurrentNodeParameter: vi.fn((name: string) => params[name]),
			helpers: { httpRequestWithAuthentication: { call: request } },
		} as unknown as ILoadOptionsFunctions;
		const url = () => (request.mock.calls[0][2] as { url: string }).url;
		return { ctx, request, url };
	}

	it('contacts: encodes the search filter and pages by page number', async () => {
		const { ctx, url } = fakeContext({
			data: { items: [{ id: 'c1', displayName: 'Ana', email: 'ana@x.io', phone: null }], total: 120 },
		});
		const result = await node.methods!.listSearch!.searchContacts.call(ctx, 'ana & co');
		expect(url()).toBe('https://api.example.com/contacts?search=ana+%26+co&page=1&limit=50');
		expect(result.results).toEqual([{ name: 'Ana (ana@x.io)', value: 'c1' }]);
		expect(result.paginationToken).toBe(2);
	});

	it('conversations: passes the cursor through and stops when nextCursor is null', async () => {
		const { ctx, url } = fakeContext({
			data: { items: [{ id: 'v1', contactDisplayName: 'Ana', status: 'open' }], nextCursor: null },
		});
		const result = await node.methods!.listSearch!.searchConversations.call(ctx, undefined, 'cur1');
		expect(url()).toBe('https://api.example.com/conversations?limit=50&cursor=cur1');
		expect(result.paginationToken).toBeUndefined();
	});

	it('deals: returns nothing until a pipeline is chosen', async () => {
		const { ctx, request } = fakeContext({}, { pipelineId: '' });
		expect(await node.methods!.listSearch!.searchDeals.call(ctx)).toEqual({ results: [] });
		expect(request).not.toHaveBeenCalled();
	});

	it('addresses: lists the chosen company and filters client-side', async () => {
		const { ctx, url } = fakeContext(
			{
				data: [
					{ id: 'a1', label: 'HQ', formattedAddress: null, line1: null, city: null, isPrimary: true },
					{ id: 'a2', label: null, formattedAddress: null, line1: '1 Main St', city: 'Jakarta', isPrimary: false },
				],
			},
			{ companyId: ' co-1 ' },
		);
		const result = await node.methods!.listSearch!.searchCompanyAddresses.call(ctx, 'jakarta');
		expect(url()).toBe('https://api.example.com/companies/co-1/addresses');
		expect(result.results).toEqual([{ name: '1 Main St, Jakarta', value: 'a2' }]);
	});
});

import { describe, expect, it } from 'vitest';
import { ChatAgentTrigger } from '../nodes/ChatAgentTrigger/ChatAgentTrigger.node';
import {
	isUpdatedAfterCreate,
	pollContacts,
	sortFieldFor,
	type ContactPage,
	type ContactRecord,
} from '../nodes/ChatAgentTrigger/pollContacts';

function contact(id: string, createdAt: string, updatedAt = createdAt): ContactRecord {
	return { id, createdAt, updatedAt };
}

/** Serves `all` sorted desc by the requested field, `limit` per page. */
function fakeApi(all: ContactRecord[], limit = 100) {
	const calls: Array<{ page: number; sortBy: string }> = [];
	const fetchPage = async (page: number, sortBy: 'createdAt' | 'updatedAt'): Promise<ContactPage> => {
		calls.push({ page, sortBy });
		const sorted = [...all].sort((a, b) => Date.parse(b[sortBy]) - Date.parse(a[sortBy]));
		return { items: sorted.slice((page - 1) * limit, page * limit), total: all.length, page, limit };
	};
	return { fetchPage, calls };
}

describe('ChatAgentTrigger node description', () => {
	const { description } = new ChatAgentTrigger();

	it('is a polling trigger with no inputs', () => {
		expect(description.polling).toBe(true);
		expect(description.group).toEqual(['trigger']);
		expect(description.inputs).toEqual([]);
	});

	it('declares required credential', () => {
		expect(description.credentials).toEqual([{ name: 'chatAgentApi', required: true }]);
	});

	it('offers the three contact events', () => {
		const event = description.properties.find((p) => p.name === 'event');
		const values = (event?.options as Array<{ value: string }>).map((o) => o.value).sort();
		expect(values).toEqual(['contactAdded', 'contactAddedOrUpdated', 'contactUpdated']);
	});
});

describe('pollContacts', () => {
	it('sorts by createdAt for Added and updatedAt for the update events', () => {
		expect(sortFieldFor('contactAdded')).toBe('createdAt');
		expect(sortFieldFor('contactUpdated')).toBe('updatedAt');
		expect(sortFieldFor('contactAddedOrUpdated')).toBe('updatedAt');
	});

	it('treats a contact as updated only when updatedAt is later than createdAt', () => {
		expect(isUpdatedAfterCreate(contact('a', '2026-01-01T00:00:00.000Z'))).toBe(false);
		expect(isUpdatedAfterCreate(contact('a', '2026-01-01T00:00:00.000Z', '2026-01-02T00:00:00.000Z'))).toBe(true);
	});

	it('emits nothing on the first poll and stores the newest timestamp', async () => {
		const api = fakeApi([contact('a', '2026-01-01T00:00:00.000Z'), contact('b', '2026-01-02T00:00:00.000Z')]);
		const result = await pollContacts(api.fetchPage, 'contactAdded', {});
		expect(result.records).toEqual([]);
		expect(result.state).toEqual({ lastTimestamp: '2026-01-02T00:00:00.000Z', lastIds: ['b'] });
	});

	it('stores the current time on the first poll when there are no contacts', async () => {
		const api = fakeApi([]);
		const now = new Date('2026-03-03T00:00:00.000Z');
		const result = await pollContacts(api.fetchPage, 'contactAdded', {}, () => now);
		expect(result.state).toEqual({ lastTimestamp: now.toISOString(), lastIds: [] });
	});

	it('emits contacts added since the watermark, oldest first', async () => {
		const api = fakeApi([
			contact('old', '2026-01-01T00:00:00.000Z'),
			contact('n1', '2026-01-02T00:00:00.000Z'),
			contact('n2', '2026-01-03T00:00:00.000Z'),
		]);
		const result = await pollContacts(api.fetchPage, 'contactAdded', {
			lastTimestamp: '2026-01-01T00:00:00.000Z',
			lastIds: ['old'],
		});
		expect(result.records.map((r) => r.id)).toEqual(['n1', 'n2']);
		expect(result.state).toEqual({ lastTimestamp: '2026-01-03T00:00:00.000Z', lastIds: ['n2'] });
	});

	it('does not re-emit or skip contacts sharing the watermark millisecond', async () => {
		const ts = '2026-01-01T00:00:00.000Z';
		const api = fakeApi([contact('a', ts), contact('b', ts)]);
		const result = await pollContacts(api.fetchPage, 'contactAdded', { lastTimestamp: ts, lastIds: ['a'] });
		expect(result.records.map((r) => r.id)).toEqual(['b']);
		expect(result.state).toEqual({ lastTimestamp: ts, lastIds: ['a', 'b'] });
	});

	it('keeps the state unchanged when nothing is new', async () => {
		const state = { lastTimestamp: '2026-01-01T00:00:00.000Z', lastIds: ['a'] };
		const api = fakeApi([contact('a', '2026-01-01T00:00:00.000Z')]);
		const result = await pollContacts(api.fetchPage, 'contactAdded', state);
		expect(result).toEqual({ records: [], state });
	});

	it('Updated skips newly created contacts but still advances past them', async () => {
		const api = fakeApi([
			contact('created', '2026-01-02T00:00:00.000Z'),
			contact('edited', '2025-12-01T00:00:00.000Z', '2026-01-03T00:00:00.000Z'),
		]);
		const result = await pollContacts(api.fetchPage, 'contactUpdated', {
			lastTimestamp: '2026-01-01T00:00:00.000Z',
			lastIds: [],
		});
		expect(result.records.map((r) => r.id)).toEqual(['edited']);
		expect(result.state.lastTimestamp).toBe('2026-01-03T00:00:00.000Z');
		expect(api.calls[0].sortBy).toBe('updatedAt');
	});

	it('Added or Updated emits both new and edited contacts', async () => {
		const api = fakeApi([
			contact('created', '2026-01-02T00:00:00.000Z'),
			contact('edited', '2025-12-01T00:00:00.000Z', '2026-01-03T00:00:00.000Z'),
		]);
		const result = await pollContacts(api.fetchPage, 'contactAddedOrUpdated', {
			lastTimestamp: '2026-01-01T00:00:00.000Z',
			lastIds: [],
		});
		expect(result.records.map((r) => r.id)).toEqual(['created', 'edited']);
	});

	it('pages until it reaches contacts older than the watermark', async () => {
		const all = Array.from({ length: 5 }, (_, i) => contact(`c${i}`, `2026-01-0${i + 1}T00:00:00.000Z`));
		const api = fakeApi(all, 2);
		const result = await pollContacts(api.fetchPage, 'contactAdded', {
			lastTimestamp: '2026-01-02T00:00:00.000Z',
			lastIds: ['c1'],
		});
		expect(result.records.map((r) => r.id)).toEqual(['c2', 'c3', 'c4']);
		expect(api.calls.map((c) => c.page)).toEqual([1, 2, 3]);
	});
});

describe('ChatAgentTrigger poll()', () => {
	function pollContext(opts: {
		mode: 'manual' | 'trigger';
		event: string;
		staticData: Record<string, unknown>;
		items: ContactRecord[];
		baseUrl?: string;
	}) {
		const requests: Array<Record<string, unknown>> = [];
		const ctx = {
			getNodeParameter: (name: string) => (name === 'event' ? opts.event : undefined),
			getCredentials: async () => ({ baseUrl: opts.baseUrl ?? 'https://api.chatagent.so/', apiKey: 'k' }),
			getMode: () => opts.mode,
			getWorkflowStaticData: () => opts.staticData,
			helpers: {
				httpRequestWithAuthentication: async (credentialType: string, request: Record<string, unknown>) => {
					requests.push({ credentialType, ...request });
					const qs = request.qs as { sortBy: 'createdAt' | 'updatedAt' };
					const items = [...opts.items].sort((a, b) => Date.parse(b[qs.sortBy]) - Date.parse(a[qs.sortBy]));
					return { message: 'ok', data: { items, total: items.length, page: 1, limit: 100 } };
				},
				returnJsonArray: (items: unknown[]) => items.map((json) => ({ json })),
			},
		};
		return { ctx, requests };
	}

	const trigger = new ChatAgentTrigger();

	it('requests GET /contacts with the credential and a normalized Base URL', async () => {
		const { ctx, requests } = pollContext({ mode: 'trigger', event: 'contactUpdated', staticData: {}, items: [] });
		await trigger.poll.call(ctx as never);
		expect(requests[0]).toMatchObject({
			credentialType: 'chatAgentApi',
			method: 'GET',
			url: 'https://api.chatagent.so/contacts',
			qs: { page: 1, limit: 100, sortBy: 'updatedAt', sortOrder: 'desc' },
		});
	});

	it('baselines on activation, then emits contacts updated afterwards', async () => {
		const staticData: Record<string, unknown> = {};
		const items = [contact('a', '2026-01-01T00:00:00.000Z')];
		const first = pollContext({ mode: 'trigger', event: 'contactUpdated', staticData, items });
		expect(await trigger.poll.call(first.ctx as never)).toBeNull();
		expect(staticData.lastTimestamp).toBe('2026-01-01T00:00:00.000Z');

		items[0] = { ...items[0], updatedAt: '2026-01-05T00:00:00.000Z', tags: [{ name: 'completed' }] };
		const second = pollContext({ mode: 'trigger', event: 'contactUpdated', staticData, items });
		const result = await trigger.poll.call(second.ctx as never);
		expect(result?.[0].map((i) => i.json.id)).toEqual(['a']);
		expect(staticData.lastTimestamp).toBe('2026-01-05T00:00:00.000Z');

		const third = pollContext({ mode: 'trigger', event: 'contactUpdated', staticData, items });
		expect(await trigger.poll.call(third.ctx as never)).toBeNull();
	});

	it('returns the latest matching contact in manual mode without touching the watermark', async () => {
		const staticData: Record<string, unknown> = { lastTimestamp: '2026-01-01T00:00:00.000Z', lastIds: [] };
		const { ctx } = pollContext({
			mode: 'manual',
			event: 'contactUpdated',
			staticData,
			items: [
				contact('new', '2026-02-01T00:00:00.000Z'),
				contact('edited', '2025-12-01T00:00:00.000Z', '2026-01-10T00:00:00.000Z'),
			],
		});
		const result = await trigger.poll.call(ctx as never);
		expect(result?.[0].map((i) => i.json.id)).toEqual(['edited']);
		expect(staticData).toEqual({ lastTimestamp: '2026-01-01T00:00:00.000Z', lastIds: [] });
	});
});

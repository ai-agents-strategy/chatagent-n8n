export type ContactEvent = 'contactAdded' | 'contactUpdated' | 'contactAddedOrUpdated';

export type ContactRecord = {
	id: string;
	createdAt: string;
	updatedAt: string;
	[key: string]: unknown;
};

/**
 * Persisted between polls in the node's static data. `lastIds` holds the IDs
 * already emitted at exactly `lastTimestamp`, so records sharing the boundary
 * millisecond are neither skipped nor emitted twice.
 */
export type PollState = {
	lastTimestamp?: string;
	lastIds?: string[];
};

export type ContactPage = {
	items: ContactRecord[];
	total: number;
	page: number;
	limit: number;
};

export const POLL_PAGE_SIZE = 100;

/** "Added" watches creation time; both update events watch the last-modified time. */
export function sortFieldFor(event: ContactEvent): 'createdAt' | 'updatedAt' {
	return event === 'contactAdded' ? 'createdAt' : 'updatedAt';
}

/**
 * chatagent-api inserts contacts with `createdAt` and `updatedAt` from the same
 * `defaultNow()`, and every later edit sets a fresh `updatedAt`, so a strictly
 * later `updatedAt` means the contact was edited after creation.
 */
export function isUpdatedAfterCreate(record: ContactRecord): boolean {
	return Date.parse(record.updatedAt) > Date.parse(record.createdAt);
}

export function matchesEvent(record: ContactRecord, event: ContactEvent): boolean {
	return event === 'contactUpdated' ? isUpdatedAfterCreate(record) : true;
}

function isUnseen(record: ContactRecord, field: 'createdAt' | 'updatedAt', state: PollState): boolean {
	const ts = Date.parse(record[field]);
	const last = Date.parse(state.lastTimestamp as string);
	return ts > last || (ts === last && !(state.lastIds ?? []).includes(record.id));
}

/**
 * Pages through contacts sorted newest-first until it reaches records older
 * than the stored watermark, then returns the unseen ones (oldest first) and
 * the advanced watermark. With no stored watermark it only records the newest
 * timestamp, so activating a workflow doesn't replay every existing contact.
 */
export async function pollContacts(
	fetchPage: (page: number, sortBy: 'createdAt' | 'updatedAt') => Promise<ContactPage>,
	event: ContactEvent,
	state: PollState,
	now: () => Date = () => new Date(),
): Promise<{ records: ContactRecord[]; state: PollState }> {
	const field = sortFieldFor(event);

	if (!state.lastTimestamp) {
		const first = await fetchPage(1, field);
		const newest = first.items[0];
		return {
			records: [],
			state: newest
				? { lastTimestamp: newest[field], lastIds: idsAt(first.items, field, newest[field]) }
				: { lastTimestamp: now().toISOString(), lastIds: [] },
		};
	}

	const last = Date.parse(state.lastTimestamp);
	const unseen: ContactRecord[] = [];
	for (let page = 1; ; page++) {
		const body = await fetchPage(page, field);
		let reachedOld = false;
		for (const record of body.items) {
			if (Date.parse(record[field]) < last) {
				reachedOld = true;
				break;
			}
			if (isUnseen(record, field, state)) unseen.push(record);
		}
		if (reachedOld || body.items.length === 0 || body.page * body.limit >= body.total) break;
	}

	if (unseen.length === 0) return { records: [], state };

	const newestTimestamp = unseen[0][field];
	const newestIds = idsAt(unseen, field, newestTimestamp);
	const nextState: PollState =
		Date.parse(newestTimestamp) === last
			? { lastTimestamp: state.lastTimestamp, lastIds: [...(state.lastIds ?? []), ...newestIds] }
			: { lastTimestamp: newestTimestamp, lastIds: newestIds };

	return {
		records: unseen.filter((r) => matchesEvent(r, event)).reverse(),
		state: nextState,
	};
}

function idsAt(records: ContactRecord[], field: 'createdAt' | 'updatedAt', timestamp: string): string[] {
	const ts = Date.parse(timestamp);
	return records.filter((r) => Date.parse(r[field]) === ts).map((r) => r.id);
}

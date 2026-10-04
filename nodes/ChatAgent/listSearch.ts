import type { ILoadOptionsFunctions, INodeListSearchItems, INodeListSearchResult } from 'n8n-workflow';
import { loadOptionsApiGet } from './shared/loadOptionsApi';

// "From List" mode of the v2 resource-locator ID fields (see shared/idLocator.ts).
// Results come from the key's own organization only, which is the point: a
// record picked here can't 404 for belonging to another workspace.

const PAGE_SIZE = 50;

type ContactRow = { id: string; displayName: string; email: string | null; phone: string | null };
type CompanyRow = { id: string; name: string; email: string | null };
type ConversationRow = { id: string; contactDisplayName: string; status: string };
type DealRow = { id: string; title: string };
type AddressRow = {
	id: string;
	label: string | null;
	formattedAddress: string | null;
	line1: string | null;
	city: string | null;
	isPrimary: boolean;
};

type PagedList<T> = { data?: { items?: T[]; total?: number } };
type CursorList<T> = { data?: { items?: T[]; nextCursor?: string | null } };

function query(params: Record<string, string | undefined>): string {
	const qs = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value) qs.set(key, value);
	}
	return qs.toString();
}

function withDetail(name: string, detail: string | null | undefined): string {
	return detail ? `${name} (${detail})` : name;
}

/** Page-based list endpoint (`{ items, total, page, limit }`); the token is the next page number. */
async function searchPaged<T>(
	ctx: ILoadOptionsFunctions,
	path: string,
	filter: string | undefined,
	paginationToken: unknown,
	toItem: (row: T) => INodeListSearchItems,
): Promise<INodeListSearchResult> {
	const page = typeof paginationToken === 'number' ? paginationToken : 1;
	const body = (await loadOptionsApiGet.call(
		ctx,
		`${path}?${query({ search: filter?.trim(), page: String(page), limit: String(PAGE_SIZE) })}`,
	)) as PagedList<T>;
	const total = body.data?.total ?? 0;
	return {
		results: (body.data?.items ?? []).map(toItem),
		paginationToken: page * PAGE_SIZE < total ? page + 1 : undefined,
	};
}

/** Cursor-based list endpoint (`{ items, nextCursor }`). */
async function searchCursor<T>(
	ctx: ILoadOptionsFunctions,
	path: string,
	filter: string | undefined,
	paginationToken: unknown,
	toItem: (row: T) => INodeListSearchItems,
): Promise<INodeListSearchResult> {
	const cursor = typeof paginationToken === 'string' ? paginationToken : undefined;
	const body = (await loadOptionsApiGet.call(
		ctx,
		`${path}?${query({ search: filter?.trim(), limit: String(PAGE_SIZE), cursor })}`,
	)) as CursorList<T>;
	return {
		results: (body.data?.items ?? []).map(toItem),
		paginationToken: body.data?.nextCursor ?? undefined,
	};
}

/** Reads a sibling param that may be a plain string or a resource locator. */
function currentId(ctx: ILoadOptionsFunctions, name: string): string {
	const value = ctx.getCurrentNodeParameter(name, { extractValue: true });
	return typeof value === 'string' ? value.trim() : '';
}

export const listSearch = {
	async searchContacts(
		this: ILoadOptionsFunctions,
		filter?: string,
		paginationToken?: unknown,
	): Promise<INodeListSearchResult> {
		return await searchPaged<ContactRow>(this, '/contacts', filter, paginationToken, (row) => ({
			name: withDetail(row.displayName, row.email ?? row.phone),
			value: row.id,
		}));
	},

	async searchCompanies(
		this: ILoadOptionsFunctions,
		filter?: string,
		paginationToken?: unknown,
	): Promise<INodeListSearchResult> {
		return await searchPaged<CompanyRow>(this, '/companies', filter, paginationToken, (row) => ({
			name: withDetail(row.name, row.email),
			value: row.id,
		}));
	},

	async searchConversations(
		this: ILoadOptionsFunctions,
		filter?: string,
		paginationToken?: unknown,
	): Promise<INodeListSearchResult> {
		return await searchCursor<ConversationRow>(
			this,
			'/conversations',
			filter,
			paginationToken,
			(row) => ({ name: `${row.contactDisplayName} · ${row.status}`, value: row.id }),
		);
	},

	async searchDeals(
		this: ILoadOptionsFunctions,
		filter?: string,
		paginationToken?: unknown,
	): Promise<INodeListSearchResult> {
		const pipelineId = currentId(this, 'pipelineId');
		if (!pipelineId) return { results: [] };
		return await searchCursor<DealRow>(
			this,
			`/pipelines/${encodeURIComponent(pipelineId)}/deals`,
			filter,
			paginationToken,
			(row) => ({ name: row.title, value: row.id }),
		);
	},

	async searchCompanyAddresses(
		this: ILoadOptionsFunctions,
		filter?: string,
	): Promise<INodeListSearchResult> {
		const companyId = currentId(this, 'companyId');
		if (!companyId) return { results: [] };
		// Not paginated server-side; bare array under `data`.
		const body = (await loadOptionsApiGet.call(
			this,
			`/companies/${encodeURIComponent(companyId)}/addresses`,
		)) as { data?: AddressRow[] };
		const needle = filter?.trim().toLowerCase();
		const results = (body.data ?? [])
			.map((row) => {
				const text =
					row.label ?? row.formattedAddress ?? ([row.line1, row.city].filter(Boolean).join(', ') || row.id);
				return { name: row.isPrimary ? `${text} (primary)` : text, value: row.id };
			})
			.filter((item) => !needle || item.name.toLowerCase().includes(needle));
		return { results };
	},
};

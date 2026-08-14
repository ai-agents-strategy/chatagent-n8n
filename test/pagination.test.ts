import { describe, expect, it } from 'vitest';
import { contactGetManyDescription } from '../nodes/ChatAgent/resources/contact/getAll';
import { dealGetManyDescription } from '../nodes/ChatAgent/resources/deal/getAll';
import { conversationGetMessagesDescription } from '../nodes/ChatAgent/resources/conversation/getMessages';

/**
 * routing.operations.pagination expressions are evaluated by n8n's own
 * expression engine at runtime, not by this package's code. Rather than
 * re-implement an expression evaluator in tests (this repo's ESLint config
 * bans eval/`new Function` for exactly the reasons that would make such a
 * helper risky), each expression's exact source is asserted here, plus a
 * hand-written pure-JS mirror of its semantics — so a change to either the
 * expression string or the intended pagination behavior fails a test.
 */

function pagination(fields: unknown[]) {
	const returnAll = (fields as Array<{ name: string; routing?: { operations?: { pagination?: unknown } } }>).find(
		(f) => f.name === 'returnAll',
	);
	const p = returnAll?.routing?.operations?.pagination as {
		properties: { continue: string; request: { qs: Record<string, string> } };
	};
	if (!p) throw new Error('Expected a pagination config on the returnAll field');
	return p.properties;
}

describe('Contact/Company Get Many — page-based pagination', () => {
	const { continue: continueExpr, request } = pagination(contactGetManyDescription);

	it('continue expression checks page*limit < total', () => {
		expect(continueExpr).toBe(
			'={{ $response.body.data.page * $response.body.data.limit < $response.body.data.total }}',
		);
	});

	function continues(page: number, limit: number, total: number): boolean {
		return page * limit < total;
	}

	it('continues while page*limit < total', () => {
		expect(continues(1, 100, 250)).toBe(true);
	});

	it('stops once page*limit reaches total', () => {
		expect(continues(3, 100, 250)).toBe(false);
	});

	it('page expression starts at 2, then increments the previous request page', () => {
		expect(request.qs.page).toBe('={{ $request.qs.page ? Number($request.qs.page) + 1 : 2 }}');
	});

	function nextPage(previousRequestPage: number | undefined): number {
		return previousRequestPage ? previousRequestPage + 1 : 2;
	}

	it('starts at page 2 on first continuation, then increments', () => {
		expect(nextPage(undefined)).toBe(2);
		expect(nextPage(2)).toBe(3);
	});
});

describe('Deal Get Many — cursor-based pagination', () => {
	const { continue: continueExpr, request } = pagination(dealGetManyDescription);

	it('continue expression checks hasMore', () => {
		expect(continueExpr).toBe('={{ $response.body.data.hasMore }}');
	});

	it('cursor expression re-sends nextCursor from the response, not a page number', () => {
		expect(request.qs.cursor).toBe('={{ $response.body.data.nextCursor }}');
	});
});

describe('Conversation Get Messages — cursor-based pagination (same shape as Deal)', () => {
	const { continue: continueExpr, request } = pagination(conversationGetMessagesDescription);

	it('continue expression checks hasMore', () => {
		expect(continueExpr).toBe('={{ $response.body.data.hasMore }}');
	});

	it('cursor expression re-sends nextCursor from the response', () => {
		expect(request.qs.cursor).toBe('={{ $response.body.data.nextCursor }}');
	});
});

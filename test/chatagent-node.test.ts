import { describe, expect, it } from 'vitest';
import { ChatAgent } from '../nodes/ChatAgent/ChatAgent.node';

describe('ChatAgent node description', () => {
	const node = new ChatAgent();
	const { description } = node;

	it('declares required credential', () => {
		expect(description.credentials).toEqual([{ name: 'chatAgentApi', required: true }]);
	});

	it('is usable as an AI Agent tool', () => {
		expect(description.usableAsTool).toBe(true);
	});

	it('reads baseURL from the credential, not hardcoded', () => {
		// Exact expression asserted (see pagination.test.ts for the pattern);
		// an empty or trailing-slash Base URL must not break request URLs.
		expect(description.requestDefaults?.baseURL).toBe(
			'={{ ($credentials.baseUrl || "https://api.chatagent.so").replace(/\\/+$/, "") }}',
		);
	});

	it('offers org members as a dynamic User ID dropdown for Assign', () => {
		expect(typeof node.methods?.loadOptions?.getOrgMembers).toBe('function');
	});

	it('sets a request timeout so a hung chatagent-api call cannot block a workflow forever', () => {
		expect(description.requestDefaults?.timeout).toBeGreaterThan(0);
	});

	it('exposes every resource in the Resource dropdown', () => {
		const resourceField = description.properties.find((p) => p.name === 'resource');
		const values = (resourceField?.options as Array<{ value: string }>).map((o) => o.value);
		expect(values.sort()).toEqual(['company', 'contact', 'conversation', 'deal', 'pipeline']);
	});
});

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
		expect(description.requestDefaults?.baseURL).toBe('={{$credentials.baseUrl}}');
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

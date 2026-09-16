import { describe, expect, it } from 'vitest';
import { ChatAgentSearchCustomer } from '../nodes/ChatAgentSearchCustomer/ChatAgentSearchCustomer.node';

describe('ChatAgentSearchCustomer node description', () => {
	const node = new ChatAgentSearchCustomer();
	const { description } = node;

	it('declares required credential', () => {
		expect(description.credentials).toEqual([{ name: 'chatAgentApi', required: true }]);
	});

	it('is usable as an AI Agent tool', () => {
		expect(description.usableAsTool).toBe(true);
	});

	it('reads baseURL from the credential, not hardcoded', () => {
		expect(description.requestDefaults?.baseURL).toBe(
			'={{ ($credentials.baseUrl || "https://api.chatagent.so").replace(/\\/+$/, "") }}',
		);
	});

	it('sends the fixed GET /contacts request via its hidden operation field', () => {
		const operationField = description.properties.find((p) => p.name === 'operation');
		expect(operationField?.type).toBe('hidden');
		const routing = operationField?.routing as { request?: { method?: string; url?: string } };
		expect(routing?.request?.method).toBe('GET');
		expect(routing?.request?.url).toBe('/contacts');
	});

	it('exposes only Query and Limit as fillable parameters', () => {
		const fillable = description.properties.filter((p) => p.type !== 'hidden').map((p) => p.name);
		expect(fillable.sort()).toEqual(['limit', 'query']);
	});

	it('requires a search query', () => {
		const queryField = description.properties.find((p) => p.name === 'query');
		expect(queryField?.required).toBe(true);
	});
});

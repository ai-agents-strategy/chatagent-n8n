import { describe, expect, it } from 'vitest';
import { ChatAgentConversationHistory } from '../nodes/ChatAgentConversationHistory/ChatAgentConversationHistory.node';

describe('ChatAgentConversationHistory node description', () => {
	const node = new ChatAgentConversationHistory();
	const { description } = node;

	it('declares required credential', () => {
		expect(description.credentials).toEqual([{ name: 'chatAgentApi', required: true }]);
	});

	it('is usable as an AI Agent tool', () => {
		expect(description.usableAsTool).toBe(true);
	});

	it('sends the fixed GET .../messages request via its hidden operation field', () => {
		const operationField = description.properties.find((p) => p.name === 'operation');
		expect(operationField?.type).toBe('hidden');
		const routing = operationField?.routing as { request?: { method?: string; url?: string } };
		expect(routing?.request?.method).toBe('GET');
		expect(routing?.request?.url).toBe('=/conversations/{{$parameter.conversationId}}/messages');
	});

	it('exposes only Conversation ID and Limit as fillable parameters', () => {
		const fillable = description.properties.filter((p) => p.type !== 'hidden').map((p) => p.name);
		expect(fillable.sort()).toEqual(['conversationId', 'limit']);
	});

	it('requires a conversation ID', () => {
		const conversationIdField = description.properties.find((p) => p.name === 'conversationId');
		expect(conversationIdField?.required).toBe(true);
	});
});

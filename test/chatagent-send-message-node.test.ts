import { describe, expect, it } from 'vitest';
import { ChatAgentSendMessage } from '../nodes/ChatAgentSendMessage/ChatAgentSendMessage.node';

describe('ChatAgentSendMessage node description', () => {
	const node = new ChatAgentSendMessage();
	const { description } = node;

	it('declares required credential', () => {
		expect(description.credentials).toEqual([{ name: 'chatAgentApi', required: true }]);
	});

	it('is usable as an AI Agent tool', () => {
		expect(description.usableAsTool).toBe(true);
	});

	it('sends the fixed POST .../messages request via its hidden operation field', () => {
		const operationField = description.properties.find((p) => p.name === 'operation');
		expect(operationField?.type).toBe('hidden');
		const routing = operationField?.routing as {
			request?: { method?: string; url?: string };
			send?: { property?: string; value?: string };
		};
		expect(routing?.request?.method).toBe('POST');
		expect(routing?.request?.url).toBe('=/conversations/{{$parameter.conversationId}}/messages');
		expect(routing?.send?.property).toBe('messageType');
		expect(routing?.send?.value).toBe('text');
	});

	it('exposes only Conversation ID and Message as fillable parameters', () => {
		const fillable = description.properties.filter((p) => p.type !== 'hidden').map((p) => p.name);
		expect(fillable.sort()).toEqual(['conversationId', 'message']);
	});

	it('requires a conversation ID and message', () => {
		const conversationIdField = description.properties.find((p) => p.name === 'conversationId');
		const messageField = description.properties.find((p) => p.name === 'message');
		expect(conversationIdField?.required).toBe(true);
		expect(messageField?.required).toBe(true);
	});
});

import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

export class ChatAgentConversationHistory implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ChatAgent Conversation History',
		name: 'chatAgentConversationHistory',
		icon: { light: 'file:../../icons/favicon.svg', dark: 'file:../../icons/favicon.dark.svg' },
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["conversationId"]}}',
		description:
			'Get the message history of a ChatAgent conversation, most recent first. Use this to see prior messages and any promises made before deciding what to do next.',
		defaults: {
			name: 'ChatAgent Conversation History',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'chatAgentApi',
				required: true,
			},
		],
		documentationUrl: 'https://www.chatagent.so',
		requestDefaults: {
			// Empty or trailing-slash Base URLs would otherwise produce broken or
			// double-slash request URLs, so default and strip before use.
			baseURL: '={{ ($credentials.baseUrl || "https://api.chatagent.so").replace(/\\/+$/, "") }}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			timeout: 30000,
		},
		properties: [
			{
				// Hidden: carries the fixed GET .../messages request (see
				// ChatAgentSearchCustomer.node.ts for why this is hidden rather
				// than a visible operation dropdown).
				displayName: 'Operation',
				name: 'operation',
				type: 'hidden',
				noDataExpression: true,
				default: 'getMessages',
				routing: {
					request: {
						method: 'GET',
						url: '=/conversations/{{$parameter.conversationId}}/messages',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data.messages',
								},
							},
						],
					},
				},
			},
			{
				displayName: 'Conversation ID',
				name: 'conversationId',
				type: 'string',
				default: '',
				required: true,
				description: 'ID of the conversation to fetch messages from',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 50,
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				description: 'Max number of results to return',
				routing: {
					send: {
						type: 'query',
						property: 'limit',
					},
				},
			},
		],
	};
}

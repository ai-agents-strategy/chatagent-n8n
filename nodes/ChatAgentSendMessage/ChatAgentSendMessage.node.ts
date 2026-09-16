import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

export class ChatAgentSendMessage implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ChatAgent Send Message',
		name: 'chatAgentSendMessage',
		icon: { light: 'file:../../icons/favicon.svg', dark: 'file:../../icons/favicon.dark.svg' },
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["conversationId"]}}',
		description:
			"Send a text message to a customer on an existing ChatAgent conversation, over whatever channel that conversation uses (e.g. WhatsApp). Use ChatAgent Conversation History first if you need the conversation's ID or context before sending.",
		defaults: {
			name: 'ChatAgent Send Message',
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
				// Hidden: carries the fixed POST .../messages request and the
				// double-wrapped data.message unwrap (see
				// ChatAgent.node.ts's Send Message operation for the same shape),
				// plus the fixed messageType so this tool only ever sends
				// customer-visible text, never an internal note.
				displayName: 'Operation',
				name: 'operation',
				type: 'hidden',
				noDataExpression: true,
				default: 'sendMessage',
				routing: {
					send: {
						type: 'body',
						property: 'messageType',
						value: 'text',
					},
					request: {
						method: 'POST',
						url: '=/conversations/{{$parameter.conversationId}}/messages',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data.message',
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
				description: 'ID of the conversation to send the message on',
			},
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: '',
				required: true,
				description: 'Text content to send to the customer',
				routing: {
					send: {
						type: 'body',
						property: 'contentText',
					},
				},
			},
		],
	};
}

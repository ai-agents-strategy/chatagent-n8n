import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

export class ChatAgentSearchCustomer implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ChatAgent Search Customer',
		name: 'chatAgentSearchCustomer',
		icon: { light: 'file:../../icons/favicon.svg', dark: 'file:../../icons/favicon.dark.svg' },
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["query"]}}',
		description:
			'Search ChatAgent.so CRM contacts by name, email, or phone. Use this to find an existing customer before creating a new one or before taking further action on their record.',
		defaults: {
			name: 'ChatAgent Search Customer',
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
				// Hidden: carries the fixed GET /contacts request (every declarative
				// n8n node needs its routing.request on some property — see
				// ChatAgent.node.ts's operation options) without exposing an
				// operation choice to the AI Agent tool schema below Query/Limit.
				displayName: 'Operation',
				name: 'operation',
				type: 'hidden',
				noDataExpression: true,
				default: 'search',
				routing: {
					request: {
						method: 'GET',
						url: '/contacts',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data.items',
								},
							},
						],
					},
				},
			},
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				default: '',
				required: true,
				description: 'Free-text search over contact name, email, or phone',
				routing: {
					send: {
						type: 'query',
						property: 'search',
					},
				},
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

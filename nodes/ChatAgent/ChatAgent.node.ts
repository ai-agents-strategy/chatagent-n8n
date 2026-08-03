import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { contactDescription } from './resources/contact';
import { companyDescription } from './resources/company';
import { dealDescription } from './resources/deal';
import { pipelineDescription } from './resources/pipeline';
import { conversationDescription } from './resources/conversation';

export class ChatAgent implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ChatAgent',
		name: 'chatAgent',
		icon: { light: 'file:../../icons/chatagent.svg', dark: 'file:../../icons/chatagent.dark.svg' },
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Manage CRM data in ChatAgent.so',
		defaults: {
			name: 'ChatAgent',
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
		requestDefaults: {
			baseURL: '={{$credentials.baseUrl}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Company',
						value: 'company',
					},
					{
						name: 'Contact',
						value: 'contact',
					},
					{
						name: 'Conversation',
						value: 'conversation',
					},
					{
						name: 'Deal',
						value: 'deal',
					},
					{
						name: 'Pipeline',
						value: 'pipeline',
					},
				],
				default: 'contact',
			},
			...companyDescription,
			...contactDescription,
			...conversationDescription,
			...dealDescription,
			...pipelineDescription,
		],
	};
}

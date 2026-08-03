import type { INodeProperties } from 'n8n-workflow';

const showOnlyForConversationGet = {
	operation: ['get'],
	resource: ['conversation'],
};

export const conversationGetDescription: INodeProperties[] = [
	{
		displayName: 'Conversation ID',
		name: 'conversationId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForConversationGet,
		},
	},
];

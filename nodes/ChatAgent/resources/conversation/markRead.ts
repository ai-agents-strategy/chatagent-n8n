import type { INodeProperties } from 'n8n-workflow';

const showOnlyForConversationMarkRead = {
	operation: ['markRead'],
	resource: ['conversation'],
};

export const conversationMarkReadDescription: INodeProperties[] = [
	{
		displayName: 'Conversation ID',
		name: 'conversationId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForConversationMarkRead,
		},
	},
];
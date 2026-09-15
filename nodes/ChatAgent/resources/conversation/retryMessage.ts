import type { INodeProperties } from 'n8n-workflow';

const showOnlyForConversationRetryMessage = {
	operation: ['retryMessage'],
	resource: ['conversation'],
};

export const conversationRetryMessageDescription: INodeProperties[] = [
	{
		displayName: 'Conversation ID',
		name: 'conversationId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForConversationRetryMessage,
		},
	},
	{
		displayName: 'Message ID',
		name: 'messageId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForConversationRetryMessage,
		},
		description: 'The failed outbound message to retry',
	},
];
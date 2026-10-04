import type { INodeProperties } from 'n8n-workflow';
import { idField } from '../../shared/idLocator';

const showOnlyForConversationRetryMessage = {
	operation: ['retryMessage'],
	resource: ['conversation'],
};

export const conversationRetryMessageDescription: INodeProperties[] = [
	...idField('conversationId', showOnlyForConversationRetryMessage),
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
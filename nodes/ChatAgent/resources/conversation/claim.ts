import type { INodeProperties } from 'n8n-workflow';

const showOnlyForConversationClaim = {
	operation: ['claim'],
	resource: ['conversation'],
};

export const conversationClaimDescription: INodeProperties[] = [
	{
		displayName: 'Conversation ID',
		name: 'conversationId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForConversationClaim,
		},
		description: 'Assigns the conversation to the current API user',
	},
];

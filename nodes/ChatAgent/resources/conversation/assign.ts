import type { INodeProperties } from 'n8n-workflow';

const showOnlyForConversationAssign = {
	operation: ['assign'],
	resource: ['conversation'],
};

export const conversationAssignDescription: INodeProperties[] = [
	{
		displayName: 'Conversation ID',
		name: 'conversationId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForConversationAssign,
		},
	},
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		default: '',
		displayOptions: {
			show: showOnlyForConversationAssign,
		},
		description: 'User to assign the conversation to. Leave empty to unassign.',
		routing: {
			send: {
				type: 'body',
				property: 'userId',
				value: '={{$value ? $value : null}}',
			},
		},
	},
];

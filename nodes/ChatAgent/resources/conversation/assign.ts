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
		displayName: 'User Name or ID',
		name: 'userId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getOrgMembers',
		},
		default: '',
		displayOptions: {
			show: showOnlyForConversationAssign,
		},
		description: 'User to assign the conversation to. Leave empty to unassign. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		routing: {
			send: {
				type: 'body',
				property: 'userId',
				value: '={{$value ? $value : null}}',
			},
		},
	},
];

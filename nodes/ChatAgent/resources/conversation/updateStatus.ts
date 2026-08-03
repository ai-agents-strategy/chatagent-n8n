import type { INodeProperties } from 'n8n-workflow';

const showOnlyForConversationUpdateStatus = {
	operation: ['updateStatus'],
	resource: ['conversation'],
};

export const conversationUpdateStatusDescription: INodeProperties[] = [
	{
		displayName: 'Conversation ID',
		name: 'conversationId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForConversationUpdateStatus,
		},
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		options: [
			{ name: 'Open', value: 'open' },
			{ name: 'Pending', value: 'pending' },
			{ name: 'Resolved', value: 'resolved' },
			{ name: 'Closed', value: 'closed' },
		],
		default: 'open',
		required: true,
		displayOptions: {
			show: showOnlyForConversationUpdateStatus,
		},
		routing: {
			send: {
				type: 'body',
				property: 'status',
			},
		},
	},
];

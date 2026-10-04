import type { INodeProperties } from 'n8n-workflow';
import { idField } from '../../shared/idLocator';

const showOnlyForConversationUpdateStatus = {
	operation: ['updateStatus'],
	resource: ['conversation'],
};

export const conversationUpdateStatusDescription: INodeProperties[] = [
	...idField('conversationId', showOnlyForConversationUpdateStatus),
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

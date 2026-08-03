import type { INodeProperties } from 'n8n-workflow';

const showOnlyForConversationGetMessages = {
	operation: ['getMessages'],
	resource: ['conversation'],
};

export const conversationGetMessagesDescription: INodeProperties[] = [
	{
		displayName: 'Conversation ID',
		name: 'conversationId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForConversationGetMessages,
		},
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: showOnlyForConversationGetMessages,
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		routing: {
			send: {
				paginate: '={{$value}}',
				type: 'query',
				property: 'limit',
				value: '100',
			},
			operations: {
				pagination: {
					type: 'generic',
					properties: {
						continue: '={{ $response.body.data.hasMore }}',
						request: {
							qs: {
								cursor: '={{ $response.body.data.nextCursor }}',
							},
						},
					},
				},
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				...showOnlyForConversationGetMessages,
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		default: 50,
		description: 'Max number of results to return',
		routing: {
			send: {
				type: 'query',
				property: 'limit',
			},
		},
	},
	{
		displayName: 'Direction',
		name: 'direction',
		type: 'options',
		displayOptions: {
			show: showOnlyForConversationGetMessages,
		},
		options: [
			{ name: 'Older', value: 'older' },
			{ name: 'Newer', value: 'newer' },
		],
		default: 'older',
		description: 'Direction to page messages in relative to the cursor',
		routing: {
			send: {
				type: 'query',
				property: 'direction',
			},
		},
	},
];

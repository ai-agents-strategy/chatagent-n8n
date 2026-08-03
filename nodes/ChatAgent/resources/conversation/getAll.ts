import type { INodeProperties } from 'n8n-workflow';

const showOnlyForConversationGetMany = {
	operation: ['getAll'],
	resource: ['conversation'],
};

export const conversationGetManyDescription: INodeProperties[] = [
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: showOnlyForConversationGetMany,
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
				...showOnlyForConversationGetMany,
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
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: showOnlyForConversationGetMany,
		},
		options: [
			{
				displayName: 'Assignment',
				name: 'assignment',
				type: 'options',
				options: [
					{ name: 'All', value: 'all' },
					{ name: 'Mine', value: 'mine' },
					{ name: 'Unassigned', value: 'unassigned' },
				],
				default: 'all',
				routing: {
					send: {
						type: 'query',
						property: 'assignment',
					},
				},
			},
			{
				displayName: 'Channel Account ID',
				name: 'channelAccountId',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'query',
						property: 'channelAccountId',
					},
				},
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Free-text search over conversation contact/message content',
				routing: {
					send: {
						type: 'query',
						property: 'search',
					},
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
				routing: {
					send: {
						type: 'query',
						property: 'status',
					},
				},
			},
			{
				displayName: 'Tag ID',
				name: 'tagId',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'query',
						property: 'tagId',
					},
				},
			},
			{
				displayName: 'Unread Only',
				name: 'unreadOnly',
				type: 'boolean',
				default: false,
				routing: {
					send: {
						type: 'query',
						property: 'unreadOnly',
					},
				},
			},
		],
	},
];

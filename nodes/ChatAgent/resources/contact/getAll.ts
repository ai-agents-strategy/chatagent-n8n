import type { INodeProperties } from 'n8n-workflow';

const showOnlyForContactGetMany = {
	operation: ['getAll'],
	resource: ['contact'],
};

export const contactGetManyDescription: INodeProperties[] = [
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: showOnlyForContactGetMany,
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
						continue:
							'={{ $response.body.data.page * $response.body.data.limit < $response.body.data.total }}',
						request: {
							qs: {
								page: '={{ $request.qs.page ? Number($request.qs.page) + 1 : 2 }}',
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
				...showOnlyForContactGetMany,
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
			show: showOnlyForContactGetMany,
		},
		options: [
			{
				displayName: 'Assigned User Filter',
				name: 'assigneeFilter',
				type: 'options',
				options: [
					{ name: 'Assigned to Me', value: 'me' },
					{ name: 'Unassigned', value: 'unassigned' },
				],
				default: 'me',
				description: 'Show only contacts assigned to you, or only unassigned ones',
				routing: {
					send: {
						type: 'query',
						property: 'assigneeFilter',
					},
				},
			},
			{
				displayName: 'Assigned User ID',
				name: 'assigneeUserId',
				type: 'string',
				default: '',
				description: 'Show only contacts assigned to this user',
				routing: {
					send: {
						type: 'query',
						property: 'assigneeUserId',
					},
				},
			},
			{
				displayName: 'Company ID',
				name: 'companyId',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'query',
						property: 'companyId',
					},
				},
			},
			{
				displayName: 'Deal Activity',
				name: 'dealActivityPreset',
				type: 'options',
				options: [
					{ name: 'Active in Last 7 Days', value: 'active_7d' },
					{ name: 'Active in Last 30 Days', value: 'active_30d' },
					{ name: 'No Activity', value: 'none' },
					{ name: 'Stale for 30 Days', value: 'stale_30d' },
				],
				default: 'active_7d',
				description: 'Filter by recent deal activity',
				routing: {
					send: {
						type: 'query',
						property: 'dealActivityPreset',
					},
				},
			},
			{
				displayName: 'Deal Filter',
				name: 'dealFilter',
				type: 'options',
				options: [
					{ name: 'Has Deal', value: 'has_deal' },
					{ name: 'No Deal', value: 'no_deal' },
				],
				default: 'has_deal',
				routing: {
					send: {
						type: 'query',
						property: 'dealFilter',
					},
				},
			},
			{
				displayName: 'Pipeline ID',
				name: 'pipelineId',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'query',
						property: 'pipelineId',
					},
				},
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Free-text search over contact name/email/phone',
				routing: {
					send: {
						type: 'query',
						property: 'search',
					},
				},
			},
			{
				displayName: 'Sort By',
				name: 'sortBy',
				type: 'options',
				options: [
					{ name: 'Created At', value: 'createdAt' },
					{ name: 'Updated At', value: 'updatedAt' },
					{ name: 'Display Name', value: 'displayName' },
				],
				default: 'createdAt',
				routing: {
					send: {
						type: 'query',
						property: 'sortBy',
					},
				},
			},
			{
				displayName: 'Sort Order',
				name: 'sortOrder',
				type: 'options',
				options: [
					{ name: 'Ascending', value: 'asc' },
					{ name: 'Descending', value: 'desc' },
				],
				default: 'desc',
				routing: {
					send: {
						type: 'query',
						property: 'sortOrder',
					},
				},
			},
			{
				displayName: 'Stage ID',
				name: 'stageId',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'query',
						property: 'stageId',
					},
				},
			},
			{
				displayName: 'Tag Name or ID',
				name: 'tagId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getTags',
				},
				default: '',
				description:
					'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				routing: {
					send: {
						type: 'query',
						property: 'tagId',
					},
				},
			},
		],
	},
];

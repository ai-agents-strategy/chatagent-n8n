import type { INodeProperties } from 'n8n-workflow';

const showOnlyForDealGetMany = {
	operation: ['getAll'],
	resource: ['deal'],
};

export const dealGetManyDescription: INodeProperties[] = [
	{
		displayName: 'Pipeline ID',
		name: 'pipelineId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForDealGetMany,
		},
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: showOnlyForDealGetMany,
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
				...showOnlyForDealGetMany,
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
			show: showOnlyForDealGetMany,
		},
		options: [
			{
				displayName: 'Assigned User ID',
				name: 'assignedUserId',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'query',
						property: 'assignedUserId',
					},
				},
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Free-text search over deal title',
				routing: {
					send: {
						type: 'query',
						property: 'search',
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
		],
	},
];

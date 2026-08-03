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
		],
	},
];

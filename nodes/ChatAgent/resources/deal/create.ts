import type { INodeProperties } from 'n8n-workflow';

const showOnlyForDealCreate = {
	operation: ['create'],
	resource: ['deal'],
};

export const dealCreateDescription: INodeProperties[] = [
	{
		displayName: 'Pipeline ID',
		name: 'pipelineId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForDealCreate,
		},
	},
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForDealCreate,
		},
		description: 'Contact the deal is associated with',
		routing: {
			send: {
				type: 'body',
				property: 'contactId',
			},
		},
	},
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForDealCreate,
		},
		routing: {
			send: {
				type: 'body',
				property: 'title',
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: showOnlyForDealCreate,
		},
		options: [
			{
				displayName: 'Assigned User ID',
				name: 'assignedUserId',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'body',
						property: 'assignedUserId',
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
						type: 'body',
						property: 'companyId',
					},
				},
			},
			{
				displayName: 'Currency',
				name: 'currency',
				type: 'string',
				placeholder: 'USD',
				default: '',
				description: '3-letter currency code',
				routing: {
					send: {
						type: 'body',
						property: 'currency',
					},
				},
			},
			{
				displayName: 'Expected Close Date',
				name: 'expectedCloseDate',
				type: 'dateTime',
				default: '',
				routing: {
					send: {
						type: 'body',
						property: 'expectedCloseDate',
						value: '={{$value ? $value.split("T")[0] : undefined}}',
					},
				},
			},
			{
				displayName: 'Force',
				name: 'force',
				type: 'boolean',
				default: false,
				description:
					'Whether to bypass the one-active-deal-per-contact guard and create the deal anyway',
				routing: {
					send: {
						type: 'body',
						property: 'force',
					},
				},
			},
			{
				displayName: 'Metadata (JSON)',
				name: 'metadata',
				type: 'json',
				default: '{}',
				routing: {
					send: {
						type: 'body',
						property: 'metadata',
					},
				},
			},
			{
				displayName: 'Stage ID',
				name: 'stageId',
				type: 'string',
				default: '',
				description: 'Defaults to the pipeline’s first stage if omitted',
				routing: {
					send: {
						type: 'body',
						property: 'stageId',
					},
				},
			},
			{
				displayName: 'Value',
				name: 'value',
				type: 'string',
				placeholder: '1000.00',
				default: '',
				routing: {
					send: {
						type: 'body',
						property: 'value',
					},
				},
			},
		],
	},
];

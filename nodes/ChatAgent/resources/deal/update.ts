import type { INodeProperties } from 'n8n-workflow';

const showOnlyForDealUpdate = {
	operation: ['update'],
	resource: ['deal'],
};

export const dealUpdateDescription: INodeProperties[] = [
	{
		displayName: 'Pipeline Name or ID',
		name: 'pipelineId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getPipelines',
		},
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForDealUpdate,
		},
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	{
		displayName: 'Deal ID',
		name: 'dealId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForDealUpdate,
		},
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: showOnlyForDealUpdate,
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
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'body',
						property: 'title',
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

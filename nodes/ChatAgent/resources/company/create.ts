import type { INodeProperties } from 'n8n-workflow';

const showOnlyForCompanyCreate = {
	operation: ['create'],
	resource: ['company'],
};

export const companyCreateDescription: INodeProperties[] = [
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForCompanyCreate,
		},
		routing: {
			send: {
				type: 'body',
				property: 'name',
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
			show: showOnlyForCompanyCreate,
		},
		options: [
			{
				displayName: 'Custom Fields (JSON)',
				name: 'customFields',
				type: 'json',
				default: '{}',
				routing: {
					send: {
						type: 'body',
						property: 'customFields',
					},
				},
			},
			{
				displayName: 'Domain',
				name: 'domain',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'body',
						property: 'domain',
					},
				},
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				routing: {
					send: {
						type: 'body',
						property: 'email',
					},
				},
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'body',
						property: 'phone',
					},
				},
			},
			{
				displayName: 'Website URL',
				name: 'websiteUrl',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'body',
						property: 'websiteUrl',
					},
				},
			},
		],
	},
];

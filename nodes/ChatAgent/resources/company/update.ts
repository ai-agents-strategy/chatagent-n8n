import type { INodeProperties } from 'n8n-workflow';
import { idField } from '../../shared/idLocator';

const showOnlyForCompanyUpdate = {
	operation: ['update'],
	resource: ['company'],
};

export const companyUpdateDescription: INodeProperties[] = [
	...idField('companyId', showOnlyForCompanyUpdate),
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: showOnlyForCompanyUpdate,
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
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'body',
						property: 'name',
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

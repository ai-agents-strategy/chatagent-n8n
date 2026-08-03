import type { INodeProperties } from 'n8n-workflow';

const showOnlyForContactUpdate = {
	operation: ['update'],
	resource: ['contact'],
};

export const contactUpdateDescription: INodeProperties[] = [
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForContactUpdate,
		},
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: showOnlyForContactUpdate,
		},
		options: [
			{
				displayName: 'Avatar URL',
				name: 'avatarUrl',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'body',
						property: 'avatarUrl',
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
				displayName: 'Display Name',
				name: 'displayName',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'body',
						property: 'displayName',
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
				displayName: 'Tag Names',
				name: 'tagNames',
				type: 'string',
				default: '',
				description: 'Comma-separated tag names to apply to the contact',
				routing: {
					send: {
						type: 'body',
						property: 'tagNames',
						value: '={{$value.split(",").map((tag) => tag.trim()).filter((tag) => tag)}}',
					},
				},
			},
		],
	},
];

import type { INodeProperties } from 'n8n-workflow';
import { contactCreateDescription } from './create';
import { contactGetDescription } from './get';
import { contactGetManyDescription } from './getAll';
import { contactUpdateDescription } from './update';
import { contactDeleteDescription } from './deleteContact';

const showOnlyForContacts = {
	resource: ['contact'],
};

const unwrapData = {
	output: {
		postReceive: [
			{
				type: 'rootProperty' as const,
				properties: {
					property: 'data',
				},
			},
		],
	},
};

export const contactDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForContacts,
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create contact',
				description:
					'Create a new contact. Always check Get Many with the Search filter for an existing contact (by email or phone) first — this operation has no dedupe/upsert, so calling it again creates a second contact',
				routing: {
					request: {
						method: 'POST',
						url: '/contacts',
					},
					...unwrapData,
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get contact',
				description: 'Get a single contact by ID',
				routing: {
					request: {
						method: 'GET',
						url: '=/contacts/{{$parameter.contactId}}',
					},
					...unwrapData,
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many contacts',
				description: "List an organization's contacts",
				routing: {
					request: {
						method: 'GET',
						url: '/contacts',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data.items',
								},
							},
						],
					},
				},
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update contact',
				description: 'Update an existing contact',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/contacts/{{$parameter.contactId}}',
					},
					...unwrapData,
				},
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete contact',
				description: 'Delete a contact',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/contacts/{{$parameter.contactId}}',
					},
					...unwrapData,
				},
			},
		],
		default: 'getAll',
	},
	...contactCreateDescription,
	...contactGetDescription,
	...contactGetManyDescription,
	...contactUpdateDescription,
	...contactDeleteDescription,
];

import type { INodeProperties } from 'n8n-workflow';

const showOnlyForContactDelete = {
	operation: ['delete'],
	resource: ['contact'],
};

export const contactDeleteDescription: INodeProperties[] = [
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForContactDelete,
		},
	},
];

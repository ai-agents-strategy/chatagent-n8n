import type { INodeProperties } from 'n8n-workflow';

const showOnlyForContactGet = {
	operation: ['get'],
	resource: ['contact'],
};

export const contactGetDescription: INodeProperties[] = [
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForContactGet,
		},
	},
];

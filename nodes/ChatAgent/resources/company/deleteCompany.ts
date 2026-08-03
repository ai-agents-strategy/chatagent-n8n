import type { INodeProperties } from 'n8n-workflow';

const showOnlyForCompanyDelete = {
	operation: ['delete'],
	resource: ['company'],
};

export const companyDeleteDescription: INodeProperties[] = [
	{
		displayName: 'Company ID',
		name: 'companyId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForCompanyDelete,
		},
	},
];

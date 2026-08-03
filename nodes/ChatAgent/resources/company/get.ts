import type { INodeProperties } from 'n8n-workflow';

const showOnlyForCompanyGet = {
	operation: ['get'],
	resource: ['company'],
};

export const companyGetDescription: INodeProperties[] = [
	{
		displayName: 'Company ID',
		name: 'companyId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForCompanyGet,
		},
	},
];

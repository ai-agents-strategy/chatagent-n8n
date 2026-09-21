import type { INodeProperties } from 'n8n-workflow';

const showOnlyForCompanyGetAddresses = {
	operation: ['getAddresses'],
	resource: ['company'],
};

export const companyGetAddressesDescription: INodeProperties[] = [
	{
		displayName: 'Company ID',
		name: 'companyId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForCompanyGetAddresses,
		},
	},
];

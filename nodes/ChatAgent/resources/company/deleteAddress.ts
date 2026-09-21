import type { INodeProperties } from 'n8n-workflow';

const showOnlyForCompanyDeleteAddress = {
	operation: ['deleteAddress'],
	resource: ['company'],
};

export const companyDeleteAddressDescription: INodeProperties[] = [
	{
		displayName: 'Company ID',
		name: 'companyId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForCompanyDeleteAddress,
		},
	},
	{
		displayName: 'Address ID',
		name: 'addressId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForCompanyDeleteAddress,
		},
	},
];

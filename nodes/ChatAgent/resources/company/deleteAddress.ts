import type { INodeProperties } from 'n8n-workflow';
import { idField } from '../../shared/idLocator';

const showOnlyForCompanyDeleteAddress = {
	operation: ['deleteAddress'],
	resource: ['company'],
};

export const companyDeleteAddressDescription: INodeProperties[] = [
	...idField('companyId', showOnlyForCompanyDeleteAddress),
	...idField('addressId', showOnlyForCompanyDeleteAddress),
];

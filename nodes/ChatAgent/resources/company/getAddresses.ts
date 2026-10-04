import type { INodeProperties } from 'n8n-workflow';
import { idField } from '../../shared/idLocator';

const showOnlyForCompanyGetAddresses = {
	operation: ['getAddresses'],
	resource: ['company'],
};

export const companyGetAddressesDescription: INodeProperties[] = [
	...idField('companyId', showOnlyForCompanyGetAddresses),
];

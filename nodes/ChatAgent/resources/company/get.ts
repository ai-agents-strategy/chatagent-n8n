import type { INodeProperties } from 'n8n-workflow';
import { idField } from '../../shared/idLocator';

const showOnlyForCompanyGet = {
	operation: ['get'],
	resource: ['company'],
};

export const companyGetDescription: INodeProperties[] = [
	...idField('companyId', showOnlyForCompanyGet),
];

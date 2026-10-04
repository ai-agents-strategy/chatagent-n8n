import type { INodeProperties } from 'n8n-workflow';
import { idField } from '../../shared/idLocator';

const showOnlyForCompanyDelete = {
	operation: ['delete'],
	resource: ['company'],
};

export const companyDeleteDescription: INodeProperties[] = [
	...idField('companyId', showOnlyForCompanyDelete),
];

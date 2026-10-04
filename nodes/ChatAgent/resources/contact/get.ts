import type { INodeProperties } from 'n8n-workflow';
import { idField } from '../../shared/idLocator';

const showOnlyForContactGet = {
	operation: ['get'],
	resource: ['contact'],
};

export const contactGetDescription: INodeProperties[] = [
	...idField('contactId', showOnlyForContactGet),
];

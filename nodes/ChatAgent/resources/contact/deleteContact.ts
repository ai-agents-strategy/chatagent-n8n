import type { INodeProperties } from 'n8n-workflow';
import { idField } from '../../shared/idLocator';

const showOnlyForContactDelete = {
	operation: ['delete'],
	resource: ['contact'],
};

export const contactDeleteDescription: INodeProperties[] = [
	...idField('contactId', showOnlyForContactDelete),
];

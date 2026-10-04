import type { INodeProperties } from 'n8n-workflow';
import { idField } from '../../shared/idLocator';

const showOnlyForConversationGet = {
	operation: ['get'],
	resource: ['conversation'],
};

export const conversationGetDescription: INodeProperties[] = [
	...idField('conversationId', showOnlyForConversationGet),
];

import type { INodeProperties } from 'n8n-workflow';
import { idField } from '../../shared/idLocator';

const showOnlyForConversationMarkRead = {
	operation: ['markRead'],
	resource: ['conversation'],
};

export const conversationMarkReadDescription: INodeProperties[] = [
	...idField('conversationId', showOnlyForConversationMarkRead),
];
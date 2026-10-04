import type { INodeProperties } from 'n8n-workflow';
import { idField } from '../../shared/idLocator';

const showOnlyForConversationClaim = {
	operation: ['claim'],
	resource: ['conversation'],
};

export const conversationClaimDescription: INodeProperties[] = [
	...idField('conversationId', showOnlyForConversationClaim, { description: 'Assigns the conversation to the current API user' }),
];

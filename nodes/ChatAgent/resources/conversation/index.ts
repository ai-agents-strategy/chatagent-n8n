import type { INodeProperties } from 'n8n-workflow';
import { conversationGetDescription } from './get';
import { conversationGetManyDescription } from './getAll';
import { conversationGetMessagesDescription } from './getMessages';
import { conversationSendMessageDescription } from './sendMessage';
import { conversationUpdateStatusDescription } from './updateStatus';
import { conversationAssignDescription } from './assign';
import { conversationClaimDescription } from './claim';

const showOnlyForConversations = {
	resource: ['conversation'],
};

const unwrapData = {
	output: {
		postReceive: [
			{
				type: 'rootProperty' as const,
				properties: {
					property: 'data',
				},
			},
		],
	},
};

export const conversationDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForConversations,
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get a conversation',
				description: 'Get a single conversation by ID',
				routing: {
					request: {
						method: 'GET',
						url: '=/conversations/{{$parameter.conversationId}}',
					},
					...unwrapData,
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many conversations',
				description: "List the organization's inbox conversations",
				routing: {
					request: {
						method: 'GET',
						url: '/conversations',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data.items',
								},
							},
						],
					},
				},
			},
			{
				name: 'Get Messages',
				value: 'getMessages',
				action: 'Get conversation messages',
				description: 'List the messages in a conversation',
				routing: {
					request: {
						method: 'GET',
						url: '=/conversations/{{$parameter.conversationId}}/messages',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data.messages',
								},
							},
						],
					},
				},
			},
			{
				name: 'Send Message',
				value: 'sendMessage',
				action: 'Send a conversation message',
				description: 'Send a text or internal-note message on a conversation',
				routing: {
					request: {
						method: 'POST',
						url: '=/conversations/{{$parameter.conversationId}}/messages',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data.message',
								},
							},
						],
					},
				},
			},
			{
				name: 'Update Status',
				value: 'updateStatus',
				action: 'Update a conversation status',
				description: 'Change a conversation status (open/pending/resolved/closed)',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/conversations/{{$parameter.conversationId}}',
					},
					...unwrapData,
				},
			},
			{
				name: 'Assign',
				value: 'assign',
				action: 'Assign a conversation',
				description: 'Assign a conversation to a user, or unassign it',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/conversations/{{$parameter.conversationId}}/assign',
					},
					...unwrapData,
				},
			},
			{
				name: 'Claim',
				value: 'claim',
				action: 'Claim a conversation',
				description: 'Assign an unassigned conversation to the current API user',
				routing: {
					request: {
						method: 'POST',
						url: '=/conversations/{{$parameter.conversationId}}/claim',
					},
					...unwrapData,
				},
			},
		],
		default: 'getAll',
	},
	...conversationGetDescription,
	...conversationGetManyDescription,
	...conversationGetMessagesDescription,
	...conversationSendMessageDescription,
	...conversationUpdateStatusDescription,
	...conversationAssignDescription,
	...conversationClaimDescription,
];

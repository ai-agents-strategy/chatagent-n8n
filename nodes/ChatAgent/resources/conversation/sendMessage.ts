import type { INodeProperties } from 'n8n-workflow';

const showOnlyForConversationSendMessage = {
	operation: ['sendMessage'],
	resource: ['conversation'],
};

export const conversationSendMessageDescription: INodeProperties[] = [
	{
		displayName: 'Conversation ID',
		name: 'conversationId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForConversationSendMessage,
		},
	},
	{
		displayName: 'Content',
		name: 'contentText',
		type: 'string',
		typeOptions: {
			rows: 3,
		},
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForConversationSendMessage,
		},
		routing: {
			send: {
				type: 'body',
				property: 'contentText',
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: showOnlyForConversationSendMessage,
		},
		options: [
			{
				displayName: 'Message Type',
				name: 'messageType',
				type: 'options',
				options: [
					{ name: 'Text', value: 'text', description: 'Sent to the contact over the channel' },
					{ name: 'Internal', value: 'internal', description: 'Internal note, not sent to the contact' },
				],
				default: 'text',
				routing: {
					send: {
						type: 'body',
						property: 'messageType',
					},
				},
			},
			{
				displayName: 'Reply To Message ID',
				name: 'replyToMessageId',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'body',
						property: 'replyToMessageId',
					},
				},
			},
		],
	},
];

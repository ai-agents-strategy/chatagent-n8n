import type { INodeProperties } from 'n8n-workflow';

const showOnlyForDealMove = {
	operation: ['move'],
	resource: ['deal'],
};

export const dealMoveDescription: INodeProperties[] = [
	{
		displayName: 'Pipeline ID',
		name: 'pipelineId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForDealMove,
		},
		description: 'The deal’s current pipeline',
	},
	{
		displayName: 'Deal ID',
		name: 'dealId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForDealMove,
		},
	},
	{
		displayName: 'Stage ID',
		name: 'stageId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForDealMove,
		},
		description: 'The stage to move the deal into',
		routing: {
			send: {
				type: 'body',
				property: 'stageId',
			},
		},
	},
	{
		displayName: 'Stage Sort Order',
		name: 'stageSortOrder',
		type: 'number',
		default: 0,
		required: true,
		typeOptions: {
			minValue: 0,
		},
		displayOptions: {
			show: showOnlyForDealMove,
		},
		description: 'Position of the deal within the target stage',
		routing: {
			send: {
				type: 'body',
				property: 'stageSortOrder',
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
			show: showOnlyForDealMove,
		},
		options: [
			{
				displayName: 'Target Pipeline ID',
				name: 'targetPipelineId',
				type: 'string',
				default: '',
				description: 'Set to move the deal into a different pipeline; defaults to the current one',
				routing: {
					send: {
						type: 'body',
						property: 'pipelineId',
					},
				},
			},
		],
	},
];

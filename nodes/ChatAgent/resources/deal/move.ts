import type { INodeProperties } from 'n8n-workflow';

const showOnlyForDealMove = {
	operation: ['move'],
	resource: ['deal'],
};

export const dealMoveDescription: INodeProperties[] = [
	{
		displayName: 'Pipeline Name or ID',
		name: 'pipelineId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getPipelines',
		},
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForDealMove,
		},
		description: 'The deal\'s current pipeline. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
		displayName: 'Stage Name or ID',
		name: 'stageId',
		type: 'options',
		typeOptions: {
			loadOptionsDependsOn: ['pipelineId'],
			loadOptionsMethod: 'getStages',
		},
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForDealMove,
		},
		description: 'The stage to move the deal into. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
				displayName: 'Target Pipeline Name or ID',
				name: 'targetPipelineId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getPipelines',
				},
				default: '',
				description: 'Set to move the deal into a different pipeline; defaults to the current one. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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

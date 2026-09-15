import type { INodeProperties } from 'n8n-workflow';

const showOnlyForPipelineGetStages = {
	operation: ['getStages'],
	resource: ['pipeline'],
};

export const pipelineGetStagesDescription: INodeProperties[] = [
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
			show: showOnlyForPipelineGetStages,
		},
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
];

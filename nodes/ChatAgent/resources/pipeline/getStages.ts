import type { INodeProperties } from 'n8n-workflow';

const showOnlyForPipelineGetStages = {
	operation: ['getStages'],
	resource: ['pipeline'],
};

export const pipelineGetStagesDescription: INodeProperties[] = [
	{
		displayName: 'Pipeline ID',
		name: 'pipelineId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForPipelineGetStages,
		},
	},
];

import type { INodeProperties } from 'n8n-workflow';

const showOnlyForPipelineGetMany = {
	operation: ['getAll'],
	resource: ['pipeline'],
};

export const pipelineGetManyDescription: INodeProperties[] = [
	{
		displayName: 'Include Archived',
		name: 'includeArchived',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: showOnlyForPipelineGetMany,
		},
		description: 'Whether to include archived pipelines in the results',
		routing: {
			send: {
				type: 'query',
				property: 'includeArchived',
			},
		},
	},
];

import type { INodeProperties } from 'n8n-workflow';
import { pipelineGetManyDescription } from './getAll';
import { pipelineGetStagesDescription } from './getStages';

const showOnlyForPipelines = {
	resource: ['pipeline'],
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

export const pipelineDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForPipelines,
		},
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many pipelines',
				description: "List an organization's pipelines",
				routing: {
					request: {
						method: 'GET',
						url: '/pipelines',
					},
					...unwrapData,
				},
			},
			{
				name: 'Get Stages',
				value: 'getStages',
				action: 'Get pipeline stages',
				description: 'List the stages in a pipeline',
				routing: {
					request: {
						method: 'GET',
						url: '=/pipelines/{{$parameter.pipelineId}}/stages',
					},
					...unwrapData,
				},
			},
		],
		default: 'getAll',
	},
	...pipelineGetManyDescription,
	...pipelineGetStagesDescription,
];

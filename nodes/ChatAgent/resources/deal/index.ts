import type { INodeProperties } from 'n8n-workflow';
import { dealCreateDescription } from './create';
import { dealGetDescription } from './get';
import { dealGetManyDescription } from './getAll';
import { dealUpdateDescription } from './update';
import { dealMoveDescription } from './move';
import { dealDeleteDescription } from './deleteDeal';

const showOnlyForDeals = {
	resource: ['deal'],
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

export const dealDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForDeals,
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a deal',
				description: 'Create a new deal in a pipeline',
				routing: {
					request: {
						method: 'POST',
						url: '=/pipelines/{{$parameter.pipelineId}}/deals',
					},
					...unwrapData,
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a deal',
				description: 'Get a single deal by ID',
				routing: {
					request: {
						method: 'GET',
						url: '=/pipelines/{{$parameter.pipelineId}}/deals/{{$parameter.dealId}}',
					},
					...unwrapData,
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many deals',
				description: 'List the deals in a pipeline',
				routing: {
					request: {
						method: 'GET',
						url: '=/pipelines/{{$parameter.pipelineId}}/deals',
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
				name: 'Update',
				value: 'update',
				action: 'Update a deal',
				description: 'Update an existing deal',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/pipelines/{{$parameter.pipelineId}}/deals/{{$parameter.dealId}}',
					},
					...unwrapData,
				},
			},
			{
				name: 'Move',
				value: 'move',
				action: 'Move a deal',
				description: 'Move a deal to a different stage or pipeline',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/pipelines/{{$parameter.pipelineId}}/deals/{{$parameter.dealId}}/move',
					},
					...unwrapData,
				},
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a deal',
				description: 'Delete a deal',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/pipelines/{{$parameter.pipelineId}}/deals/{{$parameter.dealId}}',
					},
					...unwrapData,
				},
			},
		],
		default: 'getAll',
	},
	...dealCreateDescription,
	...dealGetDescription,
	...dealGetManyDescription,
	...dealUpdateDescription,
	...dealMoveDescription,
	...dealDeleteDescription,
];

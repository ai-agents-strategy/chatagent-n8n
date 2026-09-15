import type { INodeProperties } from 'n8n-workflow';

const showOnlyForDealDelete = {
	operation: ['delete'],
	resource: ['deal'],
};

export const dealDeleteDescription: INodeProperties[] = [
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
			show: showOnlyForDealDelete,
		},
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	{
		displayName: 'Deal ID',
		name: 'dealId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForDealDelete,
		},
	},
];

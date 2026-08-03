import type { INodeProperties } from 'n8n-workflow';

const showOnlyForDealDelete = {
	operation: ['delete'],
	resource: ['deal'],
};

export const dealDeleteDescription: INodeProperties[] = [
	{
		displayName: 'Pipeline ID',
		name: 'pipelineId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForDealDelete,
		},
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

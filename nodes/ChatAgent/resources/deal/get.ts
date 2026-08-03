import type { INodeProperties } from 'n8n-workflow';

const showOnlyForDealGet = {
	operation: ['get'],
	resource: ['deal'],
};

export const dealGetDescription: INodeProperties[] = [
	{
		displayName: 'Pipeline ID',
		name: 'pipelineId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForDealGet,
		},
	},
	{
		displayName: 'Deal ID',
		name: 'dealId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForDealGet,
		},
	},
];

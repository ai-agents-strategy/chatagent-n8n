import type { INodeProperties } from 'n8n-workflow';
import { companyCreateDescription } from './create';
import { companyGetDescription } from './get';
import { companyGetManyDescription } from './getAll';
import { companyUpdateDescription } from './update';
import { companyDeleteDescription } from './deleteCompany';

const showOnlyForCompanies = {
	resource: ['company'],
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

export const companyDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForCompanies,
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a company',
				description: 'Create a new company',
				routing: {
					request: {
						method: 'POST',
						url: '/companies',
					},
					...unwrapData,
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a company',
				description: 'Get a single company by ID',
				routing: {
					request: {
						method: 'GET',
						url: '=/companies/{{$parameter.companyId}}',
					},
					...unwrapData,
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many companies',
				description: "List an organization's companies",
				routing: {
					request: {
						method: 'GET',
						url: '/companies',
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
				action: 'Update a company',
				description: 'Update an existing company',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/companies/{{$parameter.companyId}}',
					},
					...unwrapData,
				},
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a company',
				description: 'Delete a company',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/companies/{{$parameter.companyId}}',
					},
					...unwrapData,
				},
			},
		],
		default: 'getAll',
	},
	...companyCreateDescription,
	...companyGetDescription,
	...companyGetManyDescription,
	...companyUpdateDescription,
	...companyDeleteDescription,
];

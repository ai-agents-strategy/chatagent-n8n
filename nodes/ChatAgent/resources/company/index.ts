import type { INodeProperties } from 'n8n-workflow';
import { companyCreateDescription } from './create';
import { companyGetDescription } from './get';
import { companyGetManyDescription } from './getAll';
import { companyUpdateDescription } from './update';
import { companyDeleteDescription } from './deleteCompany';
import { companyCreateAddressDescription } from './createAddress';
import { companyGetAddressesDescription } from './getAddresses';
import { companyUpdateAddressDescription } from './updateAddress';
import { companyDeleteAddressDescription } from './deleteAddress';

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
				action: 'Create company',
				description:
					'Create a new company. Always check Get Many with the Search filter for an existing company (by name or domain) first — this operation has no dedupe/upsert, so calling it again creates a second company.',
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
				action: 'Get company',
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
				action: 'Update company',
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
				action: 'Delete company',
				description: 'Delete a company',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/companies/{{$parameter.companyId}}',
					},
					...unwrapData,
				},
			},
			{
				name: 'Create Address',
				value: 'createAddress',
				action: 'Create company address',
				description:
					"Add an address to a company. The first address created becomes primary automatically unless Is Primary is set explicitly. Requires the account's company_management and manage_profiles permissions.",
				routing: {
					request: {
						method: 'POST',
						url: '=/companies/{{$parameter.companyId}}/addresses',
					},
					...unwrapData,
				},
			},
			{
				name: 'Get Addresses',
				value: 'getAddresses',
				action: 'Get company addresses',
				description: "List a company's addresses, primary address first",
				routing: {
					request: {
						method: 'GET',
						url: '=/companies/{{$parameter.companyId}}/addresses',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
			{
				name: 'Update Address',
				value: 'updateAddress',
				action: 'Update company address',
				description: "Update one of a company's addresses",
				routing: {
					request: {
						method: 'PATCH',
						url: '=/companies/{{$parameter.companyId}}/addresses/{{$parameter.addressId}}',
					},
					...unwrapData,
				},
			},
			{
				name: 'Delete Address',
				value: 'deleteAddress',
				action: 'Delete company address',
				description: "Delete one of a company's addresses",
				routing: {
					request: {
						method: 'DELETE',
						url: '=/companies/{{$parameter.companyId}}/addresses/{{$parameter.addressId}}',
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
	...companyCreateAddressDescription,
	...companyGetAddressesDescription,
	...companyUpdateAddressDescription,
	...companyDeleteAddressDescription,
];

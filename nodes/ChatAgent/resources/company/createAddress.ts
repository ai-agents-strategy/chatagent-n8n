import type { INodeProperties } from 'n8n-workflow';

const showOnlyForCompanyCreateAddress = {
	operation: ['createAddress'],
	resource: ['company'],
};

export const companyCreateAddressDescription: INodeProperties[] = [
	{
		displayName: 'Company ID',
		name: 'companyId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForCompanyCreateAddress,
		},
	},
	{
		displayName: 'Address Fields',
		name: 'addressFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: showOnlyForCompanyCreateAddress,
		},
		options: [
			{
				displayName: 'City',
				name: 'city',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'body',
						property: 'city',
					},
				},
			},
			{
				displayName: 'Country',
				name: 'country',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'body',
						property: 'country',
					},
				},
			},
			{
				displayName: 'Formatted Address',
				name: 'formattedAddress',
				type: 'string',
				default: '',
				description: 'Single-line address string, used when line1/city/etc are not broken out separately',
				routing: {
					send: {
						type: 'body',
						property: 'formattedAddress',
					},
				},
			},
			{
				displayName: 'Is Primary',
				name: 'isPrimary',
				type: 'boolean',
				default: false,
				description: 'Whether this becomes the company\'s primary address, replacing any existing primary',
				routing: {
					send: {
						type: 'body',
						property: 'isPrimary',
					},
				},
			},
			{
				displayName: 'Label',
				name: 'label',
				type: 'string',
				default: '',
				placeholder: 'e.g. Headquarters, Billing',
				routing: {
					send: {
						type: 'body',
						property: 'label',
					},
				},
			},
			{
				displayName: 'Latitude',
				name: 'latitude',
				type: 'number',
				default: 0,
				description: 'Manual latitude override; when set with Longitude, skips automatic geocoding',
				routing: {
					send: {
						type: 'body',
						property: 'latitude',
					},
				},
			},
			{
				displayName: 'Line 1',
				name: 'line1',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'body',
						property: 'line1',
					},
				},
			},
			{
				displayName: 'Line 2',
				name: 'line2',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'body',
						property: 'line2',
					},
				},
			},
			{
				displayName: 'Longitude',
				name: 'longitude',
				type: 'number',
				default: 0,
				description: 'Manual longitude override; when set with Latitude, skips automatic geocoding',
				routing: {
					send: {
						type: 'body',
						property: 'longitude',
					},
				},
			},
			{
				displayName: 'Metadata (JSON)',
				name: 'metadata',
				type: 'json',
				default: '{}',
				routing: {
					send: {
						type: 'body',
						property: 'metadata',
					},
				},
			},
			{
				displayName: 'Postal Code',
				name: 'postalCode',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'body',
						property: 'postalCode',
					},
				},
			},
			{
				displayName: 'State',
				name: 'state',
				type: 'string',
				default: '',
				routing: {
					send: {
						type: 'body',
						property: 'state',
					},
				},
			},
		],
	},
];

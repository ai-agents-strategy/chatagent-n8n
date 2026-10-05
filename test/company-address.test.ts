import { describe, expect, it } from 'vitest';
import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { companyDescription } from '../nodes/ChatAgent/resources/company';
import { companyCreateAddressDescription } from '../nodes/ChatAgent/resources/company/createAddress';
import { companyGetAddressesDescription } from '../nodes/ChatAgent/resources/company/getAddresses';
import { companyUpdateAddressDescription } from '../nodes/ChatAgent/resources/company/updateAddress';
import { companyDeleteAddressDescription } from '../nodes/ChatAgent/resources/company/deleteAddress';

type RoutedOption = INodePropertyOptions & {
	routing?: {
		request?: { method?: string; url?: string };
		output?: { postReceive?: Array<{ type?: string; properties?: { property?: string } }> };
	};
};

const operations = (companyDescription.find((p) => p.name === 'operation')?.options ?? []) as RoutedOption[];
const op = (value: string) => operations.find((o) => o.value === value);

const companyPath = '/companies/{{encodeURIComponent(String($parameter.companyId).trim())}}/addresses';
const addressPath = `${companyPath}/{{encodeURIComponent(String($parameter.addressId).trim())}}`;

// Mirrors chatagent-api's CreateAddressDto (see lat.md/nodes.md#Company resource).
const addressBodyFields = [
	'city',
	'country',
	'formattedAddress',
	'isPrimary',
	'label',
	'latitude',
	'line1',
	'line2',
	'longitude',
	'metadata',
	'postalCode',
	'state',
];

function idFieldNames(description: INodeProperties[]): string[] {
	return [...new Set(description.filter((p) => p.name.endsWith('Id')).map((p) => p.name))].sort();
}

function collectionOptions(description: INodeProperties[], name: string) {
	const collection = description.find((p) => p.name === name);
	return (collection?.options ?? []) as Array<
		INodeProperties & { routing?: { send?: { type?: string; property?: string } } }
	>;
}

// @lat: [[nodes#Testing#Company address routing]]
describe('Company address operations — routing', () => {
	it.each([
		['createAddress', 'POST', `=${companyPath}`],
		['getAddresses', 'GET', `=${companyPath}`],
		['updateAddress', 'PATCH', `=${addressPath}`],
		['deleteAddress', 'DELETE', `=${addressPath}`],
	])('%s sends %s to the nested addresses route', (value, method, url) => {
		expect(op(value)?.routing?.request).toEqual({ method, url });
	});

	// The owner's address list isn't paginated, so it unwraps `data`, not `data.items`.
	it.each(['createAddress', 'getAddresses', 'updateAddress', 'deleteAddress'])(
		'%s unwraps the response from data',
		(value) => {
			const extractor = op(value)?.routing?.output?.postReceive?.[0];
			expect(extractor?.type).toBe('rootProperty');
			expect(extractor?.properties?.property).toBe('data');
		},
	);
});

describe('Company address operations — parameters', () => {
	it.each([
		['createAddress', companyCreateAddressDescription, ['companyId']],
		['getAddresses', companyGetAddressesDescription, ['companyId']],
		['updateAddress', companyUpdateAddressDescription, ['addressId', 'companyId']],
		['deleteAddress', companyDeleteAddressDescription, ['addressId', 'companyId']],
	])('%s exposes exactly the IDs its URL interpolates', (value, description, ids) => {
		expect(idFieldNames(description)).toEqual(ids);
		const url = op(value)?.routing?.request?.url ?? '';
		const urlParams = [...new Set([...url.matchAll(/\$parameter\.(\w+)/g)].map((m) => m[1]))].sort();
		expect(urlParams).toEqual(ids);
	});

	it.each([
		['createAddress', companyCreateAddressDescription, 'addressFields'],
		['updateAddress', companyUpdateAddressDescription, 'updateFields'],
	])('%s sends every address field as a same-named body property', (_value, description, collection) => {
		const options = collectionOptions(description, collection);
		expect(options.map((o) => o.name).sort()).toEqual(addressBodyFields);
		for (const option of options) {
			expect(option.routing?.send).toEqual({ type: 'body', property: option.name });
		}
	});

	// geocode* is resolved server-side; letting a workflow set it would create inconsistent state.
	it('never exposes server-resolved geocoding fields', () => {
		const names = [
			...collectionOptions(companyCreateAddressDescription, 'addressFields'),
			...collectionOptions(companyUpdateAddressDescription, 'updateFields'),
		].map((o) => o.name);
		expect(names.filter((n) => n.startsWith('geocode'))).toEqual([]);
	});

	it('getAddresses and deleteAddress send no body fields', () => {
		for (const description of [companyGetAddressesDescription, companyDeleteAddressDescription]) {
			expect(description.filter((p) => p.type === 'collection')).toEqual([]);
		}
	});
});

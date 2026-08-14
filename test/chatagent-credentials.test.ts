import { describe, expect, it } from 'vitest';
import { ChatAgentApi } from '../credentials/ChatAgentApi.credentials';

describe('ChatAgentApi credentials', () => {
	const credentials = new ChatAgentApi();

	it('masks the access token in the UI', () => {
		const field = credentials.properties.find((p) => p.name === 'accessToken');
		expect(field?.typeOptions?.password).toBe(true);
	});

	it('sends the token as a Bearer header, not a query param or body field', () => {
		expect(credentials.authenticate.properties.headers).toEqual({
			Authorization: '=Bearer {{$credentials.accessToken}}',
		});
	});

	it('defaults Base URL to the production API but keeps it overridable', () => {
		const field = credentials.properties.find((p) => p.name === 'baseUrl');
		expect(field?.default).toBe('https://api.chatagent.so');
		expect(field?.type).toBe('string');
	});

	it('credential test hits a cheap, real endpoint', () => {
		expect(credentials.test.request.method).toBe('GET');
		expect(credentials.test.request.url).toBe('/contacts');
	});
});

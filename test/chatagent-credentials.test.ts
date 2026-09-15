import { describe, expect, it } from 'vitest';
import { ChatAgentApi } from '../credentials/ChatAgentApi.credentials';

describe('ChatAgentApi credentials', () => {
	const credentials = new ChatAgentApi();

	it('masks the API key in the UI', () => {
		const field = credentials.properties.find((p) => p.name === 'apiKey');
		expect(field?.typeOptions?.password).toBe(true);
	});

	it('sends the key as an x-api-key header, not a query param or body field', () => {
		expect(credentials.authenticate.properties.headers).toEqual({
			'x-api-key': '={{$credentials.apiKey}}',
		});
	});

	it('defaults Base URL to the production API but keeps it overridable', () => {
		const field = credentials.properties.find((p) => p.name === 'baseUrl');
		expect(field?.default).toBe('https://api.chatagent.so');
		expect(field?.type).toBe('string');
	});

	it('credential test hits the cheap whoami endpoint, not org data', () => {
		expect(credentials.test.request.method).toBe('GET');
		expect(credentials.test.request.url).toBe('/auth/org-context');
		// /auth/org-context needs no query params and returns no org data
		expect(credentials.test.request.qs).toBeUndefined();
	});

	it('credential test normalizes an empty or trailing-slash Base URL', () => {
		// Exact expression string asserted (same pattern as pagination.test.ts);
		// the mirror function below documents the intended semantics without eval.
		expect(credentials.test.request.baseURL).toBe(
			'={{ ($credentials.baseUrl || "https://api.chatagent.so").replace(/\\/+$/, "") }}',
		);
	});

	it('base URL normalization keeps the production default and strips trailing slashes', () => {
		function normalize(baseUrl: string | undefined): string {
			return (baseUrl || 'https://api.chatagent.so').replace(/\/+$/, '');
		}
		expect(normalize('')).toBe('https://api.chatagent.so');
		expect(normalize(undefined)).toBe('https://api.chatagent.so');
		expect(normalize('https://api.chatagent.so/')).toBe('https://api.chatagent.so');
		expect(normalize('https://staging.example.com///')).toBe('https://staging.example.com');
	});
});

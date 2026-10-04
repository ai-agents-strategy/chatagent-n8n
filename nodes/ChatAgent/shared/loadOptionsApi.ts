import type { IAllExecuteFunctions, ILoadOptionsFunctions } from 'n8n-workflow';

/** GET a chatagent-api list endpoint with the node's credential applied. */
export async function loadOptionsApiGet(this: ILoadOptionsFunctions, path: string): Promise<unknown> {
	const credentials = await this.getCredentials<{ baseUrl?: string }>('chatAgentApi');
	const baseUrl = (credentials.baseUrl ?? '').trim().replace(/\/+$/, '') || 'https://api.chatagent.so';
	return this.helpers.httpRequestWithAuthentication.call(this as unknown as IAllExecuteFunctions, 'chatAgentApi', {
		method: 'GET',
		url: `${baseUrl}${path}`,
	});
}

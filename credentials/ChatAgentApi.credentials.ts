import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class ChatAgentApi implements ICredentialType {
	name = 'chatAgentApi';

	displayName = 'ChatAgent API';

	icon: Icon = { light: 'file:../icons/favicon.svg', dark: 'file:../icons/favicon.dark.svg' };

	documentationUrl = 'https://www.chatagent.so';

	properties: INodeProperties[] = [
		{
			// chatagent-api scopes every record lookup to the key's organization, so
			// IDs from another workspace return 404 rather than 401/403.
			displayName:
				'Each API key belongs to one ChatAgent organization. Records from a different organization return 404 Not Found — create the key in the same workspace as the data your workflow uses.',
			name: 'orgNotice',
			type: 'notice',
			default: '',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.chatagent.so',
			description:
				'Root of the ChatAgent API (not the web app URL), without a path suffix. Change only for self-hosted or staging deployments.',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description:
				'API key issued for a ChatAgent organization. Only records in that organization are reachable with this key.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'x-api-key': '={{String($credentials.apiKey || "").trim()}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{ (String($credentials.baseUrl || "").trim() || "https://api.chatagent.so").replace(/\\/+$/, "") }}',
			url: '/auth/org-context',
			method: 'GET',
		},
	};
}

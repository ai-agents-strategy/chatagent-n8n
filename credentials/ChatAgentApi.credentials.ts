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
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.chatagent.so',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'API key issued for a ChatAgent organization',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'x-api-key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{ ($credentials.baseUrl || "https://api.chatagent.so").replace(/\\/+$/, "") }}',
			url: '/auth/org-context',
			method: 'GET',
		},
	};
}

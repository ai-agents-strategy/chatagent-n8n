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

	icon: Icon = { light: 'file:../icons/chatagent.svg', dark: 'file:../icons/chatagent.dark.svg' };

	documentationUrl = 'https://www.chatagent.so';

	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.chatagent.so',
		},
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'Bearer token for a ChatAgent organization user (JWT issued by ChatAgent auth)',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.accessToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/contacts',
			method: 'GET',
			qs: {
				limit: '1',
			},
		},
	};
}

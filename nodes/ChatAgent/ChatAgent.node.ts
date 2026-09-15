import {
	NodeConnectionTypes,
	type IAllExecuteFunctions,
	type ILoadOptionsFunctions,
	type INodePropertyOptions,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';
import { contactDescription } from './resources/contact';
import { companyDescription } from './resources/company';
import { dealDescription } from './resources/deal';
import { pipelineDescription } from './resources/pipeline';
import { conversationDescription } from './resources/conversation';

type OrgMember = {
	userId: string;
	role: string;
	user: { name: string; email: string };
};

type PipelineOption = {
	id: string;
	name: string;
	isDefault: boolean;
	archivedAt: Date | string | null;
};

type PipelineStageOption = {
	id: string;
	name: string;
	isWon: boolean;
	isLost: boolean;
};

type TagOption = {
	id: string;
	name: string;
};

/** GET a chatagent-api list endpoint with the node's credential applied. */
async function loadOptionsApiGet(this: ILoadOptionsFunctions, path: string): Promise<unknown> {
	const credentials = await this.getCredentials<{ baseUrl?: string }>('chatAgentApi');
	const baseUrl = (credentials.baseUrl ?? '').replace(/\/+$/, '') || 'https://api.chatagent.so';
	return this.helpers.httpRequestWithAuthentication.call(this as unknown as IAllExecuteFunctions, 'chatAgentApi', {
		method: 'GET',
		url: `${baseUrl}${path}`,
	});
}

export class ChatAgent implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ChatAgent',
		name: 'chatAgent',
		icon: { light: 'file:../../icons/favicon.svg', dark: 'file:../../icons/favicon.dark.svg' },
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'Manage ChatAgent.so CRM contacts, companies, pipelines, and deals, and work the inbox: list and create records, move deals between stages, send or read conversation messages, and assign or claim conversations',
		defaults: {
			name: 'ChatAgent',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'chatAgentApi',
				required: true,
			},
		],
		documentationUrl: 'https://www.chatagent.so',
		requestDefaults: {
			// Empty or trailing-slash Base URLs would otherwise produce broken or
			// double-slash request URLs, so default and strip before use.
			baseURL: '={{ ($credentials.baseUrl || "https://api.chatagent.so").replace(/\\/+$/, "") }}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			timeout: 30000,
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Company',
						value: 'company',
					},
					{
						name: 'Contact',
						value: 'contact',
					},
					{
						name: 'Conversation',
						value: 'conversation',
					},
					{
						name: 'Deal',
						value: 'deal',
					},
					{
						name: 'Pipeline',
						value: 'pipeline',
					},
				],
				default: 'contact',
			},
			...companyDescription,
			...contactDescription,
			...conversationDescription,
			...dealDescription,
			...pipelineDescription,
		],
	};

	// The node is otherwise fully declarative; this is its only hand-written
	// code, used to fill dynamic options dropdowns (Assign's User ID, deal
	// Pipeline/Stage, and Tag filters) from chatagent-api — see lat.md/nodes.md.
	methods = {
		loadOptions: {
			// Authn goes through the credential's own `authenticate` config
			// (x-api-key), not a hand-set header.
			async getOrgMembers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const body = await loadOptionsApiGet.call(this, '/auth/org-members');
				const members = (body as { data?: OrgMember[] }).data ?? [];
				return members
					.map((member) => ({
						name: `${member.user.name} (${member.user.email})`,
						value: member.userId,
						description: member.role,
					}))
					.sort((a, b) => a.name.localeCompare(b.name));
			},

			async getPipelines(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const body = await loadOptionsApiGet.call(this, '/pipelines');
				const pipelines = (body as { data?: PipelineOption[] }).data ?? [];
				return pipelines
					.filter((pipeline) => pipeline.archivedAt === null)
					.map((pipeline) => ({
						name: pipeline.name,
						value: pipeline.id,
						description: pipeline.isDefault ? 'Default pipeline' : undefined,
					}))
					.sort((a, b) => a.name.localeCompare(b.name));
			},

			async getStages(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const pipelineId = this.getCurrentNodeParameter('pipelineId');
				if (typeof pipelineId !== 'string' || !pipelineId) return [];
				const body = await loadOptionsApiGet.call(
					this,
					`/pipelines/${encodeURIComponent(pipelineId)}/stages`,
				);
				const stages = (body as { data?: PipelineStageOption[] }).data ?? [];
				return stages
					.map((stage) => ({
						name: stage.name,
						value: stage.id,
						description: stage.isWon ? 'Won' : stage.isLost ? 'Lost' : undefined,
					}))
					.sort((a, b) => a.name.localeCompare(b.name));
			},

			async getTags(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const body = await loadOptionsApiGet.call(this, '/tags?limit=100');
				const tags = (body as { data?: TagOption[] }).data ?? [];
				return tags
					.map((tag) => ({
						name: tag.name,
						value: tag.id,
					}))
					.sort((a, b) => a.name.localeCompare(b.name));
			},
		},
	};
}

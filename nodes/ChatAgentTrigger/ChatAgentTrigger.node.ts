import {
	NodeConnectionTypes,
	type IAllExecuteFunctions,
	type IDataObject,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
	type IPollFunctions,
} from 'n8n-workflow';
import {
	matchesEvent,
	pollContacts,
	POLL_PAGE_SIZE,
	type ContactEvent,
	type ContactPage,
	type PollState,
} from './pollContacts';

// A trigger starts a workflow and has no inputs, so it can't be an AI Agent tool.
// eslint-disable-next-line @n8n/community-nodes/node-usable-as-tool
export class ChatAgentTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ChatAgent Trigger',
		name: 'chatAgentTrigger',
		icon: { light: 'file:../../icons/favicon.svg', dark: 'file:../../icons/favicon.dark.svg' },
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Starts the workflow when a ChatAgent.so contact is added or updated',
		defaults: {
			name: 'ChatAgent Trigger',
		},
		// chatagent-api has no outbound webhooks, so this polls GET /contacts.
		polling: true,
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'chatAgentApi',
				required: true,
			},
		],
		documentationUrl: 'https://www.chatagent.so',
		properties: [
			{
				displayName: 'Trigger On',
				name: 'event',
				type: 'options',
				noDataExpression: true,
				required: true,
				default: 'contactAdded',
				options: [
					{
						name: 'Contact Added',
						value: 'contactAdded',
						description: 'Triggers when a new contact is created',
					},
					{
						name: 'Contact Added or Updated',
						value: 'contactAddedOrUpdated',
						description: 'Triggers when a contact is created or edited',
					},
					{
						name: 'Contact Updated',
						value: 'contactUpdated',
						description: 'Triggers when an existing contact is edited',
					},
				],
			},
		],
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const event = this.getNodeParameter('event') as ContactEvent;
		const credentials = await this.getCredentials<{ baseUrl?: string }>('chatAgentApi');
		const baseUrl = (credentials.baseUrl ?? '').trim().replace(/\/+$/, '') || 'https://api.chatagent.so';

		const fetchPage = async (page: number, sortBy: 'createdAt' | 'updatedAt'): Promise<ContactPage> => {
			const response = (await this.helpers.httpRequestWithAuthentication.call(
				this as unknown as IAllExecuteFunctions,
				'chatAgentApi',
				{
					method: 'GET',
					url: `${baseUrl}/contacts`,
					qs: { page, limit: POLL_PAGE_SIZE, sortBy, sortOrder: 'desc' },
					headers: { Accept: 'application/json' },
					timeout: 30000,
				},
			)) as { data: ContactPage };
			return response.data;
		};

		// Manual "Fetch Test Event": show the most recent matching contact without
		// touching the stored watermark, so testing never skips real events.
		if (this.getMode() === 'manual') {
			const page = await fetchPage(1, event === 'contactAdded' ? 'createdAt' : 'updatedAt');
			const sample = page.items.find((record) => matchesEvent(record, event));
			return sample ? [this.helpers.returnJsonArray([sample as IDataObject])] : null;
		}

		const staticData = this.getWorkflowStaticData('node') as PollState;
		const { records, state } = await pollContacts(fetchPage, event, staticData);
		staticData.lastTimestamp = state.lastTimestamp;
		staticData.lastIds = state.lastIds;

		return records.length ? [this.helpers.returnJsonArray(records as IDataObject[])] : null;
	}
}

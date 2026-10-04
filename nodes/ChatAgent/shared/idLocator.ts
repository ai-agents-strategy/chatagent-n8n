import type { IDisplayOptions, INodeProperties, INodePropertyMode } from 'n8n-workflow';

// chatagent-api validates every path ID as a UUID (`z.string().uuid()`).
export const UUID_REGEX =
	'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';

const UUID_GROUP = '([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})';

type IdFieldSpec = {
	/** v1 string field label, kept unchanged for saved v1 workflows. */
	legacyDisplayName: string;
	/** v2 resource locator label. */
	displayName: string;
	searchListMethod: string;
	/** Extra params whose change must re-run the list search. */
	dependsOn?: string[];
	/** ChatAgent web app deep link; omitted when the record has no page. */
	url?: { regex: string; placeholder: string; hint?: string };
};

// Web app routes as of 2026-10 (app.chatagent.so). Regexes don't pin the host
// so self-hosted app domains work too.
export const ID_FIELD_SPECS = {
	contactId: {
		legacyDisplayName: 'Contact ID',
		displayName: 'Contact',
		searchListMethod: 'searchContacts',
		url: {
			// Hex-only group, so /customers/companies/<id> never matches.
			regex: `/customers/${UUID_GROUP}`,
			placeholder: 'https://app.chatagent.so/customers/c4e7e246-4b31-42e0-8ec7-f12dfbd28958',
		},
	},
	companyId: {
		legacyDisplayName: 'Company ID',
		displayName: 'Company',
		searchListMethod: 'searchCompanies',
		url: {
			regex: `/customers/companies/${UUID_GROUP}`,
			placeholder:
				'https://app.chatagent.so/customers/companies/8952c00b-beb8-47d4-a48f-f3b0fce1df07',
		},
	},
	addressId: {
		legacyDisplayName: 'Address ID',
		displayName: 'Address',
		searchListMethod: 'searchCompanyAddresses',
		dependsOn: ['companyId'],
	},
	conversationId: {
		legacyDisplayName: 'Conversation ID',
		displayName: 'Conversation',
		searchListMethod: 'searchConversations',
		url: {
			regex: `/inbox\\?(?:[^#]*&)?id=${UUID_GROUP}`,
			placeholder: 'https://app.chatagent.so/inbox?id=94ca66cb-136d-4738-be6d-7f1caa06f63c',
		},
	},
	dealId: {
		legacyDisplayName: 'Deal ID',
		displayName: 'Deal',
		searchListMethod: 'searchDeals',
		dependsOn: ['pipelineId'],
		url: {
			// Takes the dealId query param, not the pipeline UUID in the path.
			regex: `/deals\\?(?:[^#]*&)?dealId=${UUID_GROUP}`,
			placeholder:
				'https://app.chatagent.so/pipelines/53ec4ccd-d34e-4d67-be37-f91e38411ca7/deals?dealId=a572d856-6ae2-49e0-8078-2fefe9cfdd9c',
			hint: 'Pick the same pipeline above — a mismatch returns 404',
		},
	},
} satisfies Record<string, IdFieldSpec>;

export type IdFieldName = keyof typeof ID_FIELD_SPECS;

type Show = NonNullable<IDisplayOptions['show']>;

/**
 * Path-ID field for one operation: a plain string on node v1 (so saved
 * workflows keep working) and a resource locator from v2. Routing reads it
 * via `$parameter.<name>`, which yields the bare ID for both shapes.
 */
export function idField(
	name: IdFieldName,
	show: Show,
	extra: Pick<INodeProperties, 'description'> = {},
): INodeProperties[] {
	const spec: IdFieldSpec = ID_FIELD_SPECS[name];

	const modes: INodePropertyMode[] = [
		// eslint-disable-next-line n8n-nodes-base/node-param-default-missing -- resource locator mode, not a param
		{
			displayName: 'From List',
			name: 'list',
			type: 'list',
			typeOptions: {
				searchListMethod: spec.searchListMethod,
				searchable: true,
			},
		},
	];
	if (spec.url) {
		// eslint-disable-next-line n8n-nodes-base/node-param-default-missing -- resource locator mode, not a param
		modes.push({
			displayName: 'By URL',
			name: 'url',
			type: 'string',
			placeholder: spec.url.placeholder,
			hint: spec.url.hint,
			validation: [
				{
					type: 'regex',
					properties: {
						regex: spec.url.regex,
						errorMessage: `Not a valid ChatAgent ${spec.displayName.toLowerCase()} URL`,
					},
				},
			],
			extractValue: { type: 'regex', regex: spec.url.regex },
		});
	}
	// eslint-disable-next-line n8n-nodes-base/node-param-default-missing -- resource locator mode, not a param
	modes.push({
		displayName: 'By ID',
		name: 'id',
		type: 'string',
		placeholder: '00000000-0000-0000-0000-000000000000',
		validation: [
			{
				type: 'regex',
				properties: {
					regex: UUID_REGEX,
					errorMessage: 'Must be a ChatAgent ID (UUID)',
				},
			},
		],
	});

	return [
		{
			displayName: spec.legacyDisplayName,
			name,
			type: 'string',
			default: '',
			required: true,
			displayOptions: { show: { ...show, '@version': [1] } },
			...extra,
		},
		{
			displayName: spec.displayName,
			name,
			type: 'resourceLocator',
			default: { mode: 'list', value: '' },
			required: true,
			modes,
			...(spec.dependsOn ? { typeOptions: { loadOptionsDependsOn: spec.dependsOn } } : {}),
			displayOptions: { show: { ...show, '@version': [{ _cnd: { gte: 2 } }] } },
			...extra,
		},
	];
}

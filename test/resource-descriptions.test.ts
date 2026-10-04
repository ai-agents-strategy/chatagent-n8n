import { describe, expect, it } from 'vitest';
import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { contactDescription } from '../nodes/ChatAgent/resources/contact';
import { companyDescription } from '../nodes/ChatAgent/resources/company';
import { dealDescription } from '../nodes/ChatAgent/resources/deal';
import { pipelineDescription } from '../nodes/ChatAgent/resources/pipeline';
import { conversationDescription } from '../nodes/ChatAgent/resources/conversation';

const resources: Record<string, INodeProperties[]> = {
	contact: contactDescription,
	company: companyDescription,
	deal: dealDescription,
	pipeline: pipelineDescription,
	conversation: conversationDescription,
};

function operationOptions(description: INodeProperties[]): INodePropertyOptions[] {
	const operationField = description.find((p) => p.name === 'operation');
	if (!operationField || !Array.isArray(operationField.options)) {
		throw new Error('Expected an "operation" field with options');
	}
	return operationField.options as INodePropertyOptions[];
}

describe.each(Object.entries(resources))('%s resource', (_resource, description) => {
	const options = operationOptions(description);

	it('has at least one operation', () => {
		expect(options.length).toBeGreaterThan(0);
	});

	// usableAsTool feeds the LLM tool-picker straight off action + description
	// (see lat.md/nodes.md) — an empty one means the AI Agent can't tell
	// operations apart when choosing which one to call.
	it.each(options.map((o) => [o.value, o]))('%s has a non-empty action and description', (_value, option) => {
		expect((option as INodePropertyOptions).action?.trim()).toBeTruthy();
		expect((option as INodePropertyOptions).description?.trim()).toBeTruthy();
	});

	it.each(options.map((o) => [o.value, o]))('%s routing has method and url', (_value, option) => {
		const routing = (option as INodePropertyOptions & { routing?: { request?: { method?: string; url?: string } } })
			.routing;
		expect(routing?.request?.method).toBeTruthy();
		expect(routing?.request?.url).toBeTruthy();
	});

	// IDs mapped from Sheets/Notion often carry stray whitespace or newlines,
	// which would otherwise build a path chatagent-api answers with 404.
	it.each(options.map((o) => [o.value, o]))('%s url trims and encodes every path ID', (_value, option) => {
		const url =
			(option as INodePropertyOptions & { routing?: { request?: { url?: string } } }).routing?.request?.url ?? '';
		const params = [...url.matchAll(/\$parameter\.(\w+)/g)].map((m) => m[1]);
		for (const param of params) {
			expect(url).toContain(`{{encodeURIComponent(String($parameter.${param}).trim())}}`);
		}
	});
});

describe('path ID normalization', () => {
	// Mirror of the URL expression's semantics (see pagination.test.ts for why
	// expression strings are not eval'd).
	function pathId(value: unknown): string {
		return encodeURIComponent(String(value).trim());
	}

	it('strips whitespace and newlines around mapped IDs', () => {
		expect(pathId(' 0b6c6d1e-1111-4222-8333-444455556666\n')).toBe('0b6c6d1e-1111-4222-8333-444455556666');
	});

	it('escapes characters that would change the request path', () => {
		expect(pathId('abc/../def?x=1')).toBe('abc%2F..%2Fdef%3Fx%3D1');
	});
});

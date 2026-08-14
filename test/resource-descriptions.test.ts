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
});

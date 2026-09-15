import { describe, expect, it } from 'vitest';
import type { INodeProperties } from 'n8n-workflow';
import { ChatAgent } from '../nodes/ChatAgent/ChatAgent.node';
import { contactDescription } from '../nodes/ChatAgent/resources/contact';
import { dealDescription } from '../nodes/ChatAgent/resources/deal';
import { pipelineDescription } from '../nodes/ChatAgent/resources/pipeline';
import { conversationDescription } from '../nodes/ChatAgent/resources/conversation';

/**
 * Dynamic options dropdowns are filled by the node's methods.loadOptions
 * helpers (see lat.md/nodes.md). These tests assert the wiring — the field
 * must name a helper that actually exists — since exercising the HTTP call
 * itself needs a live credential.
 */

const node = new ChatAgent();
const availableMethods = Object.keys(node.methods?.loadOptions ?? {});

function fields(description: INodeProperties[], name: string): INodeProperties[] {
	return description.filter((f) => f.name === name);
}

function loadOptionsMethod(field: INodeProperties): string | undefined {
	return field.typeOptions?.loadOptionsMethod as string | undefined;
}

describe('every loadOptionsMethod used by a field exists on the node', () => {
	const descriptions = {
		contact: contactDescription,
		deal: dealDescription,
		pipeline: pipelineDescription,
		conversation: conversationDescription,
	};

	it('all four loaders are declared', () => {
		expect(availableMethods).toEqual(
			expect.arrayContaining(['getOrgMembers', 'getPipelines', 'getStages', 'getTags']),
		);
	});

	it('no field names an undeclared loader', () => {
		const used = new Set<string>();
		for (const description of Object.values(descriptions)) {
			for (const field of description) {
				const method = loadOptionsMethod(field);
				if (method) {
					expect(availableMethods, `${field.name} uses undeclared loader ${method}`).toContain(method);
					used.add(method);
				}
			}
		}
		expect(used.size).toBeGreaterThan(0);
	});
});

describe('Deal pipeline/stage dropdowns', () => {
	it('every deal operation exposes Pipeline as a dropdown', () => {
		for (const field of fields(dealDescription, 'pipelineId')) {
			expect(field.type).toBe('options');
			expect(loadOptionsMethod(field)).toBe('getPipelines');
		}
	});

	it('stage dropdowns re-fetch when the pipeline changes', () => {
		const stageFields = fields(dealDescription, 'stageId');
		expect(stageFields.length).toBeGreaterThan(0);
		for (const field of stageFields) {
			expect(loadOptionsMethod(field)).toBe('getStages');
			expect(field.typeOptions?.loadOptionsDependsOn).toContain('pipelineId');
		}
	});
});

describe('Tag dropdowns', () => {
	it('contact and conversation tag filters are dropdowns', () => {
		for (const field of [...fields(contactDescription, 'tagId'), ...fields(conversationDescription, 'tagId')]) {
			expect(field.type).toBe('options');
			expect(loadOptionsMethod(field)).toBe('getTags');
		}
	});
});

describe('Assign User ID dropdown', () => {
	it('is a dropdown filled from org members', () => {
		const field = conversationDescription.find((f) => f.name === 'userId');
		expect(field?.type).toBe('options');
		expect(loadOptionsMethod(field as INodeProperties)).toBe('getOrgMembers');
	});
});
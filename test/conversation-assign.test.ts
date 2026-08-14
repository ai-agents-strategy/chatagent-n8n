import { describe, expect, it } from 'vitest';
import { conversationAssignDescription } from '../nodes/ChatAgent/resources/conversation/assign';

describe('Conversation Assign — empty User ID means unassign', () => {
	const userIdField = conversationAssignDescription.find((f) => f.name === 'userId');
	const valueExpr = (userIdField?.routing as { send?: { value?: string } })?.send?.value;

	it('value expression sends null for a falsy value, otherwise the value itself', () => {
		expect(valueExpr).toBe('={{$value ? $value : null}}');
	});

	function resolvedValue(value: string): string | null {
		return value ? value : null;
	}

	it('sends an explicit null when the field is left empty', () => {
		expect(resolvedValue('')).toBeNull();
	});

	it('sends the given user ID when set', () => {
		expect(resolvedValue('user_123')).toBe('user_123');
	});
});

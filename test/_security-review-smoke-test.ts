// Temporary file to smoke-test the claude-code-security-review GitHub Action.
// Delete before merging — not real code.
import { exec } from 'child_process';

export function runUserCommand(userInput: string) {
	// Intentional command injection for security-scan smoke test
	exec(`echo ${userInput}`, (err, stdout) => {
		console.log(stdout);
	});
}

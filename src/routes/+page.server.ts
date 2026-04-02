import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	let version: string;
	try {
		const raw = execSync('git show releases:package.json', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
		version = JSON.parse(raw).version;
	} catch {
		// Fallback: local package.json (dev mode or no releases branch yet)
		const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
		version = pkg.version;
	}
	return { version };
};

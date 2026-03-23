import { describe, test, expect, afterEach } from 'vitest';
import { useTypeaheadSearch } from './use-typeahead-search.svelte.js';

const months = [
	{ value: 'jan', label: 'January' },
	{ value: 'feb', label: 'February' },
	{ value: 'mar', label: 'March' },
	{ value: 'apr', label: 'April' },
	{ value: 'may', label: 'May' },
	{ value: 'jun', label: 'June' },
	{ value: 'jul', label: 'July' },
	{ value: 'aug', label: 'August' },
	{ value: 'sep', label: 'September' },
	{ value: 'oct', label: 'October' },
	{ value: 'nov', label: 'November' },
	{ value: 'dec', label: 'December' },
];

const withDisabled = [
	{ value: 'a', label: 'Alpha' },
	{ value: 'b', label: 'Bravo', disabled: true },
	{ value: 'c', label: 'Beta' },
];

const withTextValue = [
	{ value: '1', label: 'One (1)', textValue: 'One' },
	{ value: '2', label: 'Two (2)', textValue: 'Two' },
	{ value: '3', label: 'Three (3)', textValue: 'Three' },
];

describe('useTypeaheadSearch', () => {
	let typeahead: ReturnType<typeof useTypeaheadSearch>;

	afterEach(() => {
		typeahead?.destroy();
	});

	describe('basic search', () => {
		test('finds first option matching key', () => {
			typeahead = useTypeaheadSearch();
			const result = typeahead.search('j', months, -1);
			expect(result).toBe(0); // January
		});

		test('is case-insensitive', () => {
			typeahead = useTypeaheadSearch();
			const result = typeahead.search('J', months, -1);
			expect(result).toBe(0); // January
		});

		test('returns -1 when no match', () => {
			typeahead = useTypeaheadSearch();
			const result = typeahead.search('z', months, -1);
			expect(result).toBe(-1);
		});
	});

	describe('same-key cycling (D-02)', () => {
		test('second same key cycles to next match', () => {
			typeahead = useTypeaheadSearch();
			const first = typeahead.search('j', months, -1);
			expect(first).toBe(0); // January
			const second = typeahead.search('j', months, 0);
			expect(second).toBe(5); // June
		});

		test('third same key cycles further', () => {
			typeahead = useTypeaheadSearch();
			typeahead.search('j', months, -1); // January (0)
			typeahead.search('j', months, 0); // June (5)
			const third = typeahead.search('j', months, 5);
			expect(third).toBe(6); // July
		});

		test('wraps around after last match', () => {
			typeahead = useTypeaheadSearch();
			typeahead.search('j', months, -1); // January (0)
			typeahead.search('j', months, 0); // June (5)
			typeahead.search('j', months, 5); // July (6)
			const wrapped = typeahead.search('j', months, 6);
			expect(wrapped).toBe(0); // back to January
		});
	});

	describe('multi-char accumulation', () => {
		test('different key within window accumulates', () => {
			typeahead = useTypeaheadSearch();
			typeahead.search('j', months, -1); // "j" -> January
			const result = typeahead.search('u', months, 0); // "ju" -> June
			expect(result).toBe(5); // June
		});

		test('accumulation narrows results', () => {
			typeahead = useTypeaheadSearch();
			typeahead.search('j', months, -1);
			typeahead.search('u', months, 0);
			const result = typeahead.search('l', months, 5); // "jul" -> July
			expect(result).toBe(6); // July
		});
	});

	describe('buffer reset after 500ms', () => {
		test('resets buffer after 500ms idle', async () => {
			typeahead = useTypeaheadSearch();
			typeahead.search('j', months, -1); // "j" -> January
			await new Promise((r) => setTimeout(r, 510)); // wait for reset
			const result = typeahead.search('m', months, 0); // fresh "m" -> March
			expect(result).toBe(2); // March (not "jm")
		});

		test('same key after reset starts fresh', async () => {
			typeahead = useTypeaheadSearch();
			typeahead.search('j', months, -1); // January
			typeahead.search('j', months, 0); // June
			await new Promise((r) => setTimeout(r, 510)); // reset
			const result = typeahead.search('j', months, 5); // fresh "j" search from index 5
			// Fresh search finds first "j" match overall (January), since buffer reset means it's a new search
			expect(result).toBe(0); // January (first match, fresh search)
		});
	});

	describe('disabled options', () => {
		test('skips disabled options in search', () => {
			typeahead = useTypeaheadSearch();
			// 'b' matches Bravo (disabled) and Beta — should return Beta
			const result = typeahead.search('b', withDisabled, -1);
			expect(result).toBe(2); // Beta (index 2), not Bravo (disabled)
		});
	});

	describe('textValue fallback', () => {
		test('uses textValue for matching when provided', () => {
			typeahead = useTypeaheadSearch();
			const result = typeahead.search('t', withTextValue, -1);
			expect(result).toBe(1); // Two (textValue: 'Two')
		});
	});
});

import type { WheelPickerOption } from './types.js';

class TypeaheadSearch {
	#buffer = $state('');
	#lastKey = $state('');
	#lastTime = 0;
	#timer: ReturnType<typeof setTimeout> | null = null;

	search(key: string, options: WheelPickerOption[], currentIndex: number): number {
		const now = Date.now();
		const withinWindow = now - this.#lastTime < 500;
		const singleChar = key.length === 1;

		if (!singleChar) return -1;

		const lowerKey = key.toLowerCase();
		const isSameKey = withinWindow && lowerKey === this.#lastKey;

		this.#lastKey = lowerKey;
		this.#lastTime = now;

		// Reset timer
		if (this.#timer) clearTimeout(this.#timer);
		this.#timer = setTimeout(() => {
			this.#buffer = '';
			this.#lastKey = '';
		}, 500);

		if (isSameKey) {
			// Same key cycling (D-02): find next match after currentIndex
			return this.#cycleMatch(lowerKey, options, currentIndex);
		} else {
			// Accumulate or start fresh
			this.#buffer = withinWindow ? this.#buffer + lowerKey : lowerKey;
			return this.#findFirst(this.#buffer, options);
		}
	}

	#getSearchText(option: WheelPickerOption): string {
		return (option.textValue ?? option.label).toLowerCase();
	}

	#findFirst(prefix: string, options: WheelPickerOption[]): number {
		return options.findIndex(
			(o) => !o.disabled && this.#getSearchText(o).startsWith(prefix)
		);
	}

	#cycleMatch(key: string, options: WheelPickerOption[], fromIndex: number): number {
		const prefix = key.toLowerCase();
		const matches = options
			.map((o, i) => ({ i, matches: !o.disabled && this.#getSearchText(o).startsWith(prefix) }))
			.filter((x) => x.matches)
			.map((x) => x.i);

		if (matches.length === 0) return -1;
		const afterCurrent = matches.find((i) => i > fromIndex);
		return afterCurrent ?? matches[0]; // wrap around
	}

	destroy(): void {
		if (this.#timer) {
			clearTimeout(this.#timer);
			this.#timer = null;
		}
	}
}

export function useTypeaheadSearch() {
	return new TypeaheadSearch();
}

class ControllableState<T extends string | number> {
	#internal = $state<T | undefined>(undefined);
	#onChange: ((value: T | undefined) => void) | undefined;
	#isControlled: boolean;
	#controlledValue: T | undefined;

	constructor(opts: {
		value?: T;
		defaultValue?: T;
		onChange?: (value: T | undefined) => void;
	}) {
		this.#isControlled = typeof opts.onChange === 'function';
		this.#onChange = opts.onChange;
		this.#controlledValue = opts.value;

		if (this.#isControlled) {
			this.#internal = opts.value;
		} else {
			this.#internal = opts.defaultValue;
		}
	}

	get current(): T | undefined {
		if (this.#isControlled) {
			return this.#controlledValue;
		}
		return this.#internal;
	}

	set current(next: T | undefined) {
		if (this.#isControlled) {
			this.#onChange?.(next);
		} else {
			this.#internal = next;
		}
	}
}

export function useControllableState<T extends string | number>(opts: {
	value?: T;
	defaultValue?: T;
	onChange?: (value: T | undefined) => void;
}): ControllableState<T> {
	return new ControllableState<T>(opts);
}

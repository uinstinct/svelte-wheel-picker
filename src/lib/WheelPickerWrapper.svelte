<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { WheelPickerWrapperProps } from './types.js';

	let { classNames, children }: WheelPickerWrapperProps & { children?: Snippet } = $props();
</script>

<div data-swp-group class={classNames?.group ?? undefined}>
	{@render children?.()}
</div>

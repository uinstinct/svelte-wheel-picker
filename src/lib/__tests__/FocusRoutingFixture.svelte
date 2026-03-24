<script lang="ts">
	import WheelPickerWrapper from '../WheelPickerWrapper.svelte';
	import WheelPicker from '../WheelPicker.svelte';
</script>

<WheelPickerWrapper>
	<WheelPicker
		options={[
			{ value: '1', label: 'One' },
			{ value: '2', label: 'Two' },
			{ value: '3', label: 'Three' },
		]}
	/>
	<WheelPicker
		options={[
			{ value: 'a', label: 'A' },
			{ value: 'b', label: 'B' },
			{ value: 'c', label: 'C' },
		]}
	/>
</WheelPickerWrapper>

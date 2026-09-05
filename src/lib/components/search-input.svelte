<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements'

	type Props = Omit<HTMLInputAttributes, 'type'> & {
		value?: string
	}

	let { value = $bindable(''), ...rest }: Props = $props()
</script>

<label class="search-input">
	<span>
		<div class="icon-search"></div>
	</span>
	<input type="search" bind:value {...rest} />
</label>

<style>
	.search-input {
		flex: 1;
	}
</style>

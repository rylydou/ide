<script lang="ts">
	export let value = false

	const click = () => {
		value = !value
	}
</script>

<button class="toggle" on:click={click} {...$$restProps}>
	{#if value}
		<slot name="on">On</slot>
	{:else}
		<slot name="off">Off</slot>
	{/if}
</button>

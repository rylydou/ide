<script lang="ts">
	export let value = false
</script>

<button type="button" class="toggle" on:click={() => (value = !value)} {...$$restProps}>
	{#if value}
		<slot name="on">On</slot>
	{:else}
		<slot name="off">Off</slot>
	{/if}
</button>

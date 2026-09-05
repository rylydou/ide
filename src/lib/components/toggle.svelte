<script lang="ts">
	import type { Snippet } from 'svelte'
	import type { HTMLButtonAttributes } from 'svelte/elements'

	type Props = Omit<HTMLButtonAttributes, 'type' | 'value'> & {
		value?: boolean
		on?: Snippet
		off?: Snippet
	}

	let { value = $bindable(false), on, off, ...rest }: Props = $props()
</script>

<button
	type="button"
	class="toggle"
	aria-pressed={value ? 'true' : 'false'}
	onclick={() => (value = !value)}
	{...rest}
>
	{#if value}
		{#if on}{@render on()}{:else}On{/if}
	{:else}
		{#if off}{@render off()}{:else}Off{/if}
	{/if}
</button>

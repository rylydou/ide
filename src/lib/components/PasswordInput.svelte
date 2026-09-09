<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements'
	import { Toggle } from '.'

	type Props = Omit<HTMLInputAttributes, 'type'> & {
		revealPassword?: boolean
	}

	let { revealPassword = $bindable(false), ...rest }: Props = $props()

	const label = $derived(revealPassword ? 'Hide password' : 'Show password')
</script>

<div class="input-group">
	<input
		type={revealPassword ? 'text' : 'password'}
		class="password"
		placeholder={revealPassword ? 'Not a secret anymore' : "It's a secret to everybody"}
		{...rest}
	/>

	<Toggle bind:value={revealPassword} data-tooltip={label} aria-label={label}>
		{#snippet on()}<div class="icon-unlock"></div>{/snippet}
		{#snippet off()}<div class="icon-lock"></div>{/snippet}
	</Toggle>
</div>

<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements'
	import { Toggle } from '.'

	type Props = Omit<HTMLInputAttributes, 'type'> & {
		reveal_password?: boolean
	}

	let { reveal_password = $bindable(false), ...rest }: Props = $props()
</script>

<div class="input-group">
	<input
		type={reveal_password ? 'text' : 'password'}
		class="password"
		placeholder={reveal_password ? 'Not a secret anymore' : "It's a secret to everybody"}
		{...rest}
	/>

	<Toggle
		bind:value={reveal_password}
		data-tooltip={reveal_password ? 'Hide password' : 'Show password'}
		aria-label={reveal_password ? 'Hide password' : 'Show password'}
	>
		{#snippet on()}<div class="icon-unlock"></div>{/snippet}
		{#snippet off()}<div class="icon-lock"></div>{/snippet}
	</Toggle>
</div>

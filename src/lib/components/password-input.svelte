<script lang="ts">
	import { Toggle } from '.'

	export let reveal_password = false
</script>

<div class="input-group">
	<input
		type={reveal_password ? 'text' : 'password'}
		class="password"
		placeholder={reveal_password ? 'Not a secret anymore' : "It's a secret to everybody"}
		{...$$restProps}
	/>

	<Toggle bind:value={reveal_password} title={reveal_password ? 'Hide password' : 'Show password'}>
		<div slot="on" class="icon-unlock" />
		<div slot="off" class="icon-lock" />
	</Toggle>
</div>

<script lang="ts">
	import { applyAction, enhance } from '$app/forms'
	import { debounce } from '$lib'

	let secret_input = 'test'
	let group_name = ''

	const handle_group = () => {
		group_name = secret_input
	}
</script>

<main>
	<form
		method="POST"
		use:enhance={() => {
			return async ({ result }) => {
				const data = {}
			}
		}}
	>
		<label>
			<span>Secret Code</span>
			<input
				type="text"
				name="secret"
				autocomplete="off"
				bind:value={secret_input}
				on:keyup={debounce(handle_group)}
			/>
		</label>

		<label>
			<span>Full name</span>
			<input type="text" name="name" autocomplete="name" value="Ryly Dou" />
		</label>

		<label>
			<span>Password</span>
			<input
				type="password"
				name="password"
				autocomplete="new-password"
				placeholder="shh... keep it a secret"
				value="password"
			/>
		</label>

		<button type="submit" class="btn" disabled={!group_name}>
			Create Account
			{#if group_name}
				& Join {group_name}
			{/if}
		</button>
	</form>
</main>

<script lang="ts">
	import { enhance } from '$app/forms'
	import { debounce } from '$lib'

	let secret_input = 'test'
	let group_name = ''

	let error_message = ''

	const handle_group = () => {
		group_name = secret_input
	}
</script>

<main>
	<form
		class="form center-form"
		method="POST"
		use:enhance={() => {
			return async ({ result }) => {
				const is_ok = result.type == 'success' || result.type == 'redirect'
				if (!is_ok) {
					error_message =
						// @ts-ignore
						result?.data?.message || result?.error?.message || 'An unknown error occurred.'
					return
				}
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
			<input class="input" type="text" name="name" autocomplete="name" value="Ryly Dou" />
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

		<button class="btn" type="submit" disabled={!group_name}>
			Join
			{#if group_name}
				"{group_name}"
			{/if}
		</button>
	</form>
</main>

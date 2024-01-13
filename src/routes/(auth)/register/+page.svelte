<script lang="ts">
	import { enhance } from '$app/forms'
	import { PasswordInput } from '$lib/components'

	let error_message = ''
</script>

<main class="layout-center">
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
		<div class="tabs">
			<a class="tab" href="/register" aria-current="location">Register</a>
			<a class="tab" href="/login">Login</a>
		</div>

		<label>
			<span>Full name</span>
			<input class="input" type="text" name="name" autocomplete="name" value="Ryly Dou" />
		</label>

		<label>
			<span>Password</span>
			<PasswordInput name="password" autocomplete="new-password" value="password" />
		</label>

		<button class="btn" type="submit"> Register </button>
	</form>
</main>

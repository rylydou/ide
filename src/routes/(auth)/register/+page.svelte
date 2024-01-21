<script lang="ts">
	import { applyAction, enhance } from '$app/forms'
	import { cfg } from '$lib'
	import { PasswordInput } from '$lib/components'

	let message = ''
	let is_waiting = false
</script>

<main class="layout-center">
	<form
		class="form center-form form-tabbed"
		method="post"
		use:enhance={() => {
			is_waiting = true

			return async ({ result }) => {
				is_waiting = false

				switch (result.type) {
					case 'redirect':
					case 'success':
						return await applyAction(result)
					case 'failure':
						message = result.data?.message?.toString() || 'Something went wrong'
						return
					case 'error':
						message = result?.error?.toString() || 'An error occurred'
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
			<span>School email (no need for {cfg.default_email_domain})</span>
			<input class="input" type="text" name="email" autocomplete="email" autofocus />
		</label>

		<label>
			<span>Full name</span>
			<input class="input" type="text" name="name" autocomplete="name" />
		</label>

		<label>
			<span>Password</span>
			<PasswordInput name="password" autocomplete="new-password" />
		</label>

		<button type="submit" class="btn" disabled={is_waiting}>Register</button>

		<div class="message">
			{message}
		</div>
	</form>
</main>

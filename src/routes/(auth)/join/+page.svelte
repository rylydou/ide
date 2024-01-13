<script lang="ts">
	import { applyAction, enhance } from '$app/forms'

	let message = ''

	let is_waiting = false
	let secret_input = ''
</script>

<main class="layout-center">
	<form
		class="form center-form form"
		method="POST"
		use:enhance={() => {
			is_waiting = true

			return async ({ result }) => {
				console.log({ result })
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
		<label>
			<span>Secret class code</span>
			<input
				type="text"
				class="password"
				name="secret"
				autocomplete="off"
				autofocus
				bind:value={secret_input}
				on:input={() => (message = '')}
			/>
		</label>

		<button type="submit" class="btn" disabled={!secret_input || is_waiting}>Join</button>

		<span>Already joined a class? <a class="link" href="/login">Log in instead</a></span>

		<div class="message">
			{message}
		</div>
	</form>
</main>

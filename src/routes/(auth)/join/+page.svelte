<script lang="ts">
	import { applyAction, enhance } from '$app/forms'

	let message = ''

	let is_waiting = false
	let secret_input = ''
</script>

<svelte:head>
	<title>Join - IDE</title>
</svelte:head>

<main class="layout-center">
	<form
		class="form center-form form"
		method="post"
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
				spellcheck="false"
				autofocus
				bind:value={secret_input}
				on:input={() => (message = '')}
				style="text-transform: uppercase;"
			/>
		</label>

		<button type="submit" class="btn" disabled={!secret_input || is_waiting}>Join</button>

		<span>Already joined a class? <a class="link" href="/login">Log in instead</a></span>

		<div class="message">
			{message}
		</div>
	</form>
</main>

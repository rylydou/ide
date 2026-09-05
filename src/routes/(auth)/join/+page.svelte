<script lang="ts">
	import { enhance } from '$app/forms'
	import { create_form } from '$lib/form.svelte'

	const form = create_form()
	let secret_input = $state('')
</script>

<svelte:head>
	<title>Join - IDE</title>
</svelte:head>

<main class="layout-center">
	<form class="form center-form" method="post" use:enhance={form.submit}>
		<label>
			<span>Secret class code</span>
			<!-- svelte-ignore a11y_autofocus -->
			<input
				type="text"
				class="password join-code"
				name="secret"
				autocomplete="off"
				spellcheck="false"
				autofocus
				maxlength={8}
				bind:value={secret_input}
				oninput={() => (form.message = '')}
			/>
		</label>

		<button type="submit" class="btn" disabled={!secret_input || form.is_waiting}>Join</button>

		<span>Already joined a class? <a class="link" href="/login">Log in instead</a></span>

		<div class="message">{form.message}</div>
	</form>
</main>

<style>
	.join-code {
		text-transform: uppercase;
	}
</style>

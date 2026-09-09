<script lang="ts">
	import { cfg } from '$lib'
	import { PasswordInput } from '$lib/components'
	import { enhance } from '$app/forms'
	import { createForm } from '$lib/form.svelte'

	const form = createForm()
</script>

<svelte:head>
	<title>Login - IDE</title>
</svelte:head>

<main class="layout-center">
	<form class="form center-form form-tabbed" method="post" use:enhance={form.submit}>
		<div class="tabs">
			<a class="tab" href="/register">Register</a>
			<a class="tab" href="/login" aria-current="location">Login</a>
		</div>

		<label>
			<span>School Email (no need for {cfg.defaultEmailDomain})</span>
			<!-- svelte-ignore a11y_autofocus -->
			<input class="input" type="text" name="email" autocomplete="email" autofocus />
		</label>

		<label>
			<span>Password</span>
			<PasswordInput name="password" autocomplete="current-password" disabled={form.isWaiting} />
		</label>

		<button type="submit" class="btn" disabled={form.isWaiting}>Login</button>

		<div class="message">{form.message}</div>
	</form>
</main>

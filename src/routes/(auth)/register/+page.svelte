<script lang="ts">
	import { cfg } from '$lib'
	import { PasswordInput } from '$lib/components'
	import { enhance } from '$app/forms'
	import { createForm } from '$lib/form.svelte'
	import type { PageProps } from './$types'

	let { data }: PageProps = $props()

	const form = createForm()
</script>

<svelte:head>
	<title>Register - IDE</title>
</svelte:head>

<main class="layout-center">
	<form class="form center-form form-tabbed" method="post" use:enhance={form.submit}>
		<div class="tabs">
			<a class="tab" href="/register" aria-current="location">Register</a>
			<a class="tab" href="/login">Login</a>
		</div>

		<p>Joining <strong>{data.group.name}</strong></p>

		<label>
			<span>School email (no need for {cfg.defaultEmailDomain})</span>
			<!-- svelte-ignore a11y_autofocus -->
			<input
				class="input"
				type="text"
				name="email"
				autocomplete="email"
				autofocus
				minlength={3}
				maxlength={40}
			/>
		</label>

		<label>
			<span>Full name</span>
			<input class="input" type="text" name="name" autocomplete="name" minlength={3} maxlength={20} />
		</label>

		<label>
			<span>Password</span>
			<PasswordInput name="password" autocomplete="new-password" minlength={8} maxlength={64} />
		</label>

		<button type="submit" class="btn" disabled={form.isWaiting}>Register</button>

		<div class="message">{form.message}</div>
	</form>
</main>

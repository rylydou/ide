<script lang="ts">
	import { PasswordInput } from '$lib/components'
	import { enhance } from '$app/forms'
	import { create_form } from '$lib/form.svelte'

	const form = create_form()
</script>

<svelte:head>
	<title>Register as Admin - IDE</title>
</svelte:head>

<main class="layout-center">
	<form class="form center-form form-tabbed" method="post" use:enhance={form.submit}>
		<div class="tabs">
			<a class="tab" href="/register/admin" aria-current="location">Register as Admin</a>
			<a class="tab" href="/login">Login</a>
		</div>

		<label>
			<span>Secret</span>
			<PasswordInput name="secret" autocomplete="off" />
		</label>

		<label>
			<span>Admin email</span>
			<input class="input" type="text" name="email" autocomplete="email" />
		</label>

		<label>
			<span>Full name</span>
			<input class="input" type="text" name="name" autocomplete="name" />
		</label>

		<label>
			<span>Password</span>
			<PasswordInput name="password" autocomplete="new-password" minlength={8} />
		</label>

		<button type="submit" class="btn" disabled={form.is_waiting}>Register</button>

		<div class="message">{form.message}</div>
	</form>
</main>

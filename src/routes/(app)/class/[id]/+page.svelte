<script lang="ts">
	import { page } from '$app/state'
	import { untrack } from 'svelte'
	import { SearchInput, UserCard } from '$lib/components'
	import type { PageProps } from './$types'

	let { data }: PageProps = $props()

	const group = $derived(data.group)

	let edit_dialog = $state<HTMLDialogElement>()
	let join_code_dialog = $state<HTMLDialogElement>()
	let secret_input = $state(untrack(() => data.group.secret) ?? '')

	let filter = $state('')

	const filtered_users = $derived.by(() => {
		if (!filter) return group.users

		const needle = filter.toLowerCase()
		return group.users.filter((user) =>
			user.name.toLowerCase().includes(needle)
			|| user.projects.some(({ name }) => name.toLowerCase().includes(needle)))
	})
</script>

<svelte:head>
	<title>{group.name}</title>
</svelte:head>

<main class="dash-layout">
	<header>
		<h1>{group.name}</h1>
	</header>

	<section>
		<header>
			<a class="btn btn-text" href="/"><div class="icon-home"></div> Home</a>

			{#if data.session.user.is_admin}
				<button class="btn btn-text" onclick={() => edit_dialog?.showModal()}>
					<div class="icon-pencil"></div> Edit Class
				</button>
				<button
					class="btn btn-text"
					disabled={!group.secret}
					onclick={() => join_code_dialog?.showModal()}
				>
					<div class="icon-expand"></div> Show Join Code
				</button>
			{/if}

			<div class="spacer"></div>

			<form method="post" action="?/leave">
				<button class="btn btn-text" type="submit">
					<div class="icon-close"></div> Leave Class
				</button>
			</form>
		</header>

		<header>
			<SearchInput placeholder="Search for users and projects..." bind:value={filter} />
		</header>

		<ul class="sec-content list-grid">
			{#each filtered_users as user (user.id)}
				<li><UserCard {user} /></li>
			{:else}
				<li>No matching users.</li>
			{/each}
		</ul>
	</section>
</main>

<dialog bind:this={edit_dialog} class="dialog">
	<div class="dialog-header">
		<h1>Edit Class</h1>
		<form method="dialog">
			<button class="btn" title="Close" aria-label="Close">
				<div class="icon-close"></div>
			</button>
		</form>
	</div>
	<div class="dialog-content">
		<form action="?/update" method="post" class="form">
			<label>
				<span>Class Name</span>
				<input type="text" class="input" name="name" value={group.name} />
			</label>
			<label>
				<span>Join Code</span>
				<div class="input-group">
					<input
						type="text"
						class="input join-code"
						name="secret"
						autocomplete="off"
						spellcheck="false"
						placeholder="(unjoinable)"
						bind:value={secret_input}
					/>
					<button
						type="button"
						class="btn"
						aria-label="Randomize join code"
						onclick={() => (secret_input = '(randomize join code)')}
					>
						<div class="icon-redo"></div>
					</button>
				</div>
			</label>
			<button type="submit" class="btn">Update</button>
		</form>
	</div>
</dialog>

<dialog bind:this={join_code_dialog} class="dialog dialog-full">
	<div class="dialog-header">
		<h1>Join Code for {group.name}</h1>
		<form method="dialog">
			<button class="btn" title="Close" aria-label="Close">
				<div class="icon-close"></div>
			</button>
		</form>
	</div>

	<div class="dialog-content join-content">
		<div class="join-info">Join at <code>{page.url.host}</code></div>
		<div class="join-code-display">{group.secret || '------'}</div>
	</div>
</dialog>

<style>
	.spacer {
		flex: 1;
	}

	.join-code {
		text-transform: uppercase;
	}

	.join-content {
		height: calc(100dvh - 7rem);
	}

	.join-info {
		font-weight: bold;
		font-size: 2rem;
	}

	.join-code-display {
		text-align: center;
		text-transform: uppercase;
		font-family: var(--font-mono);
		font-feature-settings: 'liga' 0, 'zero' 1;
		font-weight: 900;
		font-size: 18vw;
		line-height: 18vw;
		letter-spacing: 2vw;
		background-color: white;
		color: black;
		padding: 1rem 2rem;
		margin-block: 3rem;
		border-radius: 2vw;
	}
</style>

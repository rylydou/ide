<script lang="ts">
	import { browser } from '$app/environment'
	import { SearchInput, UserCard } from '$lib/components'

	import type { PageData } from './$types'

	export let data: PageData
	const { group } = data

	let edit_dialog: HTMLDialogElement
	let join_code_dialog: HTMLDialogElement

	let filter = ''

	$: filtered_users = filter
		? group.users.filter(
				(user) =>
					user.name.includes(filter) || user.projects.some(({ name }) => name.includes(filter)),
			)
		: group.users
</script>

<svelte:head>
	<title>{data.group.name}</title>
</svelte:head>

<main class="dash-layout">
	<header>
		<h1>{data.group.name}</h1>
	</header>

	<section>
		<header>
			<a class="btn btn-text" href="/"> <div class="icon-home"></div> Home</a>

			{#if data.session.user.is_admin}
				<button class="btn btn-text" on:click={() => edit_dialog.showModal()}>
					<div class="icon-pencil"></div>Edit Class
				</button>
				<button
					class="btn btn-text"
					disabled={!group.secret}
					on:click={() => join_code_dialog.showModal()}
				>
					<div class="icon-expand"></div> Show Join Code
				</button>
			{/if}

			<div style="flex: 1;"></div>
		</header>

		<header>
			<SearchInput placeholder="Search for users and projects..." bind:value={filter} />
		</header>

		<ul class="sec-content list-grid">
			{#each filtered_users as user (user.id)}
				<li>
					<UserCard {user} />
				</li>
			{/each}
		</ul>
	</section>
</main>

<dialog bind:this={edit_dialog} class="dialog">
	<div class="dialog-header">
		<h1>Edit Class</h1>
		<form method="dialog">
			<button class="btn" title="Close">
				<div class="icon-close"></div>
			</button>
		</form>
	</div>
	<div class="dialog-content">
		<form action={`${data.group.id}`} method="post" class="form">
			<label>
				<span>Class Name</span>
				<input type="text" class="input" name="name" value={data.group.name} />
			</label>
			<label>
				<span>Join Code</span>
				<div class="input-group">
					<input
						type="text"
						class="input"
						name="secret"
						autocomplete="off"
						spellcheck="false"
						placeholder="(unjoinable)"
						style="text-transform: uppercase;"
						bind:value={data.group.secret}
					/>
					<button
						type="button"
						class="btn"
						on:click={() => (data.group.secret = '(randomize join code)')}
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
			<button class="btn" title="Close">
				<div class="icon-close"></div>
			</button>
		</form>
	</div>

	<div class="dialog-content join-content">
		<div class="join-info">Join at <code>{browser ? location.host : ''}</code></div>
		<div class="join-code">{group.secret || '------'}</div>
	</div>
</dialog>

<style lang="scss">
	.join-content {
		height: calc(100vh - 7rem);
	}

	.join-info {
		font-weight: bold;
		font-size: 2rem;
	}

	.join-code {
		text-align: center;
		text-transform: uppercase;
		font-family: var(--font-mono);
		font-feature-settings:
			'liga' 0,
			'zero' 1;
		font-weight: 900;
		font-size: 18vw;
		line-height: 18vw;
		letter-spacing: 2vw;
		background-color: white;
		color: black;
		padding: 1rem 2rem;
		margin-block: 3rem;
		border-radius: var(--radius-lg);
		// rotate: -1deg;
	}
</style>

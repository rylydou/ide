<script lang="ts">
	import { ProjectCard, SearchInput } from '$lib/components'

	import { flip } from 'svelte/animate'
	import { expoOut as easing } from 'svelte/easing'
	import { crossfade, scale } from 'svelte/transition'
	import type { PageData } from './$types'

	export let data: PageData

	let users_filter = ''

	$: filtered_users = users_filter
		? data.users.filter((user) => {
				return user.name.toLowerCase().includes(users_filter.toLowerCase())
			})
		: data.users

	const [send, receive] = crossfade({
		duration: 200,
		easing,
		fallback: (node) => scale(node, { duration: 200 }),
	})
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
			<SearchInput placeholder="Search your projects..." bind:value={users_filter} />
			<div class="buttons">
				<a class="btn btn-accent btn-text" href="/project/new" data-sveltekit-preload-data="off"
					>New Project</a
				>
			</div>
		</header>
		<ul class="sec-content list-grid">
			{#each filtered_users as project (project.id)}
				<li
					animate:flip={{ duration: 200, easing }}
					out:send={{ key: project.id }}
					in:receive={{ key: project.id }}
				>
					<ProjectCard {project} />
				</li>
			{:else}
				<li>{users_filter ? 'No results' : 'No one is in this class'}</li>
			{/each}
		</ul>
	</section>
</main>

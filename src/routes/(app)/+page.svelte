<script lang="ts">
	import { greet } from '$lib'
	import { GroupCard, ProjectCard, SearchInput } from '$lib/components'
	import type { PageData } from './$types'
	import { page } from '$app/stores'
	import { crossfade } from 'svelte/transition'

	export let data: PageData

	const greeting = greet($page.data.session!)

	let projects_filter = ''

	$: filtered_projects = projects_filter
		? data.projects.filter((project) => {
				return project.name.toLowerCase().includes(projects_filter.toLowerCase())
			})
		: data.projects

	const [send, receive] = crossfade({ duration: 200 })
</script>

<main class="dash-layout">
	<header>
		<h1>{greeting}</h1>
	</header>

	<section>
		<div class="sec-content list-grid">
			{#each data.groups as group (group.id)}
				<GroupCard {group} />
			{/each}
			{#if $page.data.session?.user.is_admin}
				<div class="card-group">
					<div class="card card-new">
						<a class="card-link" href="/join">Join class</a>
						<span>Join a class</span>
					</div>
					<div class="card card-new">
						<a class="card-link" href="/class/new" data-sveltekit-preload-data="off">Create class</a
						>
						<span>Create a class</span>
					</div>
				</div>
			{:else}
				<div class="card card-new">
					<a class="card-link" href="/join">Join a class</a>
					<span><div class="icon-add"></div> Join a class</span>
				</div>
			{/if}
		</div>
	</section>

	<section>
		<header>
			<SearchInput placeholder="Search your projects..." bind:value={projects_filter} />
			<div class="buttons">
				<a class="btn btn-accent btn-text" href="/project/new" data-sveltekit-preload-data="off"
					>New Project</a
				>
			</div>
		</header>
		<div class="sec-content list-grid">
			{#each filtered_projects as project (project.id)}
				<ProjectCard {project} />
			{/each}
		</div>
	</section>
</main>

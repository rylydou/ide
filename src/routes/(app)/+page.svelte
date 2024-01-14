<script lang="ts">
	import { greet } from '$lib'
	import { ProjectCard, SearchInput } from '$lib/components'
	import type { PageData } from './$types'

	export let data: PageData

	const greeting = greet(data.session)
</script>

<main class="dash-layout">
	<header>
		<h1>{greeting}</h1>
	</header>

	<section>
		<header>
			<SearchInput placeholder="Search your projects..." />
			<div class="buttons">
				<button class="btn btn-accent btn-text">New Project</button>
			</div>
		</header>
		{#each data.projects as project}
			<ProjectCard {project} />
		{/each}
	</section>
</main>

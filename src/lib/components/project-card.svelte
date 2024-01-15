<script lang="ts">
	import { Timestamp } from '$lib/components'
	import type { ProjectInfo } from '$lib/server/db/schema'
	import type { CrossfadeParams, TransitionConfig } from 'svelte/transition'

	export let project: ProjectInfo
	export let send: (
		node: any,
		params: CrossfadeParams & {
			key: any
		},
	) => () => TransitionConfig
	export let receive: (
		node: any,
		params: CrossfadeParams & {
			key: any
		},
	) => () => TransitionConfig
</script>

<article
	class="card project-card"
	out:send={{ key: project.id, duration: 1000 }}
	in:receive={{ key: project.id, duration: 1000 }}
>
	<a class="card-link" href={`/project/${project.id}`}>Open {project.name}</a>
	<h3>{project.name}</h3>
	<span>Updated <Timestamp date={project.updated_at} /></span>
</article>

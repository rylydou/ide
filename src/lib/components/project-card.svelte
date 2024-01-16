<script lang="ts">
	import { Timestamp } from '$lib/components'
	import type { ProjectInfo } from '$lib/server/db/schema'

	export let project: ProjectInfo
</script>

<article class="card project-card">
	<a class="card-link" href={`/project/${project.id}`}>Open {project.name}</a>
	<h3>{project.name}</h3>
	<span>Updated <Timestamp date={project.updated_at} /></span>
</article>

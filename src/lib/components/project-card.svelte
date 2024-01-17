<script lang="ts">
	import { Timestamp } from '$lib/components'

	export let id: number
	export let name: string
	export let updated_at: Date
</script>

<article class="card project-card">
	<a class="card-link" href={`/project/${id}`}>Open {name}</a>
	<h3>{name}</h3>
	<span>Updated <Timestamp date={updated_at} /></span>
</article>

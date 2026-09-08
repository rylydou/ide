<script lang="ts">
	import { loadProject } from '$lib'
	import { Embed } from '$lib/components'
	import type { PageProps } from './$types'

	let { data }: PageProps = $props()

	const project = $derived(data.project)
	const code = $derived(loadProject(project.data))
</script>

<svelte:head>
	<title>{project.name} — by {project.author.name}</title>
</svelte:head>

<Embed
	html={code.htmlCode}
	css={code.cssCode}
	js={code.jsCode}
	title="Browser preview of &quot;{project.name}&quot; by {project.author.name}"
	class="standalone-preview"
/>

<style>
	:global(.standalone-preview) {
		width: 100vw;
		height: 100dvh;
		border: none;
		background-color: white;
	}
</style>

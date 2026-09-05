<script lang="ts">
	import { load_project } from '$lib'
	import { Embed } from '$lib/components'
	import type { PageProps } from './$types'

	let { data }: PageProps = $props()

	const project = $derived(data.project)
	const code = $derived(load_project(project.data))
</script>

<svelte:head>
	<title>{project.name} — by {project.author.name}</title>
</svelte:head>

<Embed
	html={code.html_code}
	css={code.css_code}
	js={code.js_code}
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

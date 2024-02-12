<script lang="ts">
	import { load_project } from '$lib'
	import { Embed } from '$lib/components'
	import reset_css from '$lib/styles/reset.css?inline'
	import { onMount } from 'svelte'
	import type { PageData } from './$types'

	export let data: PageData

	const { project } = data

	let head = '<h1>Loading...</h1>'
	let body = ''
	let js = ''

	onMount(async () => {
		console.log('loading')
		const project_data = await load_project(project.data)
		const code = project_data.css_code.replace(`@import url('reset.css');`, reset_css)
		head = `<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${code}</style>`
		body = project_data.html_code
		js = project_data.js_code
	})
</script>

<Embed
	bind:head
	bind:body
	bind:js
	title={`Browser preview of "${project.name}" by ${project.author.name}`}
	style="width: 100vw; height: 100vh; background-color: white;"
/>

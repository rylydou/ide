<script lang="ts">
	import { cfg } from '$lib'
	import type { editor } from 'monaco-editor/esm/vs/editor/editor.api'
	import { createEventDispatcher, onMount } from 'svelte'

	const dispatcher = createEventDispatcher<{
		changed: void
	}>()

	export let code: string
	export let lang: string
	export let is_dirty = false
	export let editor: editor.IStandaloneCodeEditor | null = null

	let editor_container: HTMLDivElement

	const get_code = () => {
		if (!editor) return
		code = editor.getValue()
	}

	onMount(async () => {
		await import('./monaco_worker')
		const monaco = await import('monaco-editor/esm/vs/editor/editor.api')

		monaco.editor.defineTheme('zuhgy-dark', cfg.monaco_theme)
		editor = monaco.editor.create(editor_container, {
			...cfg.monaco_options,
			value: code,
			language: lang,
		})

		editor.onDidChangeModelContent((e) => {
			is_dirty = true
			dispatcher('changed')
		})
	})
</script>

<div bind:this={editor_container} class="code-editor"> </div>

<style lang="scss">
	.code-editor {
		height: 100%;
	}
</style>

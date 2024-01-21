<script lang="ts">
	import { cfg } from '$lib'
	import hotkeys from 'hotkeys-js'
	import type { editor } from 'monaco-editor/esm/vs/editor/editor.api'
	import { createEventDispatcher, onMount } from 'svelte'

	const dispatch = createEventDispatcher<{
		load: void
		change: void
	}>()

	export let code: string
	export let lang: string
	export let is_dirty = false
	export let editor: editor.IStandaloneCodeEditor | null = null

	let editor_container: HTMLDivElement

	onMount(async () => {
		await import('./monaco_worker')
		const monaco = await import('monaco-editor/esm/vs/editor/editor.api')

		monaco.editor.defineTheme('zuhgy-dark', cfg.monaco_theme)
		editor = monaco.editor.create(editor_container, {
			...cfg.monaco_options,
			value: code,
			language: lang,
		})

		editor.onDidLayoutChange((e) => {
			dispatch('load')
		})

		editor.onDidChangeModelContent((e) => {
			is_dirty = true
			dispatch('change')
		})

		editor.addAction({
			id: 'save',
			label: 'Save',
			keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
			run: () => hotkeys.trigger('ctrl+s'),
		})
	})
</script>

<div bind:this={editor_container} class="code-editor" {...$$restProps}> </div>

<style lang="scss">
	.code-editor {
		height: 100%;
	}
</style>

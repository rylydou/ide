<script lang="ts">
	import { cfg } from '$lib'
	import type { editor as monaco_editor } from 'monaco-editor'
	import type { HTMLAttributes } from 'svelte/elements'

	type Props = Omit<HTMLAttributes<HTMLDivElement>, 'onload' | 'onchange'> & {
		code: string
		lang: string
		is_dirty?: boolean
		editor?: monaco_editor.IStandaloneCodeEditor | null
		onload?: () => void
		onchange?: () => void
		/** Invoked when the user presses Ctrl/Cmd+S inside the editor. */
		onsave?: () => void
	}

	let {
		code,
		lang,
		is_dirty = $bindable(false),
		editor = $bindable(null),
		onload,
		onchange,
		onsave,
		...rest
	}: Props = $props()

	let container: HTMLDivElement

	$effect(() => {
		let instance: monaco_editor.IStandaloneCodeEditor | undefined
		let disposed = false

		const setup = async () => {
			await import('./monaco_worker')
			const monaco = await import('monaco-editor')
			if (disposed) return

			monaco.editor.defineTheme('zuhgy-dark', cfg.monaco_theme)
			instance = monaco.editor.create(container, {
				...cfg.monaco_options,
				value: code,
				language: lang,
			})
			editor = instance

			instance.onDidLayoutChange(() => onload?.())

			instance.onDidChangeModelContent(() => {
				is_dirty = true
				onchange?.()
			})

			instance.addAction({
				id: 'save',
				label: 'Save',
				keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
				run: () => onsave?.(),
			})
		}

		setup()

		return () => {
			disposed = true
			instance?.getModel()?.dispose()
			instance?.dispose()
			editor = null
		}
	})
</script>

<div bind:this={container} class="code-editor" {...rest}></div>

<style>
	.code-editor {
		height: 100%;
	}
</style>

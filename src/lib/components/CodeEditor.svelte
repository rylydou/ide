<script lang="ts">
	import { cfg } from '$lib'
	import type { editor as monacoEditor } from 'monaco-editor'
	import type { HTMLAttributes } from 'svelte/elements'

	type Props = Omit<HTMLAttributes<HTMLDivElement>, 'onload' | 'onchange'> & {
		code: string
		lang: string
		isDirty?: boolean
		editor?: monacoEditor.IStandaloneCodeEditor | null
		onload?: () => void
		onchange?: () => void
		/** Invoked when the user presses Ctrl/Cmd+S inside the editor. */
		onsave?: () => void
	}

	let {
		code,
		lang,
		isDirty = $bindable(false),
		editor = $bindable(null),
		onload,
		onchange,
		onsave,
		...rest
	}: Props = $props()

	let container: HTMLDivElement

	$effect(() => {
		let instance: monacoEditor.IStandaloneCodeEditor | undefined
		let disposed = false

		const setup = async () => {
			await import('./monacoWorker')
			const monaco = await import('monaco-editor')
			if (disposed) return

			monaco.editor.defineTheme('zuhgy-dark', cfg.monacoTheme)
			instance = monaco.editor.create(container, {
				...cfg.monacoOptions,
				value: code,
				language: lang,
			})
			editor = instance

			instance.onDidLayoutChange(() => onload?.())

			instance.onDidChangeModelContent(() => {
				isDirty = true
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

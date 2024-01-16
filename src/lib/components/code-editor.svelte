<script lang="ts">
	import { cfg } from '$lib'
	import { onMount } from 'svelte'

	export let code: string
	export let lang: string

	let editor_container: HTMLDivElement

	onMount(async () => {
		await import('$lib/user_worker')
		const monaco = await import('monaco-editor/esm/vs/editor/editor.api')

		monaco.editor.defineTheme('zuhgy-dark', cfg.monaco_theme)
		const editor = monaco.editor.create(editor_container, {
			value: code,
			language: lang,
			automaticLayout: true,
			theme: 'zuhgy-dark',
			minimap: {
				enabled: false,
			},
			bracketPairColorization: {
				enabled: true,
			},
			fontFamily: 'JetBrains Mono',
			fontSize: 16,
			fontLigatures: false,
			cursorBlinking: 'phase',
			cursorSmoothCaretAnimation: 'on',
			renderWhitespace: 'boundary',
			insertSpaces: false,
			tabSize: 2,
			lineNumbers: 'off',
			glyphMargin: false,
			folding: false,
			overviewRulerLanes: 0,
			scrollbar: {
				vertical: 'hidden',
				horizontal: 'hidden',
			},
			padding: {
				top: 10,
				bottom: 10,
			},
			renderLineHighlight: 'none',
			colorDecorators: true,
			defaultColorDecorators: true,
			mouseWheelZoom: true,
			suggestFontSize: 16,
			suggestLineHeight: 28,
			wordBasedSuggestions: 'off',
			suggest: {
				preview: true,
				showWords: false,
				showStatusBar: true,
			},
			smoothScrolling: true,
			guides: {
				indentation: false,
			},
			wordWrap: 'on',
		})

		Object.assign(monaco.languages.html.htmlDefaults.options, {
			endWithNewline: true,
			wrapLineLength: 100,
			wrapAttributes: 'auto',
		})
		monaco.languages.typescript.
	})
</script>

<div bind:this={editor_container} class="code-editor"> </div>

<style lang="scss">
	.code-editor {
		height: 100%;
	}
</style>

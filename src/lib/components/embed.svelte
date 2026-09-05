<script lang="ts">
	import reset_css from '$lib/styles/reset.css?inline'
	import { untrack } from 'svelte'
	import type { HTMLIframeAttributes } from 'svelte/elements'

	type Props = Omit<HTMLIframeAttributes, 'srcdoc' | 'sandbox'> & {
		html?: string
		css?: string
		js?: string
		/** How long to wait after the last edit before re-rendering, in ms. */
		delay?: number
	}

	let { html = '', css = '', js = '', delay = 1000, ...rest }: Props = $props()

	// Written this way because Svelte parses `<style>`/`<script>` in the source
	// textually — a literal tag here would end this component's script block.
	const tag = (name: string, content: string) => `<${name}>${content}</${name}>`

	// A closing script tag inside user JS would otherwise terminate the block early.
	const escape_script = (code: string) => code.replace(/<\/script/gi, '<\\/script')

	const build = (html: string, css: string, js: string) => [
		'<!doctype html><html lang="en"><head>',
		'<meta charset="UTF-8">',
		'<meta name="viewport" content="width=device-width, initial-scale=1.0">',
		'<base target="_blank">',
		tag('style', css.replace(`@import url('reset.css');`, reset_css)),
		'</head><body>',
		html,
		tag('script', escape_script(js)),
		'</body></html>',
	].join('')

	const next = $derived(build(html, css, js))

	let srcdoc = $state(untrack(() => build(html, css, js)))

	$effect(() => {
		if (next === srcdoc) return
		const timer = setTimeout(() => (srcdoc = next), delay)
		return () => clearTimeout(timer)
	})
</script>

<!--
	Deliberately no `allow-same-origin`: the preview runs student code, and without it
	the iframe gets an opaque origin that cannot reach this document, its cookies, or storage.
-->
<iframe {srcdoc} sandbox="allow-scripts allow-popups allow-modals allow-forms" {...rest}></iframe>

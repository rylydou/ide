<script lang="ts">
	import '$lib/styles/reset.css'
	import '$lib/styles/tokens.css'
	import '$lib/styles/global.css'
	import '$lib/styles/parts/button.css'
	import '$lib/styles/parts/dialog.css'
	import '$lib/styles/parts/form.css'
	import '$lib/styles/parts/tab.css'
	import 'virtual:uno.css'

	import type { Snippet } from 'svelte'

	let { children }: { children: Snippet } = $props()
</script>

{@render children()}

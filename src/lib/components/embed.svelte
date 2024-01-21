<script lang="ts">
	import { browser } from '$app/environment'
	import { debounce } from '$lib'

	export let head = ''
	export let body = ''
	export let js = ''

	let iframe: HTMLIFrameElement

	const run_js = debounce(() => {
		if (!browser) return
		if (!iframe) return
		const window = iframe.contentWindow
		if (!window) return

		try {
			window.eval(js)
		} catch {
			console.warn('Failed to eval() user js.')
		}
	}, 1000)

	$: {
		if (iframe) {
			const doc = iframe.contentDocument!
			const head_element = doc.querySelector('head') as HTMLHeadElement
			head_element.innerHTML = head
		}
	}

	$: {
		if (iframe) {
			const doc = iframe.contentDocument!
			const body_element = doc.querySelector('body') as HTMLBodyElement
			body_element.innerHTML = body

			for (const link of body_element.querySelectorAll('a')) {
				link.setAttribute('target', '_blank')
			}

			run_js()
		}
	}

	$: {
		if (iframe && js) {
			run_js()
		}
	}
</script>

<iframe bind:this={iframe} {...$$restProps}> </iframe>

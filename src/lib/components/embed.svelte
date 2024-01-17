<script lang="ts">
	export let head = ''
	export let body = ''

	let iframe: HTMLIFrameElement

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
		}
	}
</script>

<iframe bind:this={iframe} {...$$restProps}> </iframe>

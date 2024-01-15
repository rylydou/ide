<script lang="ts">
	import { onMount } from 'svelte'

	export let date: Date
	export let relative = false
	export let update_delay_ms = 10_000

	let str = ''
	const intl = new Intl.RelativeTimeFormat(undefined, { style: 'long' })

	const update = () => {
		date = date
	}

	$: {
		const now = new Date()
		const delta = Math.floor((date.getTime() - now.getTime()) / 1000)
		const abs = Math.abs(delta)

		if (abs < 60) {
			str = intl.format(delta, 'second')
			setTimeout(update, 10_000)
		} else if (abs < 60 * 60) {
			str = intl.format(Math.floor(delta / 60), 'minute')
			setTimeout(update, 60_000)
		} else if (abs < 60 * 60 * 24) {
			str = intl.format(Math.floor(delta / 60 / 60), 'hour')
			setTimeout(update, 3_600_000)
		} else if (date.getUTCFullYear() < now.getUTCFullYear()) {
			str = date.toLocaleDateString(undefined, {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
			})
		} else if (date > new Date(now.getDate() - 1)) {
			str = 'Yesterday'
		} else {
			str = date.toLocaleDateString(undefined, {
				month: 'short',
				day: 'numeric',
			})
		}
	}
</script>

<time datetime={date.toUTCString()}>{str}</time>

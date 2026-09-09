<script lang="ts">
	let { date }: { date: Date } = $props()

	const relative = new Intl.RelativeTimeFormat(undefined, { style: 'long' })

	const MINUTE = 60_000
	const HOUR = 60 * MINUTE
	const DAY = 24 * HOUR

	// Ticks only as often as the displayed unit can change.
	let now = $state(Date.now())

	const delta = $derived(date.getTime() - now)
	const abs = $derived(Math.abs(delta))

	const label = $derived.by(() => {
		if (abs < MINUTE) return 'just now'
		if (abs < HOUR) return relative.format(Math.round(delta / MINUTE), 'minute')
		if (abs < DAY) return relative.format(Math.round(delta / HOUR), 'hour')
		if (abs < 2 * DAY && delta < 0) return 'Yesterday'

		return date.toLocaleDateString(undefined, {
			year: date.getFullYear() === new Date(now).getFullYear() ? undefined : 'numeric',
			month: 'short',
			day: 'numeric',
		})
	})

	$effect(() => {
		if (abs >= DAY) return

		const interval = setInterval(() => (now = Date.now()), abs < HOUR ? MINUTE : HOUR)
		return () => clearInterval(interval)
	})
</script>

<time datetime={date.toISOString()}>{label}</time>

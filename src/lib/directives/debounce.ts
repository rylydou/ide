import type { Action } from 'svelte/action'


export const debounce: Action<HTMLElement, { callback: Function, duration: number }> = (node, params) => {
	let timeout: number

	return {
		update(params) {
			clearTimeout(timeout)
			timeout = setTimeout(params.callback, params.duration)
		},
		destroy() {
			clearTimeout(timeout)
		},
	}
}

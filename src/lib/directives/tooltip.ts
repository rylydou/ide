import type { Action } from 'svelte/action'


export const tooltip: Action<HTMLElement, string> = (node, tooltip) => {
	const directive: ReturnType<Action<HTMLElement, string>> = {
		update(tooltip) {
			node.setAttribute('title', tooltip)
			node.setAttribute('data-tooltip', tooltip)
		},
	}
	directive.update?.(tooltip)
	return directive
}

import type { Action } from 'svelte/action'


/** Keeps a text input exactly as wide as its content. */
export const autoSize: Action<HTMLInputElement> = (input) => {
	const resize = () => {
		input.style.width = '0'
		input.style.width = `${input.scrollWidth}px`
	}

	input.addEventListener('input', resize)
	input.addEventListener('blur', resize)
	resize()

	return {
		destroy: () => {
			input.removeEventListener('input', resize)
			input.removeEventListener('blur', resize)
		},
	}
}

import type { Action } from 'svelte/action'


export const auto_size: Action<HTMLInputElement> = (input) => {
	const resize = () => {
		input.style.width = '0'
		input.style.width = input.scrollWidth + 'px'
	}

	input.addEventListener('input', resize)
	input.addEventListener('blur', resize)
	resize()

	return {
		destroy() {
			input.removeEventListener('input', resize)
		}
	}
}

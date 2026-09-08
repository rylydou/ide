import type { Action } from 'svelte/action'


type Hotkey = {
	/** Lowercase `event.key`, e.g. `'s'`. */
	key: string
	/** Require Ctrl (or Cmd on macOS). */
	mod?: boolean
	shift?: boolean
	handler: () => void
}


/**
 * Binds a document-level keyboard shortcut for as long as the node is mounted.
 * Replaces the `hotkeys-js` dependency, which only ever bound Ctrl+S.
 */
export const hotkey: Action<HTMLElement, Hotkey> = (_node, initial) => {
	let hotkey = initial

	const onKeydown = (event: KeyboardEvent) => {
		if (event.key.toLowerCase() !== hotkey.key) return
		if (!!hotkey.mod !== (event.ctrlKey || event.metaKey)) return
		if (!!hotkey.shift !== event.shiftKey) return

		event.preventDefault()
		hotkey.handler()
	}

	document.addEventListener('keydown', onKeydown)

	return {
		update: (next) => (hotkey = next),
		destroy: () => document.removeEventListener('keydown', onKeydown),
	}
}

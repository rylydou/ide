import type { Readable } from 'svelte/store'


// export const debounce = <T>(store: Readable<T>, callback: (value: T) => void, duration = 500) => {
// 	let timeout: ReturnType<typeof setTimeout>
// 	store.subscribe((value) => {
// 		clearTimeout(timeout)
// 		timeout = setTimeout(() => callback(value), duration)
// 	})
// }


export const debounce = (callback: () => void, duration = 300) => {
	let timeout: ReturnType<typeof setTimeout>

	callback()

	return () => {
		clearTimeout(timeout)
		timeout = setTimeout(() => callback(), duration)
	}
}

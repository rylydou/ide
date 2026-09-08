import { applyAction } from '$app/forms'
import type { SubmitFunction } from '@sveltejs/kit'


/**
 * Shared state + `use:enhance` handler for the auth forms: tracks the in-flight
 * state and surfaces the server's `fail()` message instead of a full page reload.
 */
export const createForm = () => {
	let message = $state('')
	let isWaiting = $state(false)

	const submit: SubmitFunction = () => {
		isWaiting = true
		message = ''

		return async ({ result }) => {
			isWaiting = false

			switch (result.type) {
				case 'failure':
					message = String(result.data?.message ?? 'Something went wrong')
					return
				case 'error':
					message = String(result.error ?? 'An error occurred')
					return
				default:
					await applyAction(result)
			}
		}
	}

	return {
		get message() { return message },
		set message(value: string) { message = value },
		get isWaiting() { return isWaiting },
		submit,
	}
}

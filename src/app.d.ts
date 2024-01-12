// See https://kit.svelte.dev/docs/types#app

import type { UserSession } from './routes/stores'

// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			message: string
		}
		interface Locals {
			user_session: UserSession
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export { }

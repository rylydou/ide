import { AuthSession } from './lib/types/auth-session'

declare global {
	namespace App {
		interface Error {
			message?: string
		}
		interface Locals {
			session?: AuthSession | null
		}
		interface PageData {
			session?: AuthSession | null
		}
		// interface PageState {}
		// interface Platform {}
	}
}


export { }

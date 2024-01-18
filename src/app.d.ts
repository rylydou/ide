import { AuthSession } from './lib/types/auth-session'

declare global {
	namespace App {
		interface Error {
			message?: string
		}
		interface Locals {
			session?: AuthSession
		}
		interface PageData {
			session?: AuthSession
		}
		// interface PageState {}
		// interface Platform {}
	}
}


export { }

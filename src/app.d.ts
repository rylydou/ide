import type { UserSession } from '$lib/types'

declare global {
	namespace App {
		interface Error {
			message?: string
		}
		interface Locals {
			session?: UserSession
		}
		interface PageData {
			session?: UserSession
		}
	}
}

export {}

import type { Token, User } from '$lib/server/db/schema'
import { writable } from 'svelte/store'


export interface UserSession {
	id: number
	name: string
	created_at: Date
	token: Token
}

export const user_session = writable<UserSession | undefined>(undefined)

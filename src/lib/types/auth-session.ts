export interface AuthSession {
	token: string
	expires: Date
	user: {
		id: number
		name: string
		email: string
		created_at: Date
		is_admin: boolean
	},
}

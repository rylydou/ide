export interface AuthSession {
	token: string
	expires: Date
	user: {
		id: number
		name: string
		is_admin: boolean
	},
}

export interface AuthSession {
	user: {
		id: number
		name: string
	},
	token: string
	expires: Date
}

export interface AuthSession {
	token: string
	expires: Date
	user: {
		id: number
		name: string
		email: string
		createdAt: Date
		isAdmin: boolean
	}
}

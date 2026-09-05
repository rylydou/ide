import type { AuthSession } from './types'


export const greet = ({ user }: AuthSession) => {
	const date = new Date()
	const is_halloween = date.getMonth() === 9 && date.getDate() === 31
	const time_of_day = date.getHours() >= 12 ? 'Afternoon' : 'Morning'

	return is_halloween
		? `Bad ${time_of_day} ${user.name} 🦇🕷️`
		: `Good ${time_of_day} ${user.name}`
}

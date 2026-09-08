import type { AuthSession } from './types'


export const greet = ({ user }: AuthSession) => {
	const date = new Date()
	const isHalloween = date.getMonth() === 9 && date.getDate() === 31
	const timeOfDay = date.getHours() >= 12 ? 'Afternoon' : 'Morning'

	return isHalloween
		? `Bad ${timeOfDay} ${user.name} 🦇🕷️`
		: `Good ${timeOfDay} ${user.name}`
}

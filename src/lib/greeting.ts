import type { UserSession } from './types'


export const greet = ({ name }: UserSession) => {
	const date = new Date()
	const isHalloween = date.getMonth() === 9 && date.getDate() === 31
	const timeOfDay = date.getHours() >= 12 ? 'Afternoon' : 'Morning'

	return isHalloween ? `Bad ${timeOfDay} ${name} 🦇🕷️` : `Good ${timeOfDay} ${name}`
}

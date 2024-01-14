import type { AuthSession } from './types'


export function greet(session: AuthSession): string {
	const date = new Date()
	const hour = date.getHours()
	const month = date.getMonth()
	const day = date.getDate()
	const is_halloween = month == 9 && day == 31
	const is_birthday = false

	const time_str = hour >= 12 ? 'Afternoon' : 'Morning'

	let template = 'Good {time} {first_name}'
	if (is_halloween)
		template = 'Bad {time} {first_name} 🦇🕷️'

	return template
		.replace('{time}', time_str)
		.replace('{first_name}', session.user.name)
}

export const futureDate = (days: number) => {
	const date = new Date()
	date.setDate(date.getDate() + days)
	return date
}

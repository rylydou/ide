import { rand } from '$lib'


export const pick_random = <T>(arr: T[]): T => {
	return arr[rand.irange(0, arr.length - 1)]
}

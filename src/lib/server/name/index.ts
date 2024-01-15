import { pick_random } from '$lib'
import { adjs } from './adjs'
import { nouns } from './nouns'


export const random_name = () => {
	const adj = pick_random(adjs)
	const noun = pick_random(nouns)

	return `${adj} ${noun}`
}

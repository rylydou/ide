import { pickRandom } from '$lib'
import { adjs } from './adjs'
import { nouns } from './nouns'


export const randomName = () => `${pickRandom(adjs)} ${pickRandom(nouns)}`

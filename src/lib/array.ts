import { rand } from '$lib'


export const pickRandom = <T>(array: T[]): T => array[rand.irange(0, array.length - 1)]!

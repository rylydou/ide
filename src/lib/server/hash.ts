import { cfg } from '$lib'
import bcrypt from 'bcrypt'


export const encrypt = async (plaintext: string) => {
	return await bcrypt.hash(plaintext, cfg.encryption_salt_rounds)
}


export const check = async (plaintext: string, encrypted: string) => {
	return await bcrypt.compare(plaintext, encrypted)
}

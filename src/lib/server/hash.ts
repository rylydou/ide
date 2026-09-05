import { argon2 } from '$lib/config'


/** Hashes a plaintext password with argon2id via Bun's native implementation. */
export const encrypt = async (plaintext: string) => await Bun.password.hash(plaintext, argon2)


/**
 * Verifies a plaintext password against a stored hash.
 * The algorithm is detected from the hash prefix, so legacy bcrypt (`$2b$`)
 * hashes from the pre-Postgres database still verify.
 */
export const check = async (plaintext: string, encrypted: string) => {
	try {
		return await Bun.password.verify(plaintext, encrypted)
	} catch {
		return false
	}
}


/** True if `encrypted` uses an older algorithm and should be re-hashed on next successful login. */
export const needs_rehash = (encrypted: string) => !encrypted.startsWith('$argon2id$')

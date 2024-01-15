// https://github.com/ai/nanoid

import { webcrypto as crypto } from 'node:crypto'


export const url_alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-'
// Excludes(similar letter): Z(2) I(1) O(0) L(1)
export const human_alphabet = '1234567890ABCDEFGHJKMNPQRTUVWXY'


export const url_id = custom_alphabet(url_alphabet, 15)
export const human_id = custom_alphabet(human_alphabet, 6)


// It is best to make fewer, larger requests to the crypto module to
// avoid system call overhead. So, random numbers are generated in a
// pool. The pool is a Buffer that is larger than the initial random
// request size by this multiplier. The pool is enlarged if subsequent
// requests exceed the maximum buffer size.
const POOL_SIZE_MULTIPLIER = 128
let pool: Uint8Array
let poolOffset: number


function fill_pool(bytes: number) {
	if (!pool || pool.length < bytes) {
		pool = Buffer.allocUnsafe(bytes * POOL_SIZE_MULTIPLIER)
		crypto.getRandomValues(pool)
		poolOffset = 0
	} else if (poolOffset + bytes > pool.length) {
		crypto.getRandomValues(pool)
		poolOffset = 0
	}
	poolOffset += bytes
}


export function nanoid(size = 21) {
	// `-=` convert `size` to number to prevent `valueOf` abusing
	fill_pool((size -= 0))
	let id = ''
	// We are reading directly from the random pool to avoid creating new array
	for (let i = poolOffset - size; i < poolOffset; i++) {
		// It is incorrect to use bytes exceeding the alphabet size.
		// The following mask reduces the random byte in the 0-255 value
		// range to the 0-63 value range. Therefore, adding hacks, such
		// as empty string fallback or magic numbers, is unnecessary because
		// the bitmask trims bytes down to the alphabet size.
		id += url_alphabet[pool[i] & 63]
	}
	return id
}


export function custom_alphabet(alphabet: string, default_size = 21) {
	return custom_random(alphabet, default_size, random)
}


export function random(bytes: number) {
	// `-=` convert `bytes` to number to prevent `valueOf` abusing
	fill_pool((bytes -= 0))
	return pool.subarray(poolOffset - bytes, poolOffset)
}


export function custom_random(alphabet: string, default_size: number, getRandom: (bytes: number) => Uint8Array) {
	// First, a bitmask is necessary to generate the ID. The bitmask makes bytes
	// values closer to the alphabet size. The bitmask calculates the closest
	// `2^31 - 1` number, which exceeds the alphabet size.
	// For example, the bitmask for the alphabet size 30 is 31 (00011111).
	let mask = (2 << (31 - Math.clz32((alphabet.length - 1) | 1))) - 1
	// Though, the bitmask solution is not perfect since the bytes exceeding
	// the alphabet size are refused. Therefore, to reliably generate the ID,
	// the random bytes redundancy has to be satisfied.

	// Note: every hardware random generator call is performance expensive,
	// because the system call for entropy collection takes a lot of time.
	// So, to avoid additional system calls, extra bytes are requested in advance.

	// Next, a step determines how many random bytes to generate.
	// The number of random bytes gets decided upon the ID size, mask,
	// alphabet size, and magic number 1.6 (using 1.6 peaks at performance
	// according to benchmarks).
	let step = Math.ceil((1.6 * mask * default_size) / alphabet.length)

	return (size = default_size) => {
		let id = ''
		while (true) {
			let bytes = getRandom(step)
			// A compact alternative for `for (let i = 0; i < step; i++)`.
			let i = step
			while (i--) {
				// Adding `|| ''` refuses a random byte that exceeds the alphabet size.
				id += alphabet[bytes[i] & mask] || ''
				if (id.length === size) return id
			}
		}
	}
}

// Adapted from https://github.com/ai/nanoid — trimmed to the two id shapes this app needs
// and rebuilt on the global Web Crypto API instead of `node:crypto`.

export const url_alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-'

/** Excludes characters that are easy to misread aloud or in a handwritten class code. */
export const human_alphabet = 'abcdefghjkmnpqrtuvwxy'


/**
 * Builds a generator of unbiased random ids over `alphabet`.
 * Bytes outside the alphabet range are rejected rather than folded, so every character is equally likely.
 */
export const custom_alphabet = (alphabet: string, default_size: number) => {
	const mask = (2 << (31 - Math.clz32((alphabet.length - 1) | 1))) - 1
	// 1.6x overdraw so a single getRandomValues call usually suffices even with rejections
	const step = Math.ceil((1.6 * mask * default_size) / alphabet.length)

	return (size = default_size) => {
		const bytes = new Uint8Array(step)
		let id = ''

		while (id.length < size) {
			crypto.getRandomValues(bytes)
			for (const byte of bytes) {
				id += alphabet[byte & mask] ?? ''
				if (id.length === size) break
			}
		}

		return id
	}
}


export const nanoid = custom_alphabet(url_alphabet, 21)
export const url_id = custom_alphabet(url_alphabet, 15)
export const human_id = custom_alphabet(human_alphabet, 6)


/**
 * Normalizes a hand-typed class secret. `human_alphabet` already omits the
 * usual lookalikes, so this only has to strip the separators and whitespace
 * people add when copying a code off a whiteboard.
 */
export const fix_ambiguous = (str: string) => str.toLowerCase().replace(/[^a-z]/g, '')

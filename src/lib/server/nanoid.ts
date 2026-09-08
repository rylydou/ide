// Adapted from https://github.com/ai/nanoid — trimmed to the two id shapes this app needs
// and rebuilt on the global Web Crypto API instead of `node:crypto`.

export const urlAlphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-'

/** Excludes characters that are easy to misread aloud or in a handwritten class code. */
export const humanAlphabet = 'abcdefghjkmnpqrtuvwxy'


/**
 * Builds a generator of unbiased random ids over `alphabet`.
 * Bytes outside the alphabet range are rejected rather than folded, so every character is equally likely.
 */
export const customAlphabet = (alphabet: string, defaultSize: number) => {
	const mask = (2 << (31 - Math.clz32((alphabet.length - 1) | 1))) - 1
	// 1.6x overdraw so a single getRandomValues call usually suffices even with rejections
	const step = Math.ceil((1.6 * mask * defaultSize) / alphabet.length)

	return (size = defaultSize) => {
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


export const nanoid = customAlphabet(urlAlphabet, 21)
export const urlId = customAlphabet(urlAlphabet, 15)
export const humanId = customAlphabet(humanAlphabet, 6)


/**
 * Normalizes a hand-typed class secret. `humanAlphabet` already omits the
 * usual lookalikes, so this only has to strip the separators and whitespace
 * people add when copying a code off a whiteboard.
 */
export const fixAmbiguous = (str: string) => str.toLowerCase().replace(/[^a-z]/g, '')

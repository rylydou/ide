import bcrypt from 'bcrypt'


export const encrypt = async (plaintext: string) => {
	const result = await bcrypt.hash(plaintext, 10)
	console.log('encrypted:', result)
	return result
}


export const check = async (plaintext: string, encrypted: string) => {
	return await bcrypt.compare(plaintext, encrypted)
}

import bcrypt from 'bcrypt'


const args = process.argv.splice(2)

const plaintext_pwd = args[0]
const salt_rounds = Number(args[1]) || 10

console.log(`hashing "${plaintext_pwd}" with ${salt_rounds} salt rounds...`)

const pwd_hash = bcrypt.hashSync(plaintext_pwd, salt_rounds)

console.log('hashed password:')
console.log(pwd_hash)

import { useDebounce as use_debounce } from '@/hooks'
import { get_group_by_secret } from '@/server'
import form_styles from '@/styles/form.module.scss'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'


export default function Page() {
	async function create(form_data: FormData) {
		'use server'

		console.log('sign in data:', form_data)

		const data = {
			secret: form_data.get('secret'),
			name: form_data.get('name'),
			password: form_data.get('password'),
		}

		redirect('/')
	}


	const [secret, set_secret] = useState('')
	const debounced_secret = use_debounce<string>(secret, 500)

	const [group, set_group] = useState('')

	useEffect(() => {
		get_group_by_secret(debounced_secret).then((group) => {
			if (!group) {
				set_group('Invalid secret code')
				return
			}
			set_group(group.name)
		})
	}, [debounced_secret])

	return <form action={create} className={form_styles.form}>
		<h1>Sign up</h1>
		<label>
			<span>{group ? group : 'Secret code'}</span>
			<input type="text" name='secret' value='test' onChange={(ev) => set_secret(ev.target.value)} />
		</label>

		<label>
			<span>Full name</span>
			<input type="name" name='name' value='Ryly Dou' />
		</label>

		<label>
			<span>Password</span>
			<input type="password" name='password' value='password' />
		</label>
		<button type="submit">Sign up</button>
	</form>
}

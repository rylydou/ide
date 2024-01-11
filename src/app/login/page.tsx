export default function Page() {
	async function create(formData: FormData) {
		'use server'
	}

	return <form action={create}>
		<input type="password" name='secret' />
		<button type="submit">Login</button>
	</form>
}

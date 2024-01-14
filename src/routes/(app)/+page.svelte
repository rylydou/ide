<script lang="ts">
	import { greet } from '$lib'
	import type { PageData } from './$types'

	export let data: PageData

	const greeting = greet(data.session)
</script>

<div class="dash-layout">
	<header>
		<h1>{greeting}</h1>
	</header>

	<main>
		<section>
			<h1></h1>
		</section>
	</main>
</div>

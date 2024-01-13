<script lang="ts">
	import type { PageData } from './$types'

	export let data: PageData
</script>

<h1>Hello {data.session.user.name}</h1>

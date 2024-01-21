<script lang="ts">
	import type { GroupInfo } from '$lib/server/db/schema'

	export let group: GroupInfo
</script>

<div class="card card-sm">
	<a class="card-link" href={`/class/${group.id}`}>Go to {group.name}</a>
	<h3>{group.name}</h3>
</div>

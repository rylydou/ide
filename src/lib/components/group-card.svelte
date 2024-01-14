<script lang="ts">
	import type { GroupInfo } from '$lib/server/db/schema'

	export let group: GroupInfo
</script>

<div class="group-card">
	<h3>{group.name}</h3>
</div>

<style lang="scss">
	.group-card {
		background-color: var(--clr-bg);
		padding: 1rem;

		> h3 {
			font-weight: bold;
		}
	}
</style>

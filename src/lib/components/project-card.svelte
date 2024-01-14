<script lang="ts">
	import type { ProjectInfo } from '$lib/server/db/schema'

	export let project: ProjectInfo
</script>

<div class="project-card">
	<h3>{project.name}</h3>
</div>

<style lang="scss">
	.project-card {
		background-color: var(--clr-bg);
		padding: 1rem;

		> h3 {
			font-weight: bold;
		}
	}
</style>

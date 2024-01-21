<script lang="ts">
	export let user: {
		id: number
		name: string
		projects: {
			id: number
			name: string
			updated_at: Date
			created_at: Date
		}[]
	}
</script>

<div class="user-card">
	<h3>{user.name}</h3>
	<ul>
		{#each user.projects as project}
			<li>
				<a class="link" href={`/project/${project.id}`}>{project.name}</a>
			</li>
		{:else}
			<span style="opacity: .5; font-style: italic;">No projects...</span>
		{/each}
	</ul>
</div>

<style lang="scss">
	.user-card {
		h3 {
			font-weight: bold;
			font-size: 1.5rem;
			line-height: 2.5rem;
		}

		ul {
			list-style: '→  ' inside;
		}
	}
</style>

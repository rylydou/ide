<script lang="ts">
	type Props = {
		user: {
			id: number
			name: string
			projects: {
				id: number
				name: string
			}[]
		}
	}

	let { user }: Props = $props()
</script>

<div class="user-card">
	<h3>{user.name}</h3>
	<ul>
		{#each user.projects as project (project.id)}
			<li>
				<a class="link" href="/project/{project.id}">{project.name || 'Untitled Project'}</a>
			</li>
		{:else}
			<span class="empty">No projects...</span>
		{/each}
	</ul>
</div>

<style>
	.user-card {
		& h3 {
			font-weight: bold;
			font-size: 1.5rem;
			line-height: 2.5rem;
		}

		& ul {
			list-style: '→  ' inside;
		}

		& .empty {
			opacity: 0.5;
			font-style: italic;
		}
	}
</style>

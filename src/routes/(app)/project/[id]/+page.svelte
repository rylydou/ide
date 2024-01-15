<script lang="ts">
	import { Timestamp } from '$lib/components'
	import { auto_size } from '$lib/directives'
	import type { PageData } from './$types'

	export let data: PageData

	let { is_author, project, session } = data
	let has_edited = false
	let is_dirty = false
</script>

<svelte:head>
	<title>{project.name} by {project.author.name}</title>
</svelte:head>

<div class="project-layout">
	<header>
		<div>
			<a class="btn btn-flat" href="/">
				<div class="icon-double-left"></div> Back
			</a>
		</div>

		<div>
			<input
				type="text"
				class="project-name input input-flat"
				placeholder="Unnamed"
				bind:value={data.project.name}
				use:auto_size
			/>
			<h2>by {project.author.name}</h2>
		</div>

		<div>
			<span>
				{has_edited ? 'Last saved' : 'Last updated'}
				<Timestamp date={data.project.updated_at} />
			</span>
			<button class="btn btn-text btn-save btn-accent" class:hidden={!is_dirty && is_author}>
				{is_author ? 'Save' : is_dirty ? 'Fork*' : 'Fork'}
			</button>
		</div>
	</header>

	<label>
		<input type="checkbox" bind:checked={is_author} />
		<span>Author?</span>
	</label>
	<label>
		<input type="checkbox" bind:checked={is_dirty} />
		<span>Dirty?</span>
	</label>
</div>

<style lang="scss">
	.project-layout {
		> header {
			min-height: 4.5rem;
			display: grid;
			grid-template-columns: 1fr auto 1fr;
			padding: 1rem;
			overflow: hidden;

			.btn-save {
				min-width: 5rem;
				margin-right: 0;
				transition: margin-right 600ms cubic-bezier(0.16, 1, 0.3, 1);

				&.hidden {
					margin-right: -6rem;
					transition: margin-right 200ms ease-in-out;
				}
			}

			> * {
				display: flex;
				align-items: center;
			}

			> :nth-child(2) {
				justify-self: center;
			}

			> :last-child {
				justify-self: end;
				gap: 1rem;
			}

			.project-name {
				align-self: center;
				justify-self: center;
				padding: 0.5rem;
				font-weight: bold;
				font-size: 1.25rem;
				min-width: 7rem;
				margin-right: 8px;
				transition: margin-right 200ms ease-in-out;
			}
		}
	}
</style>

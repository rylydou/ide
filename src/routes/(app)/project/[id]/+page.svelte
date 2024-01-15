<script lang="ts">
	import { Timestamp } from '$lib/components'
	import { auto_size } from '$lib/directives'
	import type { PageData } from './$types'
	import { Pane, Splitpanes } from 'svelte-splitpanes'

	export let data: PageData

	let { is_author, project, session } = data
	let has_edited = false
	let is_dirty = true
</script>

<svelte:head>
	<title>{project.name} by {project.author.name}</title>
</svelte:head>

<div class="project-layout">
	<header>
		<div>
			<a class="btn btn-text" href="/"> <div class="icon-double-left"></div> Back</a>
			<button class="btn btn-text"><div class="icon-trash"></div> Delete</button>
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
				{#if is_author}
					<div class="icon-upload"></div>
					Save
				{:else}
					<div class="icon-copy"></div>
					{is_dirty ? 'Fork*' : 'Fork'}
				{/if}
			</button>
		</div>
	</header>

	<Splitpanes theme="" class="content" style="flex: 1; padding: 1rem; padding-top: 0;">
		<Pane>
			<Splitpanes class="code-editors" theme="" horizontal>
				<Pane>
					<div class="panel">
						<div class="panel-header">HTML</div>
						<div class="panel-content"></div>
					</div>
				</Pane>
				<Pane>
					<div class="panel">
						<div class="panel-header">CSS</div>
						<div class="panel-content"></div>
					</div>
				</Pane>
			</Splitpanes>
		</Pane>
		<Pane class="browser">
			<div class="panel">
				<div class="panel-header">Browser</div>
				<div class="panel-content"></div>
			</div>
		</Pane>
	</Splitpanes>
</div>

<style lang="scss">
	.project-layout {
		flex: 1;
		display: flex;
		flex-direction: column;

		> header {
			min-height: 4.5rem;
			display: grid;
			grid-template-columns: 1fr auto 1fr;
			padding: 1rem;
			overflow: hidden;

			> * {
				display: flex;
				align-items: center;
			}

			> :first-child {
				display: flex;
				gap: 1rem;
			}

			> :nth-child(2) {
				display: flex;
				justify-self: center;

				> .project-name {
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

			> :last-child {
				justify-self: end;
				gap: 1rem;

				> .btn-save {
					min-width: 5rem;
					margin-left: 1rem;
					margin-right: 0;
					transition: margin-right 600ms cubic-bezier(0.16, 1, 0.3, 1);

					&.hidden {
						margin-right: -6rem;
						transition: margin-right 200ms ease-in-out;
					}
				}
			}
		}
	}

	.panel {
		width: 100%;
		height: 100%;
		border-radius: var(--radius);
		background-color: var(--clr-bg);
	}

	.panel-header {
		min-height: 2.5rem;
		display: flex;
		align-items: center;
		padding-inline: 1rem;
		font-weight: bold;
	}
</style>

<script lang="ts">
	import { CodeEditor, Timestamp } from '$lib/components'
	import { auto_size } from '$lib/directives'
	import { Pane, Splitpanes } from 'svelte-splitpanes'
	import type { PageData } from './$types'
	import { onMount } from 'svelte'

	export let data: PageData

	let { is_author, project, session } = data
	let has_edited = false
	let is_dirty = true

	let html_code = '<h1 class="hi">Hello World</h1>'

	onMount(() => {
		html_code = document.body.innerHTML
	})
</script>

<svelte:head>
	<title>{project.name} by {project.author.name}</title>
</svelte:head>

<div class="project-layout">
	<header>
		<div>
			<a class="btn btn-text" href="/"> <div class="icon-double-left"></div> Back</a>
			{#if is_author}
				<button class="btn btn-text"><div class="icon-trash"></div> Delete</button>
			{/if}
		</div>

		<div>
			<input
				type="text"
				class="project-name input input-flat"
				placeholder="Untitled Project"
				autocomplete="off"
				spellcheck="false"
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
						<div class="panel-header">
							<div class="panel-header">
								<div class="panel-header-title">HTML</div>
								<div class="panel-header-content"></div>
							</div>
						</div>
						<div class="panel-content">
							<CodeEditor code={html_code} lang="html" />
						</div>
					</div>
				</Pane>
				<Pane>
					<div class="panel">
						<div class="panel-header">
							<div class="panel-header-title">CSS</div>
							<div class="panel-header-content"></div>
						</div>
						<div class="panel-content"></div>
					</div>
				</Pane>
			</Splitpanes>
		</Pane>
		<Pane class="browser">
			<div class="panel">
				<div class="panel-header">
					<div class="panel-header-title">Browser</div>
					<div class="panel-header-content"></div>
				</div>
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
					margin-right: 8px;
					transition: margin-right 200ms ease-in-out;

					&:placeholder-shown {
						min-width: 10rem;
					}
				}
			}

			> :last-child {
				justify-self: end;
				gap: 1rem;

				> .btn-save {
					margin-left: 1rem;
					margin-right: 0;
					transition: margin-right 600ms cubic-bezier(0.16, 1, 0.3, 1);

					min-width: 5rem;

					&.hidden {
						margin-right: -7rem;
						transition: margin-right 200ms ease-in-out;
					}
				}
			}
		}
	}

	.panel {
		width: 100%;
		height: 100%;
		display: grid;
		grid-template-rows: 2.5rem auto;
	}

	.panel-header {
		display: flex;
	}

	.panel-header-title {
		display: flex;
		align-items: center;
		padding-inline: 1.5rem;
		font-weight: bold;
		border-top-left-radius: var(--radius-lg);
		border-top-right-radius: var(--radius-lg);
		background-color: var(--clr-bg);
	}

	.panel-header-content {
		display: flex;
		justify-content: end;
		align-items: center;
	}

	.panel-content {
		border-radius: var(--radius-lg);
		border-top-left-radius: 0;
		background-color: var(--clr-bg);

		min-height: 0;
		max-height: 100%;
	}
</style>

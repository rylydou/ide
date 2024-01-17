<script lang="ts">
	import { CodeEditor, Embed, Timestamp } from '$lib/components'
	import { auto_size } from '$lib/directives'
	import { Pane, Splitpanes } from 'svelte-splitpanes'
	import type { PageData } from './$types'
	import { onMount, onDestroy } from 'svelte'
	import { beforeNavigate } from '$app/navigation'
	import { browser } from '$app/environment'
	import type { editor } from 'monaco-editor'

	export let data: PageData

	let { is_author, project, session } = data
	let has_edited = false
	$: is_dirty = html_dirty || css_dirty

	let html_code = '<!-- Write your Markup here -->\n'
	let css_code = '/* Write your Styles here */\n'

	let html_editor: editor.IStandaloneCodeEditor
	let css_editor: editor.IStandaloneCodeEditor

	let html_dirty = false
	let css_dirty = false

	const before_unload = (ev: BeforeUnloadEvent) => {
		if (!is_dirty) return
		ev.preventDefault()
	}

	onMount(() => {
		window.addEventListener('beforeunload', before_unload)
		update_head()
		update_body()
	})

	onDestroy(() => {
		if (browser) {
			window.removeEventListener('beforeunload', before_unload)
		}
	})

	beforeNavigate(({ cancel }) => {
		if (!is_dirty) return
		if (!confirm('Are you sure you want to leave? All unsaved changes will be lost.')) {
			cancel()
		}
	})

	let body = ''
	const update_body = () => {
		if (html_editor) {
			html_code = html_editor.getValue()
		}
		body = html_code
	}

	let head = ''
	const update_head = () => {
		if (css_editor) {
			css_code = css_editor.getValue()
		}
		head = `<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${css_code}</style>`
	}
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
			<button class="btn btn-text btn-save btn-accent" disabled={!is_dirty && is_author}>
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
							<CodeEditor
								bind:editor={html_editor}
								bind:is_dirty={html_dirty}
								on:changed={update_body}
								code={html_code}
								lang="html"
							/>
						</div>
					</div>
				</Pane>
				<Pane>
					<div class="panel">
						<div class="panel-header">
							<div class="panel-header-title">CSS</div>
							<div class="panel-header-content"></div>
						</div>
						<div class="panel-content">
							<CodeEditor
								bind:editor={css_editor}
								bind:is_dirty={css_dirty}
								on:changed={update_head}
								code={css_code}
								lang="css"
							/>
						</div>
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
				<div class="panel-content">
					<Embed
						bind:head
						bind:body
						title={`Browser preview of "${project.name}" by ${project.author.name}`}
						style="width: 100%; height: 100%; background-color: white;"
					/>
				</div>
			</div>
		</Pane>
	</Splitpanes>
</div>

<style lang="scss">
	:global(body) {
		max-height: 100vh;
	}

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

					&:placeholder-shown {
						min-width: 10.5rem;
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

					&:disabled {
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

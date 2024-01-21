<script lang="ts">
	import { beforeNavigate, goto } from '$app/navigation'
	import { load_project } from '$lib'
	import { CodeEditor, Embed, Timestamp } from '$lib/components'
	import { auto_size } from '$lib/directives'
	import reset_css from '$lib/styles/reset.css?inline'
	import type { editor } from 'monaco-editor'
	import { onMount } from 'svelte'
	import { Pane, Splitpanes } from 'svelte-splitpanes'
	import type { PageData } from './$types'
	import hotkeys from 'hotkeys-js'

	export let data: PageData

	// Data
	let { project, session } = data
	let is_author = project.author_id == session.user.id

	let html_code = '<!-- Loading... -->'
	let css_code = '/* Loading... */'

	// UI
	let is_dirty = false
	let has_edited = false
	let delete_confirm = false

	// References
	let html_editor: editor.IStandaloneCodeEditor
	let css_editor: editor.IStandaloneCodeEditor

	const before_unload = (ev: BeforeUnloadEvent) => {
		if (!is_dirty) return
		ev.preventDefault()
	}

	onMount(() => {
		window.addEventListener('beforeunload', before_unload)
		;(async () => {
			const data = await load_project(project.data)
			html_code = data.html_code
			css_code = data.css_code

			setTimeout(() => {
				update_head(false)
				update_body(false)
			}, 500)
		})()

		hotkeys('ctrl+s', () => {
			if (!is_dirty) return false
			save_project()
			return false
		})

		return () => {
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
	const update_body = (is_user_edit: boolean) => {
		if (is_user_edit) {
			is_dirty = true
			// has_edited = true
		}
		if (html_editor) {
			html_code = html_editor.getValue()
		}
		body = html_code
	}

	let head = ''
	const update_head = (is_user_edit: boolean) => {
		if (is_user_edit) {
			is_dirty = true
			// has_edited = true
		}
		if (css_editor) {
			css_code = css_editor.getValue()
		}
		const code = css_code.replace(`@import url('reset.css');`, reset_css)
		head = `<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${code}</style>`
	}

	const save_project = async () => {
		is_dirty = false
		has_edited = true

		const payload = {
			name: project.name,
			data: {
				html_code: html_code,
				css_code: css_code,
			},
		}
		const response = await fetch(`/project/${project.id}`, {
			method: 'PUT',
			body: JSON.stringify(payload),
			headers: { 'content-type': 'application/json' },
		})
		if (response.ok) {
			project.updated_at = new Date()

			const data = await response.json()
			if (data.forked_to) {
				project.id = Number(data.forked_to) || project.id
				project.author = session.user
				is_author = true
				history.replaceState(history.state, '', `/project/${project.id}`)
			}
		}
	}

	const delete_project = async () => {
		const response = await fetch(`/project/${project.id}`, {
			method: 'DELETE',
			headers: { 'content-type': 'application/json' },
		})
		if (response.ok) {
			setTimeout(() => goto('/'), 500)
		}
	}
</script>

<svelte:head>
	<title>{project.name} by {project.author.name}</title>
</svelte:head>

<div class="project-layout">
	<header>
		<div>
			<a class="btn btn-text" href="/"> <div class="icon-home"></div> Home</a>
			{#if is_author || session.user.is_admin}
				<button
					class="btn btn-text"
					class:btn-destructive={delete_confirm}
					on:pointerleave={() => (delete_confirm = false)}
					on:click={() => {
						if (delete_confirm) delete_project()
						else delete_confirm = true
					}}
				>
					<div class="icon-trash"></div> Delete
				</button>
			{/if}
		</div>

		<div>
			<input
				type="text"
				class="project-name input input-flat"
				placeholder="Untitled Project"
				autocomplete="off"
				spellcheck="false"
				bind:value={project.name}
				use:auto_size
				on:input={() => (is_dirty = true)}
			/>
			<h2>by {project.author.name}</h2>
		</div>

		<div>
			<span>
				{has_edited ? 'Last saved' : 'Last updated'}
				<Timestamp date={project.updated_at} />
			</span>
			<button
				class="btn btn-text btn-save btn-accent"
				disabled={!is_dirty && is_author}
				on:click={save_project}
			>
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
								on:change={() => update_body(true)}
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
								on:change={() => update_head(true)}
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
				<div class="panel-content" style="overflow: hidden; display: grid; place-items: stretch;">
					<Embed
						bind:head
						bind:body
						title={`Browser preview of "${project.name}" by ${project.author.name}`}
						style="background-color: white;"
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
					transition: margin-right 600ms 100ms cubic-bezier(0.16, 1, 0.3, 1);

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

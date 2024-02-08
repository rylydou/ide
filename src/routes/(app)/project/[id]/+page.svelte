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
	let js_code = '// Loading...'

	// UI
	let is_saving = false
	let is_dirty = false
	let has_edited = false
	let delete_confirm = false
	let tab_index = 0

	// References
	let html_editor: editor.IStandaloneCodeEditor
	let css_editor: editor.IStandaloneCodeEditor
	let js_editor: editor.IStandaloneCodeEditor

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
			js_code = data.js_code

			setTimeout(() => {
				update_head(false)
				update_body(false)
				update_js(false)
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
		}
		if (html_editor) {
			html_code = html_editor.getValue()
		}

		console.log('updating')
		body = html_code
	}

	let head = ''
	const update_head = (is_user_edit: boolean) => {
		if (is_user_edit) {
			is_dirty = true
		}
		if (css_editor) {
			css_code = css_editor.getValue()
		}
		const code = css_code.replace(`@import url('reset.css');`, reset_css)
		head = `<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${code}</style>`
	}

	let js = ''
	const update_js = (is_user_edit: boolean) => {
		if (is_user_edit) {
			is_dirty = true
		}
		if (js_editor) {
			js_code = js_editor.getValue()
		}

		js = js_code
	}

	const save_project = async () => {
		if (html_code.length + css_code.length + js_code.length >= 8_192) {
			window.alert('There is too much code to save. Please remove some code and try again later.')
			return
		}

		is_dirty = false
		has_edited = true
		is_saving = true

		const payload = {
			name: project.name,
			data: {
				html_code: html_code,
				css_code: css_code,
				js_code: js_code,
			},
		}
		const response = await fetch(`/project/${project.id}`, {
			method: 'PUT',
			body: JSON.stringify(payload),
			headers: { 'content-type': 'application/json' },
		})
		if (response.ok) {
			project.updated_at = new Date()
			is_saving = false

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
			goto('/')
		}
	}

	let is_fullscreen = false
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

			<button
				class="btn btn-text"
				on:click={() => {
					navigator.clipboard.writeText(`https://ide.ryly.dev/view/${project.id}`)
				}}
			>
				<div class="icon-copy"></div>
				Copy Share Link
			</button>
		</div>

		<div>
			<input
				type="text"
				class="project-name input input-flat"
				placeholder="Untitled Project"
				autocomplete="off"
				spellcheck="false"
				maxlength="30"
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
				class:hidden={!is_saving && is_author && !is_dirty}
				disabled={is_saving || (is_author && !is_dirty)}
				on:click={save_project}
			>
				{#if is_author}
					{#if is_saving}
						Saving...
					{:else}
						<div class="icon-upload"></div> Save
					{/if}
				{:else if is_saving}
					Forking...
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
								<div class="panel-tabs">
									<button class="panel-tab" aria-current="true">HTML</button>
								</div>
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
							<div class="panel-tabs">
								<button
									class="panel-tab"
									aria-current={tab_index === 0}
									on:click={() => (tab_index = 0)}>CSS</button
								>
								<button
									class="panel-tab"
									aria-current={tab_index === 1}
									on:click={() => (tab_index = 1)}>JS</button
								>
							</div>
							<div class="panel-header-content"></div>
						</div>
						<div class="panel-content">
							<div style="height: 100%; display: {tab_index === 0 ? 'block' : 'none'};">
								<CodeEditor
									bind:editor={css_editor}
									on:change={() => update_head(true)}
									code={css_code}
									lang="css"
								/>
							</div>
							<div style="height: 100%; display: {tab_index === 1 ? 'block' : 'none'};">
								<CodeEditor
									bind:editor={js_editor}
									on:change={() => update_js(true)}
									code={js_code}
									lang="javascript"
								/>
							</div>
						</div>
					</div>
				</Pane>
			</Splitpanes>
		</Pane>
		<Pane class="browser">
			<div class="panel" class:fullscreen={is_fullscreen}>
				<div class="panel-header">
					<div class="panel-tabs">
						<button class="panel-tab" aria-current="true">Web Browser</button>
					</div>
					<div class="panel-header-content">
						<button class="btn btn-flat" on:click={() => (is_fullscreen = !is_fullscreen)}>
							{#if is_fullscreen}
								<div class="icon-fullscreen_exit"></div>
							{:else}
								<div class="icon-fullscreen"></div>
							{/if}
						</button>
					</div>
				</div>
				<div class="panel-content" style="overflow: hidden; display: grid; place-items: stretch;">
					<Embed
						bind:head
						bind:body
						bind:js
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
				gap: 0;
			}

			> :last-child {
				justify-self: end;
				gap: 1rem;
			}
		}
	}

	.project-name {
		align-self: center;
		justify-self: center;
		padding: 0 1rem;
		font-weight: bold;
		font-size: 1.25rem;

		&:placeholder-shown {
			min-width: 11.5rem;
		}
	}

	.btn-save {
		min-width: 5rem;
		margin-left: 1rem;
		margin-right: 0;
		transition: margin-right 600ms 100ms cubic-bezier(0.16, 1, 0.3, 1);

		&.hidden {
			margin-right: -7rem;
			transition: margin-right 200ms ease-in-out;
		}
	}

	.panel {
		width: 100%;
		height: 100%;
		display: grid;
		grid-template-rows: 2.5rem auto;
		background-color: var(--clr-base);

		&.fullscreen {
			position: fixed;
			inset: 0;
			padding: 1rem;
		}
	}

	.panel-header {
		display: flex;
	}

	.panel-tabs {
		display: flex;
	}

	.panel-tab {
		display: flex;
		align-items: center;
		padding-inline: 1.5rem;
		font-weight: bold;
		border-top-left-radius: var(--radius-lg);
		border-top-right-radius: var(--radius-lg);

		&:not([aria-current='false']) {
			background-color: var(--clr-bg);
			box-shadow: 0 2rem var(--clr-bg);
		}

		&:hover,
		&:focus-visible {
			background-color: var(--clr-bg-hover);
			box-shadow: 0 2rem var(--clr-bg-hover);
		}
	}

	.panel-header-content {
		flex: 1;
		display: flex;
		justify-content: end;
		align-items: center;
	}

	.panel-content {
		border-radius: var(--radius-lg);
		// border-top-left-radius: 0;
		background-color: var(--clr-bg);

		min-height: 0;
		max-height: 100%;
	}
</style>

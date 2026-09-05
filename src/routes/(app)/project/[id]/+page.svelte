<script lang="ts">
	import { beforeNavigate, goto } from '$app/navigation'
	import { page } from '$app/state'
	import { cfg, load_project } from '$lib'
	import { CodeEditor, Embed, Timestamp } from '$lib/components'
	import { auto_size, hotkey } from '$lib/directives'
	import type { editor } from 'monaco-editor'
	import { untrack } from 'svelte'
	import { Pane, Splitpanes } from 'svelte-splitpanes'
	import type { PageProps } from './$types'

	let { data }: PageProps = $props()

	const session = untrack(() => data.session)
	// A local, mutable copy: saving a fork rewrites the id and author in place.
	let project = $state(untrack(() => data.project))

	const initial = load_project(project.data)
	let html_code = $state(initial.html_code)
	let css_code = $state(initial.css_code)
	let js_code = $state(initial.js_code)

	let is_author = $state(project.author_id === session.user.id)
	let is_saving = $state(false)
	let is_dirty = $state(false)
	let has_edited = $state(false)
	let delete_confirm = $state(false)
	let editor_tab = $state<'css' | 'js'>('css')
	let is_fullscreen = $state(false)

	let html_editor = $state<editor.IStandaloneCodeEditor | null>(null)
	let css_editor = $state<editor.IStandaloneCodeEditor | null>(null)
	let js_editor = $state<editor.IStandaloneCodeEditor | null>(null)

	const total_length = $derived(html_code.length + css_code.length + js_code.length)
	const is_too_long = $derived(total_length > cfg.max_payload_length)
	const can_save = $derived(!is_saving && !is_too_long && (is_dirty || !is_author))

	const share_url = $derived(`${page.url.origin}/view/${project.share_slug}`)

	$effect(() => {
		if (!is_dirty) return

		const warn = (event: BeforeUnloadEvent) => event.preventDefault()
		window.addEventListener('beforeunload', warn)
		return () => window.removeEventListener('beforeunload', warn)
	})

	beforeNavigate(({ cancel }) => {
		if (!is_dirty) return
		if (!confirm('Are you sure you want to leave? All unsaved changes will be lost.')) cancel()
	})

	const save_project = async () => {
		if (!can_save) return

		is_saving = true

		const response = await fetch(`/project/${project.id}`, {
			method: 'PUT',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				name: project.name,
				data: { html_code, css_code, js_code },
			}),
		})

		is_saving = false

		if (!response.ok) {
			window.alert(`Could not save: ${await response.text()}`)
			return
		}

		is_dirty = false
		has_edited = true
		project.updated_at = new Date()

		const { forked_to } = await response.json() as { forked_to?: number }
		if (forked_to) {
			project.id = forked_to
			project.author = session.user
			project.author_id = session.user.id
			is_author = true
			// The fork lives at a new URL; swap it in without a navigation.
			history.replaceState(history.state, '', `/project/${project.id}`)
		}
	}

	const delete_project = async () => {
		const response = await fetch(`/project/${project.id}`, { method: 'DELETE' })
		if (response.ok) await goto('/')
	}
</script>

<svelte:head>
	<title>{project.name} by {project.author.name}</title>
</svelte:head>

<div
	class="project-layout"
	use:hotkey={{ key: 's', mod: true, handler: save_project }}
>
	<header>
		<div class="header-start">
			<a class="btn btn-text" href="/"><div class="icon-home"></div> Home</a>

			{#if is_author || session.user.is_admin}
				<button
					class="btn btn-text"
					class:btn-destructive={delete_confirm}
					onpointerleave={() => (delete_confirm = false)}
					onclick={() => (delete_confirm ? delete_project() : (delete_confirm = true))}
				>
					<div class="icon-trash"></div>
					{delete_confirm ? 'Really delete?' : 'Delete'}
				</button>
			{/if}

			<button class="btn btn-text" onclick={() => navigator.clipboard.writeText(share_url)}>
				<div class="icon-copy"></div> Copy Share Link
			</button>
		</div>

		<div class="header-title">
			<input
				type="text"
				class="project-name input input-flat"
				placeholder="Untitled Project"
				aria-label="Project name"
				autocomplete="off"
				spellcheck="false"
				maxlength="40"
				bind:value={project.name}
				use:auto_size
				oninput={() => (is_dirty = true)}
			/>
			<h2>by {project.author.name}</h2>
		</div>

		<div class="header-end">
			{#if is_too_long}
				<span class="too-long" role="alert">
					{total_length.toLocaleString()} / {cfg.max_payload_length.toLocaleString()} characters —
					too long to save
				</span>
			{:else}
				<span>
					{has_edited ? 'Last saved' : 'Last updated'}
					<Timestamp date={project.updated_at} />
				</span>
			{/if}

			<button
				class="btn btn-text btn-save btn-accent"
				class:hidden={!is_saving && is_author && !is_dirty}
				disabled={!can_save}
				onclick={save_project}
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

	<Splitpanes theme="" class="content">
		<Pane>
			<Splitpanes class="code-editors" theme="" horizontal>
				<Pane>
					<div class="panel">
						<div class="panel-header">
							<div class="panel-tabs">
								<button class="panel-tab" aria-current="true">HTML</button>
							</div>
							<div class="panel-header-content"></div>
						</div>
						<div class="panel-content">
							<CodeEditor
								bind:editor={html_editor}
								code={html_code}
								lang="html"
								onchange={() => {
									html_code = html_editor?.getValue() ?? html_code
									is_dirty = true
								}}
								onsave={save_project}
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
									aria-current={editor_tab === 'css'}
									onclick={() => (editor_tab = 'css')}
								>CSS</button>
								<button
									class="panel-tab"
									aria-current={editor_tab === 'js'}
									onclick={() => (editor_tab = 'js')}
								>JS</button>
							</div>
							<div class="panel-header-content"></div>
						</div>
						<div class="panel-content">
							<div class="editor-slot" hidden={editor_tab !== 'css'}>
								<CodeEditor
									bind:editor={css_editor}
									code={css_code}
									lang="css"
									onchange={() => {
										css_code = css_editor?.getValue() ?? css_code
										is_dirty = true
									}}
									onsave={save_project}
								/>
							</div>
							<div class="editor-slot" hidden={editor_tab !== 'js'}>
								<CodeEditor
									bind:editor={js_editor}
									code={js_code}
									lang="javascript"
									onchange={() => {
										js_code = js_editor?.getValue() ?? js_code
										is_dirty = true
									}}
									onsave={save_project}
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
						<button
							class="btn btn-flat"
							aria-label={is_fullscreen ? 'Exit fullscreen preview' : 'Fullscreen preview'}
							onclick={() => (is_fullscreen = !is_fullscreen)}
						>
							<div class={is_fullscreen ? 'icon-fullscreen_exit' : 'icon-fullscreen'}></div>
						</button>
					</div>
				</div>
				<div class="panel-content panel-content-preview">
					<Embed
						html={html_code}
						css={css_code}
						js={js_code}
						title="Browser preview of &quot;{project.name}&quot; by {project.author.name}"
						class="preview"
					/>
				</div>
			</div>
		</Pane>
	</Splitpanes>
</div>

<style>
	:global(body) {
		max-height: 100vh;
	}

	:global(.content) {
		flex: 1;
		padding: 1rem;
		padding-top: 0;
	}

	:global(.preview) {
		border: none;
		background-color: white;
	}

	.project-layout {
		flex: 1;
		display: flex;
		flex-direction: column;

		& > header {
			min-height: 4.5rem;
			display: grid;
			grid-template-columns: 1fr auto 1fr;
			padding: 1rem;
			overflow: hidden;

			& > * {
				display: flex;
				align-items: center;
				gap: 1rem;
			}
		}
	}

	.header-title {
		justify-self: center;
		gap: 0;
	}

	.header-end {
		justify-self: end;
	}

	.too-long {
		color: var(--clr-destructive, tomato);
		font-weight: bold;
		text-align: end;
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

	.editor-slot {
		height: 100%;
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
			z-index: 10;
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
		border-start-start-radius: var(--radius-lg);
		border-start-end-radius: var(--radius-lg);

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
		background-color: var(--clr-bg);
		min-height: 0;
		max-height: 100%;
	}

	.panel-content-preview {
		overflow: hidden;
		display: grid;
		place-items: stretch;
	}
</style>

<script lang="ts">
	import { beforeNavigate, goto } from '$app/navigation'
	import { page } from '$app/state'
	import { cfg, loadProject } from '$lib'
	import { CodeEditor, Embed, Timestamp } from '$lib/components'
	import { autoSize, hotkey } from '$lib/directives'
	import type { editor } from 'monaco-editor'
	import { untrack } from 'svelte'
	import { Pane, Splitpanes } from 'svelte-splitpanes'
	import type { PageProps } from './$types'

	let { data }: PageProps = $props()

	const session = untrack(() => data.session)
	// A local, mutable copy: saving a fork rewrites the id and author in place.
	let project = $state(untrack(() => data.project))

	const initial = loadProject(project.data)
	let htmlCode = $state(initial.htmlCode)
	let cssCode = $state(initial.cssCode)
	let jsCode = $state(initial.jsCode)

	let isAuthor = $state(project.authorId === session.user.id)
	let isSaving = $state(false)
	let isDirty = $state(false)
	let hasEdited = $state(false)
	let deleteConfirm = $state(false)
	let editorTab = $state<'css' | 'js'>('css')
	let isFullscreen = $state(false)

	let htmlEditor = $state<editor.IStandaloneCodeEditor | null>(null)
	let cssEditor = $state<editor.IStandaloneCodeEditor | null>(null)
	let jsEditor = $state<editor.IStandaloneCodeEditor | null>(null)

	const totalLength = $derived(htmlCode.length + cssCode.length + jsCode.length)
	const isTooLong = $derived(totalLength > cfg.maxPayloadLength)
	const canSave = $derived(!isSaving && !isTooLong && (isDirty || !isAuthor))

	const shareUrl = $derived(`${page.url.origin}/view/${project.shareSlug}`)

	$effect(() => {
		if (!isDirty) return

		const warn = (event: BeforeUnloadEvent) => event.preventDefault()
		window.addEventListener('beforeunload', warn)
		return () => window.removeEventListener('beforeunload', warn)
	})

	beforeNavigate(({ cancel }) => {
		if (!isDirty) return
		if (!confirm('Are you sure you want to leave? All unsaved changes will be lost.')) cancel()
	})

	const saveProject = async () => {
		if (!canSave) return

		isSaving = true

		const response = await fetch(`/project/${project.id}`, {
			method: 'PUT',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				name: project.name,
				data: { htmlCode, cssCode, jsCode },
			}),
		})

		isSaving = false

		if (!response.ok) {
			window.alert(`Could not save: ${await response.text()}`)
			return
		}

		isDirty = false
		hasEdited = true
		project.updatedAt = new Date()

		const { forkedTo } = await response.json() as { forkedTo?: number }
		if (forkedTo) {
			project.id = forkedTo
			project.author = session.user
			project.authorId = session.user.id
			isAuthor = true
			// The fork lives at a new URL; swap it in without a navigation.
			history.replaceState(history.state, '', `/project/${project.id}`)
		}
	}

	const deleteProject = async () => {
		const response = await fetch(`/project/${project.id}`, { method: 'DELETE' })
		if (response.ok) await goto('/')
	}
</script>

<svelte:head>
	<title>{project.name} by {project.author.name}</title>
</svelte:head>

<div
	class="project-layout"
	use:hotkey={{ key: 's', mod: true, handler: saveProject }}
>
	<header>
		<div class="header-start">
			<a class="btn btn-text" href="/"><div class="icon-home"></div> Home</a>

			{#if isAuthor || session.user.isAdmin}
				<button
					class="btn btn-text"
					class:btn-destructive={deleteConfirm}
					onpointerleave={() => (deleteConfirm = false)}
					onclick={() => (deleteConfirm ? deleteProject() : (deleteConfirm = true))}
				>
					<div class="icon-trash"></div>
					{deleteConfirm ? 'Really delete?' : 'Delete'}
				</button>
			{/if}

			<button class="btn btn-text" onclick={() => navigator.clipboard.writeText(shareUrl)}>
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
				use:autoSize
				oninput={() => (isDirty = true)}
			/>
			<h2>by {project.author.name}</h2>
		</div>

		<div class="header-end">
			{#if isTooLong}
				<span class="too-long" role="alert">
					{totalLength.toLocaleString()} / {cfg.maxPayloadLength.toLocaleString()} characters —
					too long to save
				</span>
			{:else}
				<span>
					{hasEdited ? 'Last saved' : 'Last updated'}
					<Timestamp date={project.updatedAt} />
				</span>
			{/if}

			<button
				class="btn btn-text btn-save btn-accent"
				class:hidden={!isSaving && isAuthor && !isDirty}
				disabled={!canSave}
				onclick={saveProject}
			>
				{#if isAuthor}
					{#if isSaving}
						Saving...
					{:else}
						<div class="icon-upload"></div> Save
					{/if}
				{:else if isSaving}
					Forking...
				{:else}
					<div class="icon-copy"></div>
					{isDirty ? 'Fork*' : 'Fork'}
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
								bind:editor={htmlEditor}
								code={htmlCode}
								lang="html"
								onchange={() => {
									htmlCode = htmlEditor?.getValue() ?? htmlCode
									isDirty = true
								}}
								onsave={saveProject}
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
									aria-current={editorTab === 'css'}
									onclick={() => (editorTab = 'css')}
								>CSS</button>
								<button
									class="panel-tab"
									aria-current={editorTab === 'js'}
									onclick={() => (editorTab = 'js')}
								>JS</button>
							</div>
							<div class="panel-header-content"></div>
						</div>
						<div class="panel-content">
							<div class="editor-slot" hidden={editorTab !== 'css'}>
								<CodeEditor
									bind:editor={cssEditor}
									code={cssCode}
									lang="css"
									onchange={() => {
										cssCode = cssEditor?.getValue() ?? cssCode
										isDirty = true
									}}
									onsave={saveProject}
								/>
							</div>
							<div class="editor-slot" hidden={editorTab !== 'js'}>
								<CodeEditor
									bind:editor={jsEditor}
									code={jsCode}
									lang="javascript"
									onchange={() => {
										jsCode = jsEditor?.getValue() ?? jsCode
										isDirty = true
									}}
									onsave={saveProject}
								/>
							</div>
						</div>
					</div>
				</Pane>
			</Splitpanes>
		</Pane>

		<Pane class="browser">
			<div class="panel" class:fullscreen={isFullscreen}>
				<div class="panel-header">
					<div class="panel-tabs">
						<button class="panel-tab" aria-current="true">Web Browser</button>
					</div>
					<div class="panel-header-content">
						<button
							class="btn btn-flat"
							aria-label={isFullscreen ? 'Exit fullscreen preview' : 'Fullscreen preview'}
							onclick={() => (isFullscreen = !isFullscreen)}
						>
							<div class={isFullscreen ? 'icon-fullscreen_exit' : 'icon-fullscreen'}></div>
						</button>
					</div>
				</div>
				<div class="panel-content panel-content-preview">
					<Embed
						html={htmlCode}
						css={cssCode}
						js={jsCode}
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

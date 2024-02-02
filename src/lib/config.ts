import type { editor } from 'monaco-editor'


// ----- Auth -----
export const max_sessions_per_user = 3
export const session_max_age_days = 30
export const encryption_salt_rounds = 10
export const default_email_domain = '@student.cislions.org'


export const monaco_theme: editor.IStandaloneThemeData = {
	base: 'vs-dark',
	inherit: false,
	rules: [
		{
			token: 'comment',
			foreground: '#397b44',
		},
		{
			token: 'tag',
			foreground: '#e6482e',
		},
		{
			token: 'metatag.html',
			foreground: '#7d7071',
		},
		{
			token: 'metatag.content.html',
			foreground: '#7d7071',
		},
		{
			token: 'delimiter',
			foreground: '#7d7071',
		},
		{
			token: 'attribute.name',
			foreground: '#28ccdf',
		},
		{
			token: 'attribute.value',
			foreground: '#f4b41b',
		},
		{
			token: 'keyword',
			foreground: '#e6482e',
			fontStyle: 'italic',
		},
		{
			token: 'number',
			foreground: '#cd6093',
		},
		{
			token: 'type',
			foreground: '#28ccdf',
		},
		{
			token: 'identifier',
			foreground: '#cfc6b8',
		},
		{
			token: 'string',
			foreground: '#f4b41b',
		},
		{
			token: 'attribute.name.css',
			foreground: '#cfc6b8',
		},
		{
			token: 'attribute.value.css',
			foreground: '#28ccdf',
		},
		{
			token: 'attribute.value.hex',
			foreground: '#f4b41b',
		},
		{
			token: 'attribute.value.number',
			foreground: '#cd6093',
		},
		{
			token: 'attribute.value.unit',
			foreground: '#e6482e',
		},
	],
	colors: {
		focusBorder: '#8e478c',
		foreground: '#a0938e',
		errorForeground: '#ff0000',
		'editorCursor.foreground': '#f4b41b',
		'editorWidget.background': '#302c2e',
		'editor.background': '#302c2e',
		'editor.findMatchBackground': '#394778',
		'editor.findMatchBorder': '#3978a8',
		'editor.findMatchHighlightBackground': '#394778',
		'editor.findRangeHighlightBackground': '#472d3c',
		'editor.foldBackground': '#242022',
		'editor.foreground': '#cfc6b8',
		'editor.hoverHighlightBackground': '#39314b',
		'editor.lineHighlightBackground': '#242022',
		'editor.rangeHighlightBackground': '#242022',
		'editor.selectionBackground': '#564064',
		'editor.selectionHighlightBackground': '#39314b',
		'editorSuggestWidget.focusHighlightForeground': '#ffaeb6',
		'editorSuggestWidget.highlightForeground': '#cd6093',
		'editorSuggestWidget.selectedBackground': '#39314b',
		'editorSuggestWidget.selectedForeground': '#fff',
		'editorSuggestWidget.selectedIconForeground': '#fff',
		'list.activeSelectionBackground': '#302c2e',
		'list.activeSelectionForeground': '#cfc6b8',
		'list.activeSelectionIconForeground': '#a0938e',
		'list.dropBackground': '#302c2e',
		'list.hoverBackground': '#383336',
		'list.inactiveSelectionBackground': '#302c2e',
		'list.inactiveSelectionForeground': '#cfc6b8',
		'list.inactiveSelectionIconForeground': '#a0938e',
		'scrollbar.shadow': '#302c2e',
	},
}


export const monaco_options: editor.IStandaloneEditorConstructionOptions = {
	theme: 'zuhgy-dark',
	maxTokenizationLineLength: 4_096,
	automaticLayout: true,
	minimap: {
		enabled: false,
	},
	bracketPairColorization: {
		enabled: true,
	},
	fontFamily: 'JetBrains Mono',
	fontSize: 16,
	fontLigatures: false,
	cursorBlinking: 'phase',
	cursorSmoothCaretAnimation: 'on',
	renderWhitespace: 'boundary',
	insertSpaces: false,
	tabSize: 2,
	lineNumbers: 'off',
	glyphMargin: false,
	folding: false,
	overviewRulerLanes: 0,
	scrollbar: {
		vertical: 'hidden',
		horizontal: 'hidden',
		useShadows: false,
	},
	padding: {
		top: 10,
		bottom: 10,
	},
	renderLineHighlight: 'none',
	colorDecorators: true,
	defaultColorDecorators: true,
	mouseWheelZoom: true,
	suggestFontSize: 16,
	suggestLineHeight: 28,
	wordBasedSuggestions: 'off',
	suggest: {
		preview: true,
		showWords: false,
		showStatusBar: true,
	},
	smoothScrolling: true,
	guides: {
		indentation: false,
	},
	wordWrap: 'on',
}

import type { editor } from 'monaco-editor';
import type ms from 'ms';


// ----- Auth -----
export const maxSessionsPerUser = 3;

/**
 * How long a signed access token is trusted without touching the database. This is also the
 * worst-case delay before a revoked session stops working, so keep it short.
 */
export const accessTokenTimeToLive = '15m' satisfies ms.StringValue;

/** How long a signed-in browser stays signed in. */
export const sessionTokenTimeToLive = '30d' satisfies ms.StringValue;

/** Slide the session expiry forward on each refresh, so active users are never logged out. */
export const refreshSessionTokenOnUse = true;

/** Re-issue the session token on each refresh, making a stolen one single-use. */
export const rotateSessionTokenOnUse = true;

export const accessTokenCookieKey = 'access_token';
export const sessionTokenCookieKey = 'session_token';
/** argon2id parameters for `Bun.password` (OWASP-recommended baseline). */
export const argon2 = {
	algorithm: 'argon2id',
	memoryCost: 19_456,
	timeCost: 2,
} as const;

/** Max total characters (html + css + js) accepted for a single project. */
export const maxPayloadLength = 1_048_576; // 1 MiB
export const defaultEmailDomain = '@student.cislions.org';


export const monacoTheme: editor.IStandaloneThemeData = {
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
};


export const monacoOptions: editor.IStandaloneEditorConstructionOptions = {
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
	defaultColorDecorators: 'auto',
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
};

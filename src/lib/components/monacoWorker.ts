import { emmetHTML } from 'emmet-monaco-es'
import * as monaco from 'monaco-editor'
import { html, typescript } from 'monaco-editor'
import editorWorker from 'monaco-editor/editor/editor.worker?worker'
import cssWorker from 'monaco-editor/languages/features/css/css.worker?worker'
import htmlWorker from 'monaco-editor/languages/features/html/html.worker?worker'
import tsWorker from 'monaco-editor/languages/features/typescript/ts.worker?worker'


self.MonacoEnvironment = {
	getWorker(_workerId: string, label: string) {
		switch (label) {
			case 'css':
			case 'scss':
			case 'less':
				return new cssWorker()
			case 'html':
			case 'handlebars':
			case 'razor':
				return new htmlWorker()
			case 'typescript':
			case 'javascript':
				return new tsWorker()
			default:
				return new editorWorker()
		}
	},
}

emmetHTML(monaco, ['html'])

html.htmlDefaults.setOptions({
	format: { ...html.htmlDefaults.options.format!, wrapLineLength: 80 },
})

typescript.typescriptDefaults.setEagerModelSync(true)
typescript.typescriptDefaults.setCompilerOptions({
	lib: ['DOM', 'DOM.Iterable'],
})

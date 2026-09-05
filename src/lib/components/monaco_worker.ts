import { emmetHTML } from 'emmet-monaco-es'
import * as monaco from 'monaco-editor'
import { html, typescript } from 'monaco-editor'
import css_worker from 'monaco-editor/languages/features/css/css.worker?worker'
import html_worker from 'monaco-editor/languages/features/html/html.worker?worker'
import ts_worker from 'monaco-editor/languages/features/typescript/ts.worker?worker'
import editor_worker from 'monaco-editor/editor/editor.worker?worker'


self.MonacoEnvironment = {
	getWorker(_workerId: string, label: string) {
		switch (label) {
			case 'css':
			case 'scss':
			case 'less':
				return new css_worker()
			case 'html':
			case 'handlebars':
			case 'razor':
				return new html_worker()
			case 'typescript':
			case 'javascript':
				return new ts_worker()
			default:
				return new editor_worker()
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

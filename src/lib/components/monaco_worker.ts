import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'


import { emmetHTML } from 'emmet-monaco-es'


const dispose_emmet = emmetHTML(
	monaco,
	['html'],
)


// @ts-ignore
self.MonacoEnvironment = {
	getWorker(_: any, label: string) {
		switch (label) {
			case 'json':
				return new jsonWorker()
			case 'css':
			case 'scss':
				return new cssWorker()
			case 'html':
				return new htmlWorker()
			case 'typescript':
			case 'javascript':
				return new tsWorker()
			default:
				return new editorWorker()
		}
	}
}

monaco.languages.html.htmlDefaults.setOptions({
	// @ts-ignore
	format: {
		wrapLineLength: 80,
	}
})

monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true)
monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
	lib: ['DOM', 'DOM.Iterable'],
})

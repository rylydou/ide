import { z } from 'zod'


export type ProjectData = {
	html_code: string
	css_code: string
	js_code: string
}


export const default_project_data: ProjectData = {
	html_code: '<!-- Makeup your page here -->\n',
	css_code: '/* Style your page here */\n',
	js_code: '// Program your page here',
}


/** Validator for incoming saves. Every field is optional so partial payloads still round-trip. */
export const project_data_schema = z.object({
	html_code: z.string().default(default_project_data.html_code),
	css_code: z.string().default(default_project_data.css_code),
	js_code: z.string().default(default_project_data.js_code),
})


/** Reads a stored `project.data` blob, falling back to the starter template for anything missing. */
export const load_project = (data: unknown): ProjectData => {
	const result = project_data_schema.safeParse(data ?? {})

	if (!result.success) return {
		...default_project_data,
		html_code: `<!-- LOAD ERROR! Tell Ryly about this\n${z.prettifyError(result.error)} -->`,
	}

	return result.data
}

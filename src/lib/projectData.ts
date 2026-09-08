import { z } from 'zod'


export type ProjectData = {
	htmlCode: string
	cssCode: string
	jsCode: string
}


export const defaultProjectData: ProjectData = {
	htmlCode: '<!-- Makeup your page here -->\n',
	cssCode: '/* Style your page here */\n',
	jsCode: '// Program your page here',
}


/** Validator for incoming saves. Every field is optional so partial payloads still round-trip. */
export const projectDataSchema = z.object({
	htmlCode: z.string().default(defaultProjectData.htmlCode),
	cssCode: z.string().default(defaultProjectData.cssCode),
	jsCode: z.string().default(defaultProjectData.jsCode),
})


/** Reads a stored `project.data` blob, falling back to the starter template for anything missing. */
export const loadProject = (data: unknown): ProjectData => {
	const result = projectDataSchema.safeParse(data ?? {})

	if (!result.success) return {
		...defaultProjectData,
		htmlCode: `<!-- LOAD ERROR! Tell Ryly about this\n${z.prettifyError(result.error)} -->`,
	}

	return result.data
}

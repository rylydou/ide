import { z } from 'zod'


export type ProjectData = Awaited<ReturnType<typeof load_project>>


export const load_project = async (data: unknown) => {
	const project_schema = z.object({
		html_code: z.string().optional(),
		css_code: z.string().optional(),
		js_code: z.string().optional(),
	}).optional().catch({})

	const parse_result = await project_schema.safeParseAsync(data)
	if (!parse_result.success) return {
		html_code: `<!-- LOAD ERROR! Tell Ryly about this\n${parse_result.error.message} -->`,
		css_code: '',
		js_code: '',
	}
	return {
		html_code: '<!-- Makeup your page here -->\n',
		css_code: '/* Style your page here */\n',
		js_code: '// Program your page here',
		...parse_result.data,
	}
}

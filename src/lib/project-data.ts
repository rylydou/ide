import { z } from 'zod'


export type ProjectData = Awaited<ReturnType<typeof load_project>>


export const load_project = async (data: unknown) => {
	const project_schema = z.object({
		html_code: z.string().default('<!-- Write your markup here -->\n'),
		css_code: z.string().default('/* Style your page here */\n'),
	}).default({
		html_code: '<!-- Write your markup here -->\n',
		css_code: '/* Style your page here */\n',
	})

	const project_data = await project_schema.safeParseAsync(data)
	if (!project_data.success) return {
		html_code: '<!-- Failed -->\n',
		css_code: '/* Failed */\n',
	}
	return project_data
}

export const save_project = (project_data: ProjectData) => {
	project_data
}

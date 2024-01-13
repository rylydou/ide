import { SVG, cleanupSVG, isEmptyColor, parseColors, runSVGO } from '@iconify/tools'
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'
import extractorSvelte from '@unocss/extractor-svelte'
import { defineConfig, presetIcons } from 'unocss'


const transform_svg = (str: string) => {
	const svg = new SVG(str)

	cleanupSVG(svg)

	// assume icon is monotone: replace color with currentColor, add if missing
	// if icon is not monotone, remove this code
	parseColors(svg, {
		defaultColor: 'currentColor',
		callback: (attr, colorStr, color) => {
			return !color || isEmptyColor(color)
				? colorStr
				: 'currentColor'
		},
	})

	runSVGO(svg)

	return svg.toMinifiedString()
}


export default defineConfig({
	extractors: [extractorSvelte()],
	presets: [
		// presetUno(),
		presetIcons({
			prefix: '',
			collections: {
				'icon': FileSystemIconLoader(
					'./assets/icons',
					transform_svg,
				)
			}
		}),
	],
})

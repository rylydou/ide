/**
 * Pre-bakes `assets/icons/*.svg` into a single Iconify JSON collection.
 *
 * Not part of the build — `uno.config.ts` reads the SVG directory directly. This exists as
 * an escape hatch if `@iconify/tools` ever stops working inside the UnoCSS plugin: generate
 * the JSON once here and point `presetIcons` at it instead.
 */

import { cleanupSVG, importDirectory, isEmptyColor, parseColors, runSVGO } from '@iconify/tools'


const iconsDir = 'assets/icons'
const outputPath = 'assets/icons.json'


console.log('importing icons from', iconsDir)
const iconSet = await importDirectory(iconsDir, {})
console.log(`found ${iconSet.count()} icons`)

iconSet.forEach((name, type) => {
	if (type !== 'icon') return

	const svg = iconSet.toSVG(name)
	if (!svg) {
		console.error('invalid icon:', name)
		iconSet.remove(name)
		return
	}

	try {
		cleanupSVG(svg)

		// Icons are assumed monotone: every colour becomes `currentColor`.
		parseColors(svg, {
			defaultColor: 'currentColor',
			callback: (_attr, colorStr, color) => !color || isEmptyColor(color) ? colorStr : 'currentColor',
		})

		runSVGO(svg)
	} catch (error) {
		console.error(`error parsing ${name}:`, error)
		iconSet.remove(name)
		return
	}

	iconSet.fromSVG(name, svg)
})

console.log('writing to', outputPath)
await Bun.write(outputPath, JSON.stringify(iconSet.export()))
console.log('done')

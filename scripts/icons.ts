// ----- Parameters -----
const ICONS_DIR_PATH = 'icons'
const JSON_PATH = 'src/icons.json'


// ---------------------------------- //


import { cleanupSVG, importDirectory, isEmptyColor, parseColors, runSVGO } from '@iconify/tools'
import fs from 'fs/promises'


(async () => {
	console.log('importing icons from', ICONS_DIR_PATH)
	const icon_set = await importDirectory(ICONS_DIR_PATH, {})
	console.log(`found ${icon_set.count()} icons`)

	icon_set.forEach((name, type) => {
		if (type !== 'icon') return

		const svg = icon_set.toSVG(name)
		if (!svg) {
			console.error('invalid icon:', name)
			icon_set.remove(name)
			return
		}

		try {
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
		} catch (err) {
			console.error(`error parsing ${name}:`, err)
			icon_set.remove(name)
			return
		}

		icon_set.fromSVG(name, svg)
	})

	console.log('stringify json')
	const json = JSON.stringify(icon_set.export())
	console.log('writing to', JSON_PATH)
	await fs.writeFile(JSON_PATH, json)
	console.log('done!')
})()

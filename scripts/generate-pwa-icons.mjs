/**
 * Generates public/icon-192.png and public/icon-512.png from public/favicon.svg.
 * Run: npm run icons
 */
import sharp from 'sharp'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')
const iconSvg = readFileSync(join(publicDir, 'favicon.svg'))

async function writePng(size, filename) {
  const buffer = await sharp(iconSvg).resize(size, size).png().toBuffer()
  const outPath = join(publicDir, filename)
  const { writeFileSync } = await import('fs')
  writeFileSync(outPath, buffer)
  console.log(`Wrote ${filename} (${size}x${size})`)
}

await writePng(192, 'icon-192.png')
await writePng(512, 'icon-512.png')

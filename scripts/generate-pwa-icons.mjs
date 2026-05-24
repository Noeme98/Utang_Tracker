/**
 * Generates public/icon-192.png and public/icon-512.png (PNG only, for PWA).
 * Run: npm run icons
 */
import sharp from 'sharp'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')
const svgPath = join(publicDir, 'favicon.svg')

if (!existsSync(svgPath)) {
  console.error('Missing public/favicon.svg — cannot generate PNG icons.')
  process.exit(1)
}

const iconSvg = readFileSync(svgPath)
const BG = '#004d4d'

async function writePng(size, filename) {
  const buffer = await sharp(iconSvg)
    .resize(size, size, { fit: 'contain', background: BG })
    .flatten({ background: BG })
    .png({ compressionLevel: 9 })
    .toBuffer()

  writeFileSync(join(publicDir, filename), buffer)
  console.log(`Wrote public/${filename} (${size}x${size}, PNG)`)
}

await writePng(192, 'icon-192.png')
await writePng(512, 'icon-512.png')

/**
 * Generates PNG PWA icons in public/ (required for Android install).
 * Run: npm run icons
 */
import sharp from 'sharp'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')
const svgPath = join(publicDir, 'favicon.svg')
const BG = { r: 0, g: 77, b: 77, alpha: 1 }

if (!existsSync(svgPath)) {
  console.error('Missing public/favicon.svg')
  process.exit(1)
}

const iconSvg = readFileSync(svgPath)

async function writeIcon(size, filename, { padded = false } = {}) {
  let pipeline = sharp(iconSvg).resize(
    padded ? Math.round(size * 0.65) : size,
    padded ? Math.round(size * 0.65) : size,
    { fit: 'contain', background: BG },
  )

  if (padded) {
    const pad = Math.round(size * 0.175)
    pipeline = pipeline.extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: BG,
    })
  }

  const buffer = await pipeline.flatten({ background: BG }).png().toBuffer()
  writeFileSync(join(publicDir, filename), buffer)
  console.log(`Wrote public/${filename} (${size}x${size})`)
}

await writeIcon(192, 'icon-192.png')
await writeIcon(512, 'icon-512.png')
await writeIcon(512, 'icon-512-maskable.png', { padded: true })

/**
 * generate-splash.js
 * Generates iOS PWA splash screen PNGs for all major device resolutions.
 * Uses only Node.js built-ins (no sharp/canvas required).
 * Creates dark (#020617) background PNGs with centered branding text.
 * 
 * Run: node generate-splash.js
 * Output: public/icons/splash/*.png
 */

const fs = require('fs')
const path = require('path')
const { createCanvas, loadImage } = require('canvas')

const OUTPUT_DIR = path.join(__dirname, 'public', 'icons', 'splash')
const LOGO_PATH = path.join(__dirname, 'public', 'blocpoint-white.png')
const BG_COLOR = '#020617'

const SIZES = [
    { name: '1290x2796', w: 1290, h: 2796 },  // iPhone 15 Pro Max
    { name: '1179x2556', w: 1179, h: 2556 },  // iPhone 15 / 14 Pro
    { name: '1170x2532', w: 1170, h: 2532 },  // iPhone 14 / 13 / 12
    { name: '828x1792', w: 828, h: 1792 },  // iPhone 11 / XR
    { name: '750x1334', w: 750, h: 1334 },  // iPhone SE / 8
    { name: '2048x2732', w: 2048, h: 2732 },  // iPad Pro 12.9"
    { name: '1668x2388', w: 1668, h: 2388 },  // iPad Pro 11" / Air
]

async function generate() {
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true })

    let logo = null
    try { logo = await loadImage(LOGO_PATH) } catch { console.warn('Logo not found, text only') }

    for (const size of SIZES) {
        const canvas = createCanvas(size.w, size.h)
        const ctx = canvas.getContext('2d')

        // Background
        ctx.fillStyle = BG_COLOR
        ctx.fillRect(0, 0, size.w, size.h)

        // Subtle radial glow matching brand
        const grad = ctx.createRadialGradient(size.w / 2, size.h / 2, 0, size.w / 2, size.h / 2, size.w * 0.6)
        grad.addColorStop(0, 'rgba(79,70,229,0.12)')
        grad.addColorStop(1, 'rgba(2,6,23,0)')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, size.w, size.h)

        // Logo (centered, max 240px wide)
        if (logo) {
            const logoW = Math.min(240, size.w * 0.3)
            const logoH = (logo.height / logo.width) * logoW
            ctx.drawImage(logo, (size.w - logoW) / 2, (size.h - logoH) / 2, logoW, logoH)
        } else {
            // Fallback text
            ctx.fillStyle = '#ffffff'
            ctx.font = `bold ${Math.floor(size.w * 0.06)}px sans-serif`
            ctx.textAlign = 'center'
            ctx.fillText('Blocpoint', size.w / 2, size.h / 2)
        }

        const out = path.join(OUTPUT_DIR, `${size.name}.png`)
        const buf = canvas.toBuffer('image/png')
        fs.writeFileSync(out, buf)
        console.log(`✅  ${size.name}.png  (${size.w}×${size.h})`)
    }
    console.log('\nAll splash screens generated in public/icons/splash/')
}

generate().catch(console.error)

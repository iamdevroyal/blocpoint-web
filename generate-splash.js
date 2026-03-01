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
const ICON_PATH = path.join(__dirname, 'public', 'icons', 'ios', '1024.png')
const BG_COLOR = '#ffffff'

const SIZES = [
    { name: '1290x2796', w: 1290, h: 2796 },  // iPhone 15 Pro Max
    { name: '1179x2556', w: 1179, h: 2556 },  // iPhone 15 / 14 Pro
    { name: '1170x2532', w: 1170, h: 2532 },  // iPhone 14 / 13 / 12
    { name: '828x1792', w: 828, h: 1792 },  // iPhone 11 / XR
    { name: '750x1334', w: 750, h: 1334 },  // iPhone SE / 8
    { name: '2048x2732', w: 2048, h: 2732 },  // iPad Pro 12.9"
    { name: '1668x2388', w: 1668, h: 2388 },  // iPad Pro 11" / Air
    { name: 'android-512x512', w: 512, h: 512 }, // Android Large Splash
    { name: 'android-192x192', w: 192, h: 192 }, // Android Medium Splash
]

async function generate() {
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true })

    let icon = null
    try { icon = await loadImage(ICON_PATH) } catch { console.warn('Icon not found, text only') }

    for (const size of SIZES) {
        const canvas = createCanvas(size.w, size.h)
        const ctx = canvas.getContext('2d')

        // White Background
        ctx.fillStyle = BG_COLOR
        ctx.fillRect(0, 0, size.w, size.h)

        // Centered App Icon
        if (icon) {
            const iconW = Math.min(size.w > 1500 ? 500 : 320, size.w * 0.35)
            const iconH = (icon.height / icon.width) * iconW

            const fontSize = Math.floor(size.w * 0.08)
            const gap = Math.floor(size.w * 0.005) // ultra-tighter gap

            const contentH = iconH + gap + fontSize
            const iconY = (size.h - contentH) / 2

            ctx.drawImage(icon, (size.w - iconW) / 2, iconY, iconW, iconH)

            // Add text "Blocpoint" - Darker Brand Indigo
            ctx.fillStyle = '#1e1b4b'
            ctx.font = `bold ${fontSize}px sans-serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'
            ctx.fillText('Blocpoint', size.w / 2, iconY + iconH + gap)
        } else {
            // Fallback text
            ctx.fillStyle = '#1e1b4b'
            ctx.font = `bold ${Math.floor(size.w * 0.1)}px sans-serif`
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

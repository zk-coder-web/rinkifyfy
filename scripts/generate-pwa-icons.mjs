#!/usr/bin/env node

/**
 * Script para gerar ícones PWA em PNG
 * Requer: npm install sharp
 * Execute: node scripts/generate-pwa-icons.mjs
 */

import sharp from 'sharp'
import path from 'path'
import { fileExistsSync, mkdirSync, writeFileSync } from 'fs'

const __dirname = path.dirname(new URL(import.meta.url).pathname)
const publicDir = path.join(__dirname, '..', 'public')
const iconsDir = path.join(publicDir, 'icons')

// Ensure icons directory exists
if (!fileExistsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true })
}

// SVG template for the icon
const createSVG = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#06b6d4;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="102" fill="url(#grad)"/>
  <g fill="white">
    <path d="M140 120h120c60 0 100 35 100 90 0 45-25 75-70 85l80 97h-60l-70-90h-40v90h-60V120zm60 130h55c30 0 50-15 50-40s-20-40-50-40h-55v80z"/>
    <path d="M380 80l12 35h35l-28 22 10 35-29-22-28 22 10-35-28-22h35z" fill="#fbbf24"/>
  </g>
</svg>
`

const sizes = [72, 96, 128, 144, 152, 167, 180, 192, 384, 512]

async function generateIcons() {
  console.log('📱 Gerando ícones PWA em PNG...\n')

  for (const size of sizes) {
    const svg = createSVG(size)
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`)
    
    try {
      await sharp(Buffer.from(svg))
        .resize(size, size)
        .png()
        .toFile(outputPath)
      
      console.log(`  ✓ Criado icon-${size}x${size}.png`)
    } catch (error) {
      console.error(`  ✗ Erro ao criar icon-${size}x${size}.png:`, error.message)
    }
  }

  // Create apple-touch-icon (180x180, no transparency)
  const appleTouchSVG = createSVG(180)
  const appleTouchPath = path.join(iconsDir, 'apple-touch-icon.png')
  
  try {
    await sharp(Buffer.from(appleTouchSVG))
      .resize(180, 180)
      .flatten({ background: '#2563eb' })
      .png()
      .toFile(appleTouchPath)
    
    console.log('\n  ✓ Criado apple-touch-icon.png (180x180)')
  } catch (error) {
    console.error('\n  ✗ Erro ao criar apple-touch-icon.png:', error.message)
  }

  // Create favicon.ico (32x32)
  const faviconPath = path.join(publicDir, 'favicon.ico')
  try {
    await sharp(Buffer.from(createSVG(32)))
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon-32x32.png'))
    
    console.log('  ✓ Criado favicon-32x32.png')
  } catch (error) {
    console.error('  ✗ Erro ao criar favicon:', error.message)
  }

  console.log('\n✅ Ícones gerados com sucesso!')
}

generateIcons().catch(console.error)

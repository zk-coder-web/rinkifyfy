#!/usr/bin/env node

/**
 * Script para gerar ícones PWA a partir de um SVG
 * Execute: node scripts/generate-icons.js
 * 
 * Nota: Este script cria placeholders. Para ícones de alta qualidade,
 * use uma ferramenta como sharp ou um serviço online.
 */

const fs = require('fs')
const path = require('path')

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
const iconsDir = path.join(__dirname, '..', 'public', 'icons')

// Ensure directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

// Create a simple placeholder SVG that can be used
const createPlaceholderSVG = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
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
</svg>`

console.log('📱 Generating PWA icons...')

// Generate SVG icons (browsers can use SVG directly for most purposes)
sizes.forEach(size => {
  const filename = `icon-${size}x${size}.svg`
  const filepath = path.join(iconsDir, filename)
  fs.writeFileSync(filepath, createPlaceholderSVG(size))
  console.log(`  ✓ Created ${filename}`)
})

// Create a favicon.ico placeholder
const faviconContent = createPlaceholderSVG(32)
fs.writeFileSync(path.join(iconsDir, 'favicon.svg'), faviconContent)
console.log('  ✓ Created favicon.svg')

// Create apple-touch-icon
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.svg'), createPlaceholderSVG(180))
console.log('  ✓ Created apple-touch-icon.svg')

// Note about PNG conversion
console.log('\n📝 Nota: Os ícones foram criados como SVG.')
console.log('   Para melhor compatibilidade, converta-os para PNG usando:')
console.log('   - Uma ferramenta online como https://realfavicongenerator.net/')
console.log('   - Ou o pacote npm "sharp" para conversão programática')
console.log('\n   Os SVGs funcionarão na maioria dos navegadores modernos.')

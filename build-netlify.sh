#!/bin/bash

echo "🧹 Limpando cache do Next.js..."
rm -rf .next

echo "🧹 Limpando node_modules/.cache..."
rm -rf node_modules/.cache

echo "📦 Instalando dependências..."
npm ci --legacy-peer-deps

echo "🔨 Compilando aplicação..."
npm run build

echo "✅ Build concluído!"

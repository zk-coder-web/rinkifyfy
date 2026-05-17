#!/bin/bash

# Script para copiar variáveis de ambiente para a Vercel
# Uso: ./copy-env-vercel.sh

echo "📋 Variáveis de Ambiente para Vercel"
echo "===================================="
echo ""
echo "Copie e cole cada linha no painel da Vercel:"
echo "https://vercel.com/dashboard → Settings → Environment Variables"
echo ""
echo "---"
echo ""

cat << 'EOF'
NEXT_PUBLIC_API_URL=https://rinkifyfy-verify.vercel.app
NEXT_PUBLIC_APP_URL=https://rinkifyfy-verify.vercel.app
DATABASE_URL=file:./rankify.db
NEXTAUTH_SECRET=1fbf93fbe9eebc326cdbff932cfede87644ba430c02246b11ac1a2b70fc826b6
NEXTAUTH_URL=https://rinkifyfy-verify.vercel.app
GOOGLE_CLIENT_ID=883498714141-u9drnfttupbn50ahkkavs9g29t0g3ijh.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=https://rinkifyfy-verify.vercel.app/login
INSTAGRAM_CHECKER_API_URL=http://localhost:5000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=zkdopix@gmail.com
SMTP_PASS=zbfnuvbigijwbmch
SMTP_FROM="Rankify <noreply@rankify.com.br>"
PASSWORD_PEPPER=1fbf93fbe9eebc326cdbff932cfede87644ba430c02246b11ac1a2b70fc826b6
NODE_ENV=production
EOF

echo ""
echo "---"
echo ""
echo "✅ Copie as variáveis acima e adicione uma por uma no painel da Vercel"
echo ""

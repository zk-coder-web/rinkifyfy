import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function GET() {
  const requiredVars = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'SMTP_FROM',
    'NEXTAUTH_SECRET',
    'NEXT_PUBLIC_APP_URL',
  ]

  const missing = requiredVars.filter(v => !process.env[v])
  const configured = requiredVars.filter(v => process.env[v])

  // Tentar testar a conexão SMTP
  let smtpTest = { status: 'not_tested', error: null as string | null }
  
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: true
        }
      })
      
      await transporter.verify()
      smtpTest = { status: 'ok', error: null }
    } catch (error: any) {
      smtpTest = { 
        status: 'failed', 
        error: error?.message || 'Erro desconhecido'
      }
    }
  }

  return NextResponse.json({
    status: missing.length === 0 ? 'ok' : 'incomplete',
    configured: configured.map(v => ({
      name: v,
      value: v === 'SMTP_PASS' ? '***' : (process.env[v] || 'vazio'),
    })),
    missing,
    smtp_test: smtpTest,
    timestamp: new Date().toISOString(),
  })
}

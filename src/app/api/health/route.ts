import { NextResponse } from 'next/server'

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

  return NextResponse.json({
    status: missing.length === 0 ? 'ok' : 'incomplete',
    configured: configured.map(v => ({
      name: v,
      value: v === 'SMTP_PASS' ? '***' : process.env[v],
    })),
    missing,
    timestamp: new Date().toISOString(),
  })
}

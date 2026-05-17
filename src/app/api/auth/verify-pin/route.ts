/**
 * POST /api/auth/verify-pin
 * Body: { pin: string }
 * Verifies the user's security PIN (requires active session).
 */
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, verifyUserPin } from '@/lib/auth-vercel'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('rankify_session')?.value
  if (!token) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

  const sessionUser = await getSessionUser(token)
  if (!sessionUser) return NextResponse.json({ error: 'Sessão inválida.' }, { status: 401 })

  try {
    const body = await req.json()
    const pin  = String(body?.pin || '').trim()

    if (!pin) return NextResponse.json({ error: 'PIN obrigatório.' }, { status: 400 })

    const valid = verifyUserPin(sessionUser.email, pin)
    if (!valid) return NextResponse.json({ error: 'PIN incorreto.' }, { status: 400 })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[verify-pin]', err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}

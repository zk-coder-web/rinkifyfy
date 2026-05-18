/**
 * POST /api/notif/read
 * Body: { notifId: string }
 * Marks a notification as read for the current user.
 *
 * GET /api/notif/read
 * Returns list of read notif IDs for the current user.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, markNotifRead, getReadNotifIds } from '@/lib/auth-adapter'

async function getUser(req: NextRequest) {
  const token = req.cookies.get('rankify_session')?.value
  if (!token) return null
  return await getSessionUser(token)
}

export async function GET(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ readIds: [] })
  const readIds = getReadNotifIds(user.id)
  return NextResponse.json({ readIds })
}

export async function POST(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

  const body    = await req.json()
  const notifId = String(body?.notifId || '').trim()
  if (!notifId) return NextResponse.json({ error: 'notifId obrigatório.' }, { status: 400 })

  markNotifRead(user.id, notifId)
  return NextResponse.json({ ok: true })
}

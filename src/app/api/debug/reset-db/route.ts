/**
 * GET /api/debug/reset-db
 * Debug route to clear all user data
 */
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 })
  }

  try {
    const db = getDb()
    
    // Clear all user-related data
    db.prepare('DELETE FROM notif_read').run()
    db.prepare('DELETE FROM notificacoes').run()
    db.prepare('DELETE FROM paginas').run()
    db.prepare('DELETE FROM verify_codes').run()
    db.prepare('DELETE FROM verify_tokens').run()
    db.prepare('DELETE FROM pending_pins').run()
    db.prepare('DELETE FROM sessions').run()
    db.prepare('DELETE FROM users').run()

    return NextResponse.json({ ok: true, message: 'Banco limpo com sucesso!' })
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao limpar banco' }, { status: 500 })
  }
}
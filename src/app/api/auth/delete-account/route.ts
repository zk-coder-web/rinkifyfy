/**
 * DELETE /api/auth/delete-account
 * Deletes the authenticated user and all their data.
 * Uses DELETE method for idempotency and proper semantics.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, deleteSession } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { log } from '@/lib/stability'

export async function DELETE(req: NextRequest) {
  const sessionUser = await getSessionUser(req)
  if (!sessionUser) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
  }

  try {
    const db = getDb()
    const userId = sessionUser.id
    const email = sessionUser.email

    // Start a transaction for atomic deletion
    const deleteAll = db.transaction(() => {
      // Delete all user-related data in correct order (respecting foreign keys)
      
      // 1. Delete user's notifications
      db.prepare('DELETE FROM notificacoes WHERE user_id = ?').run(userId)
      
      // 2. Delete read notification records
      db.prepare('DELETE FROM notif_read WHERE user_id = ?').run(userId)
      
      // 3. Delete user's pages (this will cascade to any related data)
      db.prepare('DELETE FROM paginas WHERE user_id = ?').run(userId)
      
      // 4. Delete verification codes
      db.prepare('DELETE FROM verify_codes WHERE email = ?').run(email)
      
      // 5. Delete verification tokens
      db.prepare('DELETE FROM verify_tokens WHERE email = ?').run(email)
      
      // 6. Delete pending PINs
      db.prepare('DELETE FROM pending_pins WHERE email = ?').run(email)
      
      // 7. Delete all sessions for this user
      db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId)
      
      // 8. Finally, delete the user
      db.prepare('DELETE FROM users WHERE id = ?').run(userId)
    })

    // Execute the transaction
    deleteAll()

    // Clear the session cookie
    const response = NextResponse.json({ 
      ok: true, 
      message: 'Conta deletada com sucesso.' 
    })
    response.cookies.set('rankify_session', '', { httpOnly: true, maxAge: 0, path: '/' })

    log('info', 'delete-account', `Account deleted: ${email} (id=${userId})`)
    return response
  } catch (err) {
    log('error', 'delete-account', 'Failed to delete account', err)
    return NextResponse.json({ error: 'Erro ao deletar conta. Tente novamente.' }, { status: 500 })
  }
}

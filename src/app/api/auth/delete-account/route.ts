/**
 * DELETE /api/auth/delete-account
 * Deletes the authenticated user and all their data.
 * Uses DELETE method for idempotency and proper semantics.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, deleteSession, executeUpdate } from '@/lib/auth-adapter'
import { log } from '@/lib/stability'

export async function DELETE(req: NextRequest) {
  const sessionUser = await getSessionUser(req)
  if (!sessionUser) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
  }

  try {
    const userId = sessionUser.id
    const email = sessionUser.email

    // Delete all user-related data in correct order (respecting foreign keys)
    
    // 1. Delete user's notifications
    await executeUpdate('DELETE FROM notificacoes WHERE user_id = ?', [userId])
    
    // 2. Delete read notification records
    await executeUpdate('DELETE FROM notif_read WHERE user_id = ?', [userId])
    
    // 3. Delete user's pages (this will cascade to any related data)
    await executeUpdate('DELETE FROM paginas WHERE user_id = ?', [userId])
    
    // 4. Delete verification codes
    await executeUpdate('DELETE FROM verify_codes WHERE email = ?', [email])
    
    // 5. Delete verification tokens
    await executeUpdate('DELETE FROM verify_tokens WHERE email = ?', [email])
    
    // 6. Delete pending PINs
    await executeUpdate('DELETE FROM pending_pins WHERE email = ?', [email])
    
    // 7. Delete all sessions for this user
    await executeUpdate('DELETE FROM sessions WHERE user_id = ?', [userId])
    
    // 8. Finally, delete the user
    await executeUpdate('DELETE FROM users WHERE id = ?', [userId])

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

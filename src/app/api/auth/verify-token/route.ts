/**
 * GET /api/auth/verify-token?token=xxx
 * Verifies user email via token and returns JSON (for verify page)
 */
import { NextRequest, NextResponse } from 'next/server'
import { consumeVerifyToken, getUserByEmail, markUserVerified, createLocalUser } from '@/lib/auth'
import { log } from '@/lib/stability'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  
  console.log('[verify-token] Recebido request com token:', token ? `${token.substring(0, 10)}...` : 'vazio')

  if (!token) {
    console.log('[verify-token] Token vazio')
    return NextResponse.json(
      { error: 'Token inválido.', verified: false },
      { status: 400 }
    )
  }

  try {
    console.log('[verify-token] Consumindo token de verificação')
    // Consume token and get email
    const email = await consumeVerifyToken(token)

    if (!email) {
      console.log('[verify-token] Token não encontrado ou expirado')
      return NextResponse.json(
        { error: 'Token expirado ou já utilizado.', verified: false },
        { status: 400 }
      )
    }

    console.log('[verify-token] Token encontrado para email:', email)

    // Check if user exists and update or create
    console.log('[verify-token] Procurando usuário existente')
    const existingUser = await getUserByEmail(email)
    
    if (existingUser) {
      // User exists, mark as verified
      console.log('[verify-token] Usuário existe, marcando como verificado')
      await markUserVerified(email)
      log('info', 'verify-token', `Email verified for existing user: ${email}`)
    } else {
      // Create placeholder user (will set password later)
      console.log('[verify-token] Criando novo usuário placeholder')
      const displayName = email.split('@')[0]
      await createLocalUser(email, '', displayName, null)
      await markUserVerified(email)
      log('info', 'verify-token', `New verified user created: ${email}`)
    }

    console.log('[verify-token] Sucesso! Retornando resposta')
    return NextResponse.json({ 
      ok: true, 
      verified: true,
      email
    })
  } catch (err: any) {
    console.error('[verify-token] Erro:', err.message)
    console.error('[verify-token] Stack:', err.stack)
    log('error', 'verify-token', 'Verification failed', err)
    return NextResponse.json(
      { error: 'Erro ao verificar.', verified: false },
      { status: 500 }
    )
  }
}

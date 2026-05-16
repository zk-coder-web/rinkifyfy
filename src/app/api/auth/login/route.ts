/**
 * POST /api/auth/login
 * Body: { email: string; password: string }
 * Sistema com rate limiting e mensagens de erro genéricas para segurança
 */
import { NextRequest, NextResponse } from 'next/server'
import { 
  getUserByEmail, 
  verifyPassword, 
  createPersistentSession, 
  checkLoginRateLimit,
  recordLogin,
  setUserPreference 
} from '@/lib/auth'
import { log } from '@/lib/stability'

export async function POST(req: NextRequest) {
  try {
    const body     = await req.json()
    const email    = String(body?.email    || '').trim().toLowerCase()
    const password = String(body?.password || '')
    const ip       = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'

    // Validação básica
    if (!email || !password) {
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 400 })
    }

    // Verifica rate limiting (combinação de email + IP para maior segurança)
    const rateLimitKey = `${email}:${ip}`
    const rateLimit = checkLoginRateLimit(rateLimitKey)
    
    if (!rateLimit.allowed) {
      log('warn', 'login', `Rate limit exceeded for ${email} from IP ${ip}`)
      return NextResponse.json({ 
        error: rateLimit.lockoutTime 
          ? `Muitas tentativas. Tente novamente em ${rateLimit.lockoutTime} minutos.`
          : 'Credenciais inválidas.' 
      }, { status: 429 })
    }

    const user = getUserByEmail(email)

    // Mensagem genérica para evitar vazamento de informações
    if (!user) {
      recordLogin(rateLimitKey, false)
      log('warn', 'login', `Failed login attempt for ${email} (user not found)`)
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 })
    }

    // Check if user needs to set password (verified via link but no password yet)
    if (!user.password && user.verified) {
      recordLogin(rateLimitKey, false)
      log('info', 'login', `User verified but no password: ${email}`)
      return NextResponse.json(
        { 
          error: 'Você precisa criar uma senha.',
          needsPasswordSetup: true,
          email: email 
        },
        { status: 403 }
      )
    }

    if (!user.password) {
      recordLogin(rateLimitKey, false)
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 })
    }

    // Check if account is verified (only for local accounts)
    if (!user.verified && user.provider === 'local') {
      recordLogin(rateLimitKey, false)
      log('warn', 'login', `Unverified account login attempt: ${email}`)
      return NextResponse.json(
        { 
          error: 'Conta não verificada.',
          needsVerification: true,
          email: email 
        },
        { status: 403 }
      )
    }

    const match = await verifyPassword(password, user.password)
    if (!match) {
      recordLogin(rateLimitKey, false)
      log('warn', 'login', `Failed login attempt for ${email} (wrong password)`)
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 })
    }

    // Login bem-sucedido
    recordLogin(rateLimitKey, true)
    
    // Captura device info do header
    const deviceInfo = req.headers.get('user-agent') || 'Unknown'
    
    // Cria sessão persistente com refresh token
    const { token, refreshToken } = createPersistentSession(user.id, deviceInfo, ip)
    log('info', 'login', `User logged in: ${email} from IP ${ip}`)

    // Salva preferências básicas se não existirem
    if (user.id) {
      setUserPreference(user.id, 'last_login', new Date().toISOString())
      setUserPreference(user.id, 'last_ip', ip)
    }

    const response = NextResponse.json({
      ok: true,
      user: { 
        id: user.id, 
        email: user.email, 
        displayName: user.display_name || user.name || '',
        name: user.name || '',
        provider: user.provider 
      },
    })

    // Cookie principal (sessão)
    response.cookies.set('rankify_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 dias
      path: '/',
    })

    // Cookie de refresh (para renovação automática) - menos seguro, mas necessário para persistência
    response.cookies.set('rankify_refresh', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 dias
      path: '/',
    })

    return response
  } catch (err) {
    log('error', 'login', 'Login error', err)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}

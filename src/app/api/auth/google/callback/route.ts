/**
 * GET /api/auth/google/callback
 * Handles the OAuth code exchange and creates/updates the user.
 */
import { NextRequest, NextResponse } from 'next/server'
import { upsertGoogleUser, createPersistentSession, setUserPreference } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code  = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(new URL('/login?error=google_cancelled', req.url))
  }

  const clientId     = process.env.GOOGLE_CLIENT_ID     || ''
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || ''
  const redirectUri  = process.env.GOOGLE_REDIRECT_URI  || ''

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id:     clientId,
        client_secret: clientSecret,
        redirect_uri:  redirectUri,
        grant_type:    'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      throw new Error(`Token exchange failed: ${tokenRes.status}`)
    }

    const tokens = await tokenRes.json() as { access_token: string }

    // Fetch user profile
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })

    if (!profileRes.ok) {
      throw new Error(`Profile fetch failed: ${profileRes.status}`)
    }

    const profile = await profileRes.json() as {
      id: string
      email: string
      name: string
    }

    const user = upsertGoogleUser(profile.id, profile.email, profile.name)
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const deviceInfo = req.headers.get('user-agent') || 'Unknown'
    
    // Cria sessão persistente
    const { token, refreshToken } = createPersistentSession(user.id, deviceInfo, ip)
    
    // Salva preferências
    setUserPreference(user.id, 'last_login', new Date().toISOString())
    setUserPreference(user.id, 'last_ip', ip)

    const response = NextResponse.redirect(new URL('/dashboard', req.url))
    
    // Cookie de sessão
    response.cookies.set('rankify_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })
    
    // Cookie de refresh
    response.cookies.set('rankify_refresh', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    })

    return response
  } catch (err) {
    console.error('[google/callback]', err)
    return NextResponse.redirect(new URL('/login?error=google_failed', req.url))
  }
}

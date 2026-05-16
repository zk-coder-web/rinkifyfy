/**
 * GET /api/auth/me
 * Returns current session user. Never throws — always returns { user: null } on failure.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('rankify_session')?.value
    if (!token) return NextResponse.json({ user: null })

    const user = await getSessionUser(token)
    if (!user) return NextResponse.json({ user: null })

    // Return user with name field
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name || '',
        displayName: user.name || user.display_name || '',
        provider: user.provider,
        verified: user.verified === 1,
      }
    })
  } catch {
    return NextResponse.json({ user: null })
  }
}

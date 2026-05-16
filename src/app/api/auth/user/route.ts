/**
 * GET /api/auth/user - Get current user data
 * POST /api/auth/user - Update user data (name, etc)
 */
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser, updateUserName, getUserById } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { log } from '@/lib/stability'

export async function GET(req: NextRequest) {
  const sessionUser = await getSessionUser(req)
  if (!sessionUser) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
  }

  try {
    const db = getDb()
    const user = db.prepare(`
      SELECT id, email, name, display_name, provider, verified, created_at, photo
      FROM users WHERE id = ?
    `).get(sessionUser.id) as {
      id: number
      email: string
      name: string
      display_name: string
      provider: string
      verified: number
      created_at: string
      photo?: string
    } | undefined

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })
    }

    // Parse created_at to get date and time
    const createdAt = new Date(user.created_at)
    const createdDate = createdAt.toLocaleDateString('pt-BR')
    const createdTime = createdAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || '',
        displayName: user.name || user.display_name || '',
        provider: user.provider,
        verified: user.verified === 1,
        createdAt: createdDate,
        createdTime: createdTime,
        createdAtRaw: user.created_at,
        photo: user.photo || null,
      }
    })
  } catch (err) {
    log('error', 'user-get', 'Failed to get user data', err)
    return NextResponse.json({ error: 'Erro ao buscar dados.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const sessionUser = await getSessionUser(req)
  if (!sessionUser) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, photo } = body

    const db = getDb()

    if (name !== undefined) {
      // Update user name
      db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name, sessionUser.id)
      log('info', 'user-update', `Name updated for user ${sessionUser.id}: "${name}"`)
    }

    if (photo !== undefined) {
      // Update user photo (base64 data)
      db.prepare('UPDATE users SET photo = ? WHERE id = ?').run(photo, sessionUser.id)
      log('info', 'user-update', `Photo updated for user ${sessionUser.id}`)
    }

    // Return updated user data
    const user = db.prepare(`
      SELECT id, email, name, display_name, provider, verified, created_at, photo
      FROM users WHERE id = ?
    `).get(sessionUser.id) as {
      id: number
      email: string
      name: string
      display_name: string
      provider: string
      verified: number
      created_at: string
      photo?: string
    } | undefined

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })
    }

    const createdAt = new Date(user.created_at)
    const createdDate = createdAt.toLocaleDateString('pt-BR')
    const createdTime = createdAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || '',
        displayName: user.name || user.display_name || '',
        provider: user.provider,
        verified: user.verified === 1,
        createdAt: createdDate,
        createdTime: createdTime,
        photo: user.photo || null,
      }
    })
  } catch (err) {
    log('error', 'user-update', 'Failed to update user data', err)
    return NextResponse.json({ error: 'Erro ao atualizar dados.' }, { status: 500 })
  }
}
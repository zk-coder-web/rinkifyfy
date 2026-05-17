import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromToken as getUserIdFromTokenVercel } from '@/lib/auth-vercel'
import { getUserIdFromToken as getUserIdFromTokenSimple } from '@/lib/json-db-memory'

// Determinar qual função de autenticação usar
const useSimpleAuth = process.env.NEXT_PUBLIC_USE_SIMPLE_AUTH === 'true'

async function getUserId(request: NextRequest): Promise<string | number | null> {
  if (useSimpleAuth) {
    return await getUserIdFromTokenSimple(request)
  } else {
    return await getUserIdFromTokenVercel(request)
  }
}

/**
 * DEPRECATED: Esta rota é mantida apenas para compatibilidade com versões antigas.
 * Use /api/instagram/lookup em vez disso.
 * 
 * Esta rota agora redireciona para a nova implementação interna que não depende
 * de um servidor Python externo.
 */
export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json(
        { error: '@ do usuário não encontrado.' },
        { status: 400 }
      )
    }

    // Remove @ se existir
    const cleanUsername = username.replace(/^@/, '').toLowerCase().trim()

    // Validar formato do username
    if (!cleanUsername || !/^[a-z0-9._]{1,30}$/.test(cleanUsername)) {
      return NextResponse.json(
        { error: '@ do usuário não encontrado.' },
        { status: 404 }
      )
    }

    console.log(`[Instagram Verify] Verificando usuário: ${cleanUsername} (redirecionando para /lookup)`)

    // Verificar se o usuário está autenticado
    const userId = await getUserId(request)
    if (!userId) {
      return NextResponse.json(
        { error: '@ do usuário não encontrado.' },
        { status: 401 }
      )
    }

    // Chamar a nova rota internamente
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      const lookupResponse = await fetch(
        new URL('/api/instagram/lookup', request.url),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('cookie') || '',
          },
          body: JSON.stringify({ username: cleanUsername }),
          signal: controller.signal,
        }
      )

      clearTimeout(timeoutId)

      if (!lookupResponse.ok) {
        console.log(`[Instagram Verify] Erro na resposta do lookup (status ${lookupResponse.status})`)
        return NextResponse.json(
          { error: '@ do usuário não encontrado.' },
          { status: 404 }
        )
      }

      const data = await lookupResponse.json()

      console.log(`[Instagram Verify] Resposta do lookup:`, data)

      // Converter resposta do novo formato para o formato antigo
      if (data.status === 'not_found') {
        return NextResponse.json(
          { error: '@ do usuário não encontrado.' },
          { status: 404 }
        )
      }

      if (data.status === 'rate_limited') {
        return NextResponse.json(
          { error: 'Limite temporário atingido. Tente novamente em alguns segundos.' },
          { status: 429 }
        )
      }

      if (data.status === 'unavailable') {
        return NextResponse.json(
          { error: 'Não foi possível obter os dados deste perfil.' },
          { status: 503 }
        )
      }

      // Sucesso - converter para formato antigo
      return NextResponse.json({
        success: true,
        data: {
          username: cleanUsername,
          nome: data.fullName || cleanUsername,
          seguidores: data.followersRaw || 0,
        },
      })
    } catch (fetchError: any) {
      console.error(`[Instagram Verify] Erro ao chamar /lookup: ${fetchError.message}`)
      return NextResponse.json(
        { error: '@ do usuário não encontrado.' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('[Instagram Verify] Erro ao processar requisição:', error)
    return NextResponse.json(
      { error: '@ do usuário não encontrado.' },
      { status: 404 }
    )
  }
}

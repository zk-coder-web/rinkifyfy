import { NextRequest, NextResponse } from 'next/server'

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

    console.log(`[Instagram Verify] Verificando usuário: ${cleanUsername}`)

    // URL do servidor externo que roda o checker.py
    // Você precisa configurar isso com a URL do seu servidor
    const EXTERNAL_API_URL = process.env.INSTAGRAM_CHECKER_API_URL || 'http://localhost:5000'

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 20000)

      const response = await fetch(`${EXTERNAL_API_URL}/check/${cleanUsername}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log(`[Instagram Verify] Response status: ${response.status}`)

      if (!response.ok) {
        console.log(`[Instagram Verify] Erro na resposta (status ${response.status})`)
        return NextResponse.json(
          { error: '@ do usuário não encontrado.' },
          { status: 404 }
        )
      }

      const data = await response.json()

      console.log(`[Instagram Verify] Resposta do servidor:`, data)

      if (!data.success || !data.exists) {
        console.log(`[Instagram Verify] Usuário não encontrado`)
        return NextResponse.json(
          { error: '@ do usuário não encontrado.' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: {
          username: cleanUsername,
          nome: data.nome || data.username || cleanUsername,
          seguidores: data.seguidores || 0,
        },
      })
    } catch (fetchError: any) {
      console.error(`[Instagram Verify] Erro ao chamar servidor externo: ${fetchError.message}`)
      
      // Se o servidor externo não está disponível, retornar erro
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

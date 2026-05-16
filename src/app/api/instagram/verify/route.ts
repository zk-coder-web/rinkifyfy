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

    try {
      // Tentar verificar o perfil do Instagram usando web scraping
      const response = await fetch(`https://www.instagram.com/${cleanUsername}/?__a=1&__d=dis`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
        },
        timeout: 10000,
      })

      if (!response.ok) {
        // Se a API JSON falhar, tentar com a página HTML
        const htmlResponse = await fetch(`https://www.instagram.com/${cleanUsername}/`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
          timeout: 10000,
        })

        if (!htmlResponse.ok || htmlResponse.status === 404) {
          return NextResponse.json(
            { error: '@ do usuário não encontrado.' },
            { status: 404 }
          )
        }

        const html = await htmlResponse.text()
        
        // Procurar por dados no HTML
        const nameMatch = html.match(/"full_name":"([^"]+)"/)
        const followersMatch = html.match(/"edge_followed_by"\s*:\s*{[^}]*"count"\s*:\s*([0-9]+)/)
        
        if (!nameMatch && !followersMatch) {
          return NextResponse.json(
            { error: '@ do usuário não encontrado.' },
            { status: 404 }
          )
        }

        return NextResponse.json({
          success: true,
          data: {
            username: cleanUsername,
            nome: nameMatch ? nameMatch[1] : cleanUsername,
            seguidores: followersMatch ? parseInt(followersMatch[1]) : 0,
          },
        })
      }

      const data = await response.json()

      // Extrair dados da resposta JSON
      const user = data.user || data.graphql?.user
      
      if (!user) {
        return NextResponse.json(
          { error: '@ do usuário não encontrado.' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: {
          username: cleanUsername,
          nome: user.full_name || user.username || cleanUsername,
          seguidores: user.edge_followed_by?.count || user.follower_count || 0,
        },
      })
    } catch (fetchError: any) {
      console.error('Erro ao verificar Instagram:', fetchError.message)
      
      // Se tudo falhar, retornar erro genérico
      return NextResponse.json(
        { error: '@ do usuário não encontrado.' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Erro ao verificar Instagram:', error)
    return NextResponse.json(
      { error: '@ do usuário não encontrado.' },
      { status: 404 }
    )
  }
}

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

    try {
      // Método 1: Tentar com a página HTML diretamente (sem __a=1)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      try {
        const htmlResponse = await fetch(`https://www.instagram.com/${cleanUsername}/`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        console.log(`[Instagram Verify] Response status: ${htmlResponse.status}`)

        if (!htmlResponse.ok || htmlResponse.status === 404) {
          console.log(`[Instagram Verify] Usuário não encontrado (status ${htmlResponse.status})`)
          return NextResponse.json(
            { error: '@ do usuário não encontrado.' },
            { status: 404 }
          )
        }

        const html = await htmlResponse.text()
        
        // Procurar por dados no HTML usando múltiplos padrões
        let nome = null
        let seguidores = 0

        // Padrão 1: full_name em JSON
        const nameMatch = html.match(/"full_name":"([^"]+)"/)
        if (nameMatch) {
          nome = nameMatch[1]
          console.log(`[Instagram Verify] Nome encontrado (padrão 1): ${nome}`)
        }

        // Padrão 2: edge_followed_by count
        const followersMatch = html.match(/"edge_followed_by"\s*:\s*{[^}]*"count"\s*:\s*([0-9]+)/)
        if (followersMatch) {
          seguidores = parseInt(followersMatch[1])
          console.log(`[Instagram Verify] Seguidores encontrados (padrão 2): ${seguidores}`)
        }

        // Padrão 3: Procurar por "follower_count"
        if (!followersMatch) {
          const followerCountMatch = html.match(/"follower_count"\s*:\s*([0-9]+)/)
          if (followerCountMatch) {
            seguidores = parseInt(followerCountMatch[1])
            console.log(`[Instagram Verify] Seguidores encontrados (padrão 3): ${seguidores}`)
          }
        }

        // Padrão 4: Procurar por username em og:title
        if (!nome) {
          const ogTitleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/)
          if (ogTitleMatch) {
            nome = ogTitleMatch[1]
            console.log(`[Instagram Verify] Nome encontrado (padrão 4): ${nome}`)
          }
        }

        // Se encontrou algo, retornar sucesso
        if (nome || seguidores > 0) {
          console.log(`[Instagram Verify] Usuário verificado com sucesso`)
          return NextResponse.json({
            success: true,
            data: {
              username: cleanUsername,
              nome: nome || cleanUsername,
              seguidores: seguidores,
            },
          })
        }

        // Se não encontrou nada, verificar se a página existe
        if (html.includes('Page Not Found') || html.includes('página não foi encontrada')) {
          console.log(`[Instagram Verify] Página não encontrada`)
          return NextResponse.json(
            { error: '@ do usuário não encontrado.' },
            { status: 404 }
          )
        }

        // Se chegou aqui, a página existe mas não conseguiu extrair dados
        console.log(`[Instagram Verify] Página existe mas sem dados extraíveis`)
        // Retornar sucesso mesmo assim, pois a página existe
        return NextResponse.json({
          success: true,
          data: {
            username: cleanUsername,
            nome: cleanUsername,
            seguidores: 0,
          },
        })
      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        console.error(`[Instagram Verify] Erro ao fazer fetch: ${fetchError.message}`)
        
        return NextResponse.json(
          { error: '@ do usuário não encontrado.' },
          { status: 404 }
        )
      }
    } catch (error: any) {
      console.error(`[Instagram Verify] Erro geral: ${error.message}`)
      
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

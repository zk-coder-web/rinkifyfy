import { NextRequest, NextResponse } from 'next/server'
import { execSync } from 'child_process'
import path from 'path'

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
      // Caminho para o script Python
      const scriptPath = path.join(process.cwd(), 'verificarUser', 'checker.py')
      
      // Executar o script Python com encoding UTF-8
      const result = execSync(`python "${scriptPath}" "${cleanUsername}"`, {
        encoding: 'utf-8',
        timeout: 30000,
        maxBuffer: 10 * 1024 * 1024,
        env: {
          ...process.env,
          PYTHONIOENCODING: 'utf-8',
        },
      })

      const data = JSON.parse(result)

      if (!data.success || !data.exists) {
        return NextResponse.json(
          { error: '@ do usuário não encontrado.' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: {
          username: data.username,
          nome: data.nome || data.username,
          seguidores: data.seguidores || 0,
        },
      })
    } catch (pythonError: any) {
      console.error('Erro ao executar script Python:', pythonError.message)
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

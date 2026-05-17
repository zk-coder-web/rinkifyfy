import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromToken } from '@/lib/auth-index'
import { getDb } from '@/lib/db'
import path from 'path'
import fs from 'fs'

// POST: Upload de foto
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const paginaId = formData.get('paginaId') as string

    if (!file) {
      return NextResponse.json({ error: 'Arquivo não fornecido' }, { status: 400 })
    }

    if (!paginaId) {
      return NextResponse.json({ error: 'ID da página não fornecido' }, { status: 400 })
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Arquivo deve ser uma imagem' }, { status: 400 })
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Arquivo muito grande (máximo 5MB)' }, { status: 400 })
    }

    // Verificar se a página pertence ao usuário
    const db = getDb()
    const pagina = db.prepare(
      'SELECT id, user_id FROM paginas WHERE id = ?'
    ).get(paginaId) as { id: string; user_id: number } | undefined

    if (!pagina || pagina.user_id !== userId) {
      return NextResponse.json({ error: 'Página não encontrada' }, { status: 404 })
    }

    // Criar diretório de uploads se não existir
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'fotos')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(7)
    const ext = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp'
    const filename = `foto-${paginaId}-${timestamp}-${random}.${ext}`
    const filepath = path.join(uploadsDir, filename)

    // Salvar arquivo
    const buffer = await file.arrayBuffer()
    fs.writeFileSync(filepath, Buffer.from(buffer))

    // URL da foto
    const fotoUrl = `/uploads/fotos/${filename}`

    // Atualizar banco de dados
    db.prepare(`
      UPDATE paginas 
      SET foto_url = ?, mostrar_foto = 1, data_atualizacao = datetime('now')
      WHERE id = ?
    `).run(fotoUrl, paginaId)

    return NextResponse.json({
      success: true,
      fotoUrl,
      message: 'Foto enviada com sucesso',
    })
  } catch (error) {
    console.error('Erro ao fazer upload de foto:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

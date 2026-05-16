'use client'

import { useState } from 'react'
import { Upload, X as XIcon } from 'lucide-react'
import PhotoEditor from '@/components/public/PhotoEditor'

interface PhotoUploadCardProps {
  paginaId: string
  onPhotoSaved?: (fotoUrl: string, rotation: number) => void
  initialFotoUrl?: string
  initialRotacao?: number
}

export default function PhotoUploadCard({
  paginaId,
  onPhotoSaved,
  initialFotoUrl,
  initialRotacao = 0,
}: PhotoUploadCardProps) {
  const [showEditor, setShowEditor] = useState(false)
  const [fotoUrl, setFotoUrl] = useState<string | undefined>(initialFotoUrl)
  const [rotacao, setRotacao] = useState(initialRotacao)
  const [isSaving, setIsSaving] = useState(false)

  const handleSavePhoto = async (imageData: string, rotation: number) => {
    try {
      setIsSaving(true)

      // Se for ID temporário, apenas salvar no estado local
      if (paginaId.startsWith('temp-')) {
        setFotoUrl(imageData)
        setRotacao(rotation)
        setShowEditor(false)
        onPhotoSaved?.(imageData, rotation)
        return
      }

      // Salvar foto no banco de dados
      const response = await fetch(`/api/paginas/${paginaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fotoUrl: imageData,
          fotoRotacao: rotation,
          mostrarFoto: true,
        }),
      })

      if (response.ok) {
        setFotoUrl(imageData)
        setRotacao(rotation)
        setShowEditor(false)
        onPhotoSaved?.(imageData, rotation)
      } else {
        alert('Erro ao salvar foto')
      }
    } catch (error) {
      console.error('Erro ao salvar foto:', error)
      alert('Erro ao salvar foto')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemovePhoto = async () => {
    if (!confirm('Tem certeza que deseja remover a foto?')) return

    try {
      // Se for ID temporário, apenas remover do estado local
      if (paginaId.startsWith('temp-')) {
        setFotoUrl(undefined)
        setRotacao(0)
        return
      }

      const response = await fetch(`/api/paginas/${paginaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fotoUrl: null,
          mostrarFoto: false,
        }),
      })

      if (response.ok) {
        setFotoUrl(undefined)
        setRotacao(0)
      } else {
        alert('Erro ao remover foto')
      }
    } catch (error) {
      console.error('Erro ao remover foto:', error)
      alert('Erro ao remover foto')
    }
  }

  return (
    <>
      <div className="rounded-2xl border-2 border-dashed border-blue-300 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/20 p-8">
        {!fotoUrl ? (
          // Estado: Sem foto
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
              <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-dark-text mb-2">
              Adicione uma foto da sua empresa
            </h3>
            <p className="text-sm text-slate-600 dark:text-dark-muted mb-4">
              Escolha a melhor foto para representar seu negócio
            </p>
            <button
              onClick={() => setShowEditor(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transition-all shadow-lg shadow-blue-200 dark:shadow-none"
            >
              <Upload className="w-5 h-5" />
              Adicionar Foto
            </button>
          </div>
        ) : (
          // Estado: Com foto
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-dark-text">
                  ✓ Foto adicionada com sucesso
                </h3>
                <p className="text-sm text-slate-600 dark:text-dark-muted mt-1">
                  Ângulo: <span className="font-bold text-blue-600">{Math.round(rotacao)}°</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowEditor(true)}
                  className="px-4 py-2 rounded-lg font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={handleRemovePhoto}
                  className="p-2 rounded-lg text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Preview da foto */}
            <div className="flex justify-center">
              <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-lg border-4 border-blue-200 dark:border-blue-900/50">
                <img
                  src={fotoUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  style={{
                    transform: `rotate(${rotacao}deg)`,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Photo Editor Modal */}
      {showEditor && (
        <PhotoEditor
          onSave={handleSavePhoto}
          onCancel={() => setShowEditor(false)}
          initialImage={fotoUrl}
          initialRotation={rotacao}
        />
      )}
    </>
  )
}

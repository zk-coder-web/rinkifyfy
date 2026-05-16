'use client'

import { useEffect, useRef, useState } from 'react'
import { X as XIcon } from 'lucide-react'

interface PhotoEditorProps {
  onSave: (imageData: string, rotation: number) => void
  onCancel: () => void
  initialImage?: string
  initialRotation?: number
}

export default function PhotoEditor({
  onSave,
  onCancel,
  initialImage,
  initialRotation = 0,
}: PhotoEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const circleCanvasRef = useRef<HTMLCanvasElement>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [rotation, setRotation] = useState(initialRotation)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [isSaving, setIsSaving] = useState(false)

  // Carregar imagem inicial se fornecida
  useEffect(() => {
    if (initialImage) {
      const img = new Image()
      img.onload = () => setImage(img)
      img.src = initialImage
    }
  }, [initialImage])

  // Desenhar imagem no canvas com rotação
  useEffect(() => {
    if (!image || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.drawImage(image, -image.width / 2, -image.height / 2)
    ctx.restore()
  }, [image, rotation])

  // Desenhar preview circular
  useEffect(() => {
    if (!image || !circleCanvasRef.current) return

    const canvas = circleCanvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = canvas.width
    const radius = size / 2

    // Limpar canvas
    ctx.clearRect(0, 0, size, size)

    // Desenhar círculo de fundo
    ctx.fillStyle = '#f3f4f6'
    ctx.beginPath()
    ctx.arc(radius, radius, radius, 0, Math.PI * 2)
    ctx.fill()

    // Salvar contexto
    ctx.save()

    // Criar clipping path circular
    ctx.beginPath()
    ctx.arc(radius, radius, radius - 2, 0, Math.PI * 2)
    ctx.clip()

    // Mover para o centro e rotacionar
    ctx.translate(radius, radius)
    ctx.rotate((rotation * Math.PI) / 180)

    // Calcular escala para preencher o círculo
    const maxDim = Math.max(image.width, image.height)
    const scale = (radius * 2) / maxDim

    // Desenhar imagem centralizada e escalada
    ctx.drawImage(
      image,
      -image.width / 2,
      -image.height / 2,
      image.width * scale,
      image.height * scale
    )

    // Restaurar contexto
    ctx.restore()

    // Desenhar borda do círculo
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(radius, radius, radius - 1.5, 0, Math.PI * 2)
    ctx.stroke()
  }, [image, rotation])

  // Manipulação de arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter menos de 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        setImage(img)
        setRotation(0)
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  // Rotação com mouse/touch
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true)
    setStartX(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return
    const diff = e.clientX - startX
    setRotation((prev) => {
      let newRotation = prev + diff * 0.5
      return newRotation < 0 ? newRotation + 360 : newRotation % 360
    })
    setStartX(e.clientX)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Touch events para mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    setIsDragging(true)
    setStartX(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging) return
    const diff = e.touches[0].clientX - startX
    setRotation((prev) => {
      let newRotation = prev + diff * 0.5
      return newRotation < 0 ? newRotation + 360 : newRotation % 360
    })
    setStartX(e.touches[0].clientX)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Salvar imagem
  const handleSave = async () => {
    if (!canvasRef.current) return

    try {
      setIsSaving(true)
      const imageData = canvasRef.current.toDataURL('image/jpeg', 0.9)
      onSave(imageData, rotation)
    } catch (error) {
      console.error('Erro ao salvar imagem:', error)
      alert('Erro ao salvar imagem')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div
        ref={containerRef}
        className="bg-white dark:bg-dark-card rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-slate-200 dark:border-dark-border sticky top-0 bg-white dark:bg-dark-card">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-dark-text">
              Personalize sua Foto
            </h2>
            <p className="text-sm text-slate-500 dark:text-dark-muted mt-1">
              Arraste para rotacionar e encontre o ângulo perfeito
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 dark:hover:bg-dark-border rounded-lg transition-colors"
          >
            <XIcon className="w-6 h-6 text-slate-600 dark:text-dark-muted" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-8">
          {!image ? (
            // Upload
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-3 border-dashed border-slate-300 dark:border-dark-border rounded-2xl p-12 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-all hover:bg-blue-50 dark:hover:bg-blue-950/10"
            >
              <div className="text-6xl mb-4">📸</div>
              <p className="font-black text-slate-900 dark:text-dark-text mb-2 text-lg">
                Clique para adicionar sua foto
              </p>
              <p className="text-sm text-slate-500 dark:text-dark-muted mb-3">
                ou arraste uma imagem aqui
              </p>
              <p className="text-xs text-slate-400 dark:text-dark-subtle">
                Máximo 5MB • JPG, PNG, WebP
              </p>
            </div>
          ) : (
            // Editor com layout profissional
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Lado Esquerdo - Canvas para rotação */}
              <div className="flex flex-col items-center gap-4">
                <p className="text-sm font-bold text-slate-600 dark:text-dark-muted">
                  Arraste para rotacionar
                </p>
                <div className="bg-slate-100 dark:bg-dark-border rounded-2xl p-4 flex items-center justify-center w-full aspect-square">
                  <canvas
                    ref={canvasRef}
                    width={300}
                    height={300}
                    className="cursor-grab active:cursor-grabbing rounded-xl"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  />
                </div>
              </div>

              {/* Lado Direito - Preview Circular */}
              <div className="flex flex-col items-center gap-4">
                <p className="text-sm font-bold text-slate-600 dark:text-dark-muted">
                  Preview (como ficará)
                </p>
                <div className="flex items-center justify-center">
                  <canvas
                    ref={circleCanvasRef}
                    width={280}
                    height={280}
                    className="rounded-full shadow-2xl"
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-dark-muted text-center">
                  Ângulo: <span className="font-bold text-blue-600">{Math.round(rotation)}°</span>
                </p>
              </div>
            </div>
          )}

          {/* Input File Oculto */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Botões de Ação */}
          {image && (
            <div className="flex gap-4 pt-8 border-t border-slate-200 dark:border-dark-border mt-8">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-3 rounded-xl font-bold text-slate-700 dark:text-dark-text bg-slate-100 dark:bg-dark-border hover:bg-slate-200 dark:hover:bg-dark-border/80 transition-colors"
              >
                Trocar Foto
              </button>
              <button
                onClick={onCancel}
                className="flex-1 py-3 rounded-xl font-bold text-slate-700 dark:text-dark-text bg-slate-100 dark:bg-dark-border hover:bg-slate-200 dark:hover:bg-dark-border/80 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 py-3 rounded-xl font-black text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200 dark:shadow-none"
              >
                {isSaving ? 'Salvando...' : 'Confirmar Foto'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

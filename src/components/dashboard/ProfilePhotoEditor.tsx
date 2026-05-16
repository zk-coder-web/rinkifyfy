'use client'

import { useState, useRef, useEffect } from 'react'
import { Edit2, X, Check, RotateCw } from 'lucide-react'

interface ProfilePhotoEditorProps {
  currentPhoto?: string
  userName: string
  onSave: (photoData: string) => Promise<void>
}

export function ProfilePhotoEditor({ currentPhoto, userName, onSave }: ProfilePhotoEditorProps) {
  const [showModal, setShowModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [rotation, setRotation] = useState(0)
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)
  const [saving, setSaving] = useState(false)
  const [processedPreview, setProcessedPreview] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const dragContainerRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef({ x: 0, y: 0 })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        // Comprimir e otimizar a imagem antes de usar como preview
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) return

          // Redimensionar para máximo 1024x1024 mantendo proporção
          let width = img.width
          let height = img.height
          const maxSize = 1024

          if (width > height) {
            if (width > maxSize) {
              height = Math.round((height * maxSize) / width)
              width = maxSize
            }
          } else {
            if (height > maxSize) {
              width = Math.round((width * maxSize) / height)
              height = maxSize
            }
          }

          canvas.width = width
          canvas.height = height
          ctx.drawImage(img, 0, 0, width, height)

          // Converter para JPEG com qualidade otimizada
          const optimizedData = canvas.toDataURL('image/jpeg', 0.85)
          setPreview(optimizedData)
          setRotation(0)
          setOffsetX(0)
          setOffsetY(0)
          setHasInteracted(false)
        }
        img.src = event.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  }

  // Função para processar a imagem (usada tanto para preview quanto para salvar)
  const processImage = async (imageData: string, rot: number, offX: number, offY: number, canvasElement: HTMLCanvasElement): Promise<string> => {
    const canvas = canvasElement
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    const size = 256
    const borderWidth = 3
    const totalSize = size + borderWidth * 2
    
    canvas.width = totalSize
    canvas.height = totalSize

    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        // Fundo branco
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, totalSize, totalSize)

        // Sombra suave
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)'
        ctx.shadowBlur = 12
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 4

        // Desenha círculo branco com borda
        ctx.beginPath()
        ctx.arc(totalSize / 2, totalSize / 2, size / 2 + borderWidth, 0, Math.PI * 2)
        ctx.fillStyle = '#ffffff'
        ctx.fill()

        // Remove sombra para o recorte
        ctx.shadowColor = 'transparent'

        // Cria máscara circular para a imagem
        ctx.save()
        ctx.beginPath()
        ctx.arc(totalSize / 2, totalSize / 2, size / 2, 0, Math.PI * 2)
        ctx.clip()

        // Aplica transformações (rotação + offset)
        ctx.translate(totalSize / 2, totalSize / 2)
        ctx.rotate((rot * Math.PI) / 180)
        ctx.translate(offX, offY)

        // Desenha a imagem centralizada
        const imgWidth = img.width
        const imgHeight = img.height
        ctx.drawImage(
          img,
          -imgWidth / 2,
          -imgHeight / 2,
          imgWidth,
          imgHeight
        )

        ctx.restore()

        // Converte para base64 com qualidade otimizada
        const photoData = canvas.toDataURL('image/jpeg', 0.92)
        resolve(photoData)
      }
      img.src = imageData
    })
  }

  // Atualiza o preview quando a imagem, rotação ou offset muda
  useEffect(() => {
    if (preview && previewCanvasRef.current) {
      processImage(preview, rotation, offsetX, offsetY, previewCanvasRef.current).then(setProcessedPreview)
    }
  }, [preview, rotation, offsetX, offsetY])

  const handleSave = async () => {
    if (!canvasRef.current || !preview) return

    try {
      setSaving(true)
      const photoData = await processImage(preview, rotation, offsetX, offsetY, canvasRef.current)
      await onSave(photoData)
      setShowModal(false)
      setSelectedFile(null)
      setPreview('')
      setProcessedPreview('')
      setSaving(false)
    } catch (error) {
      console.error('Erro ao salvar foto:', error)
      setSaving(false)
    }
  }

  // Handlers para drag (mouse e touch)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasInteracted) {
      setHasInteracted(true)
    }
    setIsDragging(true)
    dragStartRef.current = { x: e.clientX, y: e.clientY }
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!hasInteracted) {
      setHasInteracted(true)
    }
    if (e.touches.length === 1) {
      setIsDragging(true)
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragContainerRef.current) return

    const rect = dragContainerRef.current.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Calcula o offset baseado na posição do mouse
    const newOffsetX = Math.round((x - centerX) / 3)
    const newOffsetY = Math.round((y - centerY) / 3)

    setOffsetX(Math.max(-60, Math.min(60, newOffsetX)))
    setOffsetY(Math.max(-60, Math.min(60, newOffsetY)))
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !dragContainerRef.current || e.touches.length === 0) return

    const rect = dragContainerRef.current.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const x = e.touches[0].clientX - rect.left
    const y = e.touches[0].clientY - rect.top

    // Calcula o offset baseado na posição do toque
    const newOffsetX = Math.round((x - centerX) / 3)
    const newOffsetY = Math.round((y - centerY) / 3)

    setOffsetX(Math.max(-60, Math.min(60, newOffsetX)))
    setOffsetY(Math.max(-60, Math.min(60, newOffsetY)))
  }

  const handleReset = () => {
    setRotation(0)
    setOffsetX(0)
    setOffsetY(0)
    setHasInteracted(false)
  }

  const handleCancel = () => {
    setShowModal(false)
    setSelectedFile(null)
    setPreview('')
    setRotation(0)
    setOffsetX(0)
    setOffsetY(0)
    setHasInteracted(false)
  }

  return (
    <>
      {/* Botão de edição no avatar - Posicionado na ponta superior */}
      <div className="relative inline-block">
        <button
          onClick={() => setShowModal(true)}
          className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition hover:scale-110 active:scale-95 border-2 border-white dark:border-dark-card"
          title="Editar foto de perfil"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

      {/* Modal de edição */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-2xl overflow-hidden my-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-dark-border">
              <h3 className="text-lg font-black text-slate-900 dark:text-dark-text">
                Editar Foto de Perfil
              </h3>
              <button
                onClick={handleCancel}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-border flex items-center justify-center transition"
              >
                <X className="w-5 h-5 text-slate-600 dark:text-dark-muted" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
              {!preview ? (
                // Seleção de arquivo
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-dark-border rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center mx-auto mb-3">
                    <i className="fa-solid fa-cloud-arrow-up text-blue-600 text-lg" />
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-dark-text mb-1">
                    Clique para selecionar uma foto
                  </p>
                  <p className="text-xs text-slate-500 dark:text-dark-muted">
                    PNG, JPG ou GIF (máx. 5MB)
                  </p>
                </div>
              ) : (
                // Preview e controles
                <div className="space-y-4">
                  {/* 1. IMAGEM MEDIANA */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-700 dark:text-dark-text">
                      Imagem Selecionada
                    </p>
                    <div className="relative w-full h-40 rounded-xl overflow-hidden bg-slate-100 dark:bg-dark-border border border-slate-200 dark:border-dark-border">
                      <img
                        src={preview}
                        alt="Preview"
                        style={{
                          transform: `rotate(${rotation}deg)`,
                          transformOrigin: 'center',
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Controles de rotação */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-dark-text">
                        Rotação
                      </label>
                      <span className="text-xs font-semibold text-slate-500 dark:text-dark-muted">
                        {rotation}°
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-slate-100 dark:bg-dark-border hover:bg-slate-200 dark:hover:bg-dark-hover transition text-sm font-semibold text-slate-700 dark:text-dark-text"
                      >
                        <RotateCw className="w-4 h-4" />
                        Girar
                      </button>
                      <button
                        onClick={handleReset}
                        className="flex-1 px-3 py-2 rounded-lg bg-slate-100 dark:bg-dark-border hover:bg-slate-200 dark:hover:bg-dark-hover transition text-sm font-semibold text-slate-700 dark:text-dark-text"
                      >
                        Resetar
                      </button>
                    </div>
                  </div>

                  {/* Controles de posicionamento */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-700 dark:text-dark-text mb-2">
                      Ajustar Posição (Arraste dentro do círculo)
                    </p>
                    
                    {/* Editor visual interativo - BOLHA GRANDE */}
                    <div
                      ref={dragContainerRef}
                      onMouseDown={handleMouseDown}
                      onMouseUp={handleMouseUp}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseUp}
                      onTouchStart={handleTouchStart}
                      onTouchEnd={handleTouchEnd}
                      onTouchMove={handleTouchMove}
                      className="relative w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-dark-border dark:to-dark-bg border-2 border-dashed border-slate-300 dark:border-dark-border cursor-grab active:cursor-grabbing select-none touch-none flex items-center justify-center"
                    >
                      {/* Imagem arrastável - Maior */}
                      <img
                        src={preview}
                        alt="Arrastável"
                        style={{
                          transform: `rotate(${rotation}deg) translate(${offsetX}px, ${offsetY}px)`,
                          transformOrigin: 'center',
                          width: '150%',
                          height: '150%',
                          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                        }}
                        className="object-cover pointer-events-none"
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                      />

                      {/* Overlay circular GRANDE para mostrar o resultado */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-48 h-48 rounded-full border-4 border-white shadow-2xl opacity-70" />
                      </div>

                      {/* Indicador de centro */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-2 h-2 bg-white rounded-full shadow-lg" />
                      </div>

                      {/* Instrução */}
                      <div className="absolute top-3 left-3 right-3 text-center pointer-events-none">
                        <p className="text-xs font-bold text-white bg-black/50 px-3 py-1.5 rounded-full inline-block backdrop-blur-sm">
                          Arraste para ajustar
                        </p>
                      </div>
                    </div>

                    {/* Info de posição */}
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-dark-muted bg-slate-50 dark:bg-dark-border p-2 rounded-lg">
                      <span className="font-semibold">X: {offsetX > 0 ? '+' : ''}{offsetX}px</span>
                      <span className="font-semibold">Y: {offsetY > 0 ? '+' : ''}{offsetY}px</span>
                      <button
                        onClick={handleReset}
                        className="px-2 py-1 rounded bg-slate-200 dark:bg-dark-hover hover:bg-slate-300 dark:hover:bg-dark-border transition text-xs font-semibold text-slate-700 dark:text-dark-text"
                      >
                        Resetar
                      </button>
                    </div>
                  </div>

                  {/* Preview do resultado final - RESULTADO IGUAL */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-700 dark:text-dark-text">
                      Resultado Final (Exatamente como ficará)
                    </p>
                    <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-dark-border dark:to-dark-bg p-6 flex flex-col items-center justify-center">
                      {/* Avatar circular com borda e sombra - Usando imagem processada */}
                      <div className="flex justify-center mb-4">
                        {processedPreview && (
                          <img
                            src={processedPreview}
                            alt="Preview final processado"
                            className="w-32 h-32 rounded-full object-cover"
                          />
                        )}
                      </div>

                      {/* Nome */}
                      <h3 className="text-base font-black text-slate-900 dark:text-dark-text mb-1">
                        {userName}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-dark-muted mb-4">
                        seu@email.com
                      </p>

                      {/* Botão de atualizar */}
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-sm font-bold hover:from-blue-700 hover:to-cyan-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <>
                            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Atualizar Foto
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Input hidden */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Footer */}
            <div className="flex gap-2 p-4 border-t border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg">
              {!preview ? (
                <button
                  onClick={handleCancel}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border text-sm font-bold text-slate-700 dark:text-dark-text hover:bg-slate-100 dark:hover:bg-dark-border transition"
                >
                  Cancelar
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border text-sm font-bold text-slate-700 dark:text-dark-text hover:bg-slate-100 dark:hover:bg-dark-border transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => setPreview('')}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border text-sm font-bold text-slate-700 dark:text-dark-text hover:bg-slate-100 dark:hover:bg-dark-border transition"
                  >
                    Trocar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Canvas oculto para processamento */}
      <canvas ref={canvasRef} className="hidden" />
      <canvas ref={previewCanvasRef} className="hidden" />
    </>
  )
}

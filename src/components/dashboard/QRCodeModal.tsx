'use client'

import { useEffect, useRef, useState } from 'react'
// @ts-ignore
import QRCode from 'qrcode'
import { X as XIcon, Download, FileText } from 'lucide-react'

interface QRCodeModalProps {
  slug: string
  nome: string
  isOpen: boolean
  onClose: () => void
}

export default function QRCodeModal({ slug, nome, isOpen, onClose }: QRCodeModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [showModal, setShowModal] = useState(isOpen)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  useEffect(() => {
    setShowModal(isOpen)
  }, [isOpen])

  useEffect(() => {
    if (!showModal || !canvasRef.current) return

    const generateQRCode = async () => {
      try {
        // Detectar o host atual (localhost, 192.168.x.x, ou domínio)
        const host = typeof window !== 'undefined' ? window.location.host : 'rankify.com.br'
        const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:'
        const url = `${protocol}//${host}/p/${slug}`
        
        // Gerar QR Code
        await QRCode.toCanvas(canvasRef.current, url, {
          errorCorrectionLevel: 'H',
          margin: 2,
          width: 250,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        })

        // Adicionar logo "R" no centro
        const canvas = canvasRef.current
        if (!canvas) return
        
        const ctx = canvas.getContext('2d')
        if (ctx) {
          // Desenhar fundo branco para o logo
          const logoSize = 35
          const x = (canvas.width - logoSize) / 2
          const y = (canvas.height - logoSize) / 2

          // Fundo branco
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(x, y, logoSize, logoSize)

          // Texto "R" em azul puro
          ctx.fillStyle = '#0000FF'
          ctx.font = 'bold 28px Arial'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('R', canvas.width / 2, canvas.height / 2)
        }
      } catch (error) {
        console.error('Erro ao gerar QR Code:', error)
      }
    }

    generateQRCode()
  }, [showModal, slug])

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement('a')
      link.href = canvasRef.current.toDataURL('image/png')
      link.download = `qrcode-${slug}.png`
      link.click()
    }
  }

  const handleDownloadPDF = async () => {
    if (!canvasRef.current) return
    
    try {
      setIsDownloading(true)
      
      // Importar jsPDF dinamicamente
      const { jsPDF } = await import('jspdf')
      
      // Obter imagem do canvas
      const imageData = canvasRef.current.toDataURL('image/png')
      
      // Criar PDF com tamanho menor (10x10cm)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'cm',
        format: [10, 10],
      })
      
      // Adicionar imagem ao PDF (centralizada)
      const imgWidth = 9
      const imgHeight = 9
      const x = (10 - imgWidth) / 2
      const y = (10 - imgHeight) / 2
      
      pdf.addImage(imageData, 'PNG', x, y, imgWidth, imgHeight)
      
      // Baixar PDF
      pdf.save(`qrcode-${slug}.pdf`)
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      alert('Erro ao gerar PDF. Tente novamente.')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleClose = () => {
    setShowModal(false)
    
    // Se marcou "Não exibir novamente", salvar no localStorage
    if (dontShowAgain) {
      localStorage.setItem('qrCodeNeverShow', 'true')
    }
    
    onClose()
  }

  return (
    <>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl max-w-sm w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-dark-border">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-dark-text">
                  QR Code
                </h2>
                <p className="text-xs text-slate-500 dark:text-dark-muted mt-0.5">
                  {nome}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-dark-border rounded-lg transition-colors"
              >
                <XIcon className="w-5 h-5 text-slate-600 dark:text-dark-muted" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-6 flex flex-col items-center gap-4">
              {/* QR Code */}
              <div className="bg-white p-3 rounded-lg shadow-md">
                <canvas
                  ref={canvasRef}
                  className="w-64 h-64"
                />
              </div>

              {/* Botões de Download - Pequenos e Focados */}
              <div className="flex gap-2 w-full">
                <button
                  onClick={handleDownload}
                  title="Baixar QR Code em PNG"
                  className="flex-1 py-2 px-3 rounded-lg font-semibold text-white text-xs transition-all duration-300 bg-blue-600 hover:bg-blue-700 active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  PNG
                </button>

                <button
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  title="Baixar QR Code em PDF"
                  className="flex-1 py-2 px-3 rounded-lg font-semibold text-white text-xs transition-all duration-300 bg-red-600 hover:bg-red-700 active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText className="w-4 h-4" />
                  PDF
                </button>
              </div>

              {/* Checkbox "Não exibir novamente" */}
              <label className="flex items-center gap-2 w-full cursor-pointer">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-600 dark:text-dark-muted">
                  Não exibir novamente
                </span>
              </label>

              {/* Fechar */}
              <button
                onClick={handleClose}
                className="w-full py-1.5 rounded-lg font-semibold text-sm text-slate-700 dark:text-dark-text transition-colors bg-slate-100 dark:bg-dark-border hover:bg-slate-200 dark:hover:bg-dark-border/80"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  )
}

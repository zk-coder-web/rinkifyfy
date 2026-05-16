'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { QrCode as QrCodeIcon } from 'lucide-react'

interface QRCodeContextType {
  isOpen: boolean
  slug: string | null
  nome: string | null
  openQRCode: (slug: string, nome: string) => void
  closeQRCode: () => void
}

const QRCodeContext = createContext<QRCodeContextType | undefined>(undefined)

export function useQRCode() {
  const context = useContext(QRCodeContext)
  if (!context) {
    // Retornar um contexto vazio em vez de lançar erro
    return {
      isOpen: false,
      slug: null,
      nome: null,
      openQRCode: () => {},
      closeQRCode: () => {}
    }
  }
  return context
}

export function QRCodeProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [slug, setSlug] = useState<string | null>(null)
  const [nome, setNome] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Garantir que o componente está montado no cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  const openQRCode = (newSlug: string, newNome: string) => {
    setSlug(newSlug)
    setNome(newNome)
    setIsOpen(true)
  }

  const closeQRCode = () => {
    setIsOpen(false)
  }

  if (!mounted) return <>{children}</>

  return (
    <QRCodeContext.Provider value={{ isOpen, slug, nome, openQRCode, closeQRCode }}>
      {children}
      
      {/* Botão Flutuante Global - Fixo no bottom */}
      {slug && (
        <button
          onClick={() => setIsOpen(true)}
          title="Abrir QR Code"
          className="fixed right-6 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-30 active:scale-95 md:hidden"
          style={{
            bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))'
          }}
        >
          <QrCodeIcon className="w-7 h-7" />
        </button>
      )}
    </QRCodeContext.Provider>
  )
}

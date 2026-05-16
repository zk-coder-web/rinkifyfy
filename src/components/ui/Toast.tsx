'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, X } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  onClose?: () => void
}

export default function Toast({ 
  message, 
  type = 'success', 
  duration = 3000,
  onClose 
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      if (onClose) {
        setTimeout(onClose, 300) // Aguarda animação de saída
      }
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-emerald-500'
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-rose-500'
      case 'info':
        return 'bg-gradient-to-r from-blue-600 to-cyan-500'
      default:
        return 'bg-gradient-to-r from-blue-600 to-cyan-500'
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-up">
      <div className={`${getTypeStyles()} text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3`}>
        <CheckCircle className="w-5 h-5" />
        <span className="font-bold">{message}</span>
        <button
          onClick={() => {
            setIsVisible(false)
            if (onClose) onClose()
          }}
          className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
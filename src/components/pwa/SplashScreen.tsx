'use client'

import { useEffect, useState } from 'react'

// Hook para detectar se está em modo PWA
function useIsPWA() {
  const [isPWA, setIsPWA] = useState(false)
  
  useEffect(() => {
    if (typeof window === 'undefined') return
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                       (navigator as any).standalone === true
    setIsPWA(standalone)
  }, [])
  
  return isPWA
}

// Hook para controlar a splash screen
export function useSplashScreen() {
  const [showSplash, setShowSplash] = useState(true)
  const isPWA = useIsPWA()
  
  useEffect(() => {
    // Só mostra splash se for PWA
    if (!isPWA) {
      setShowSplash(false)
      return
    }
    
    // Tempo mínimo da splash screen (1.5 segundos)
    const minSplashTime = 1500
    const startTime = Date.now()
    
    // Quando a página carregar, esconde a splash
    const hideSplash = () => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, minSplashTime - elapsed)
      
      setTimeout(() => {
        setShowSplash(false)
      }, remaining)
    }
    
    // Verifica se o documento já carregou
    if (document.readyState === 'complete') {
      hideSplash()
    } else {
      window.addEventListener('load', hideSplash)
      return () => window.removeEventListener('load', hideSplash)
    }
  }, [isPWA])
  
  return { showSplash, isPWA }
}

// Componente da Splash Screen
export function PWASplashScreen() {
  const [phase, setPhase] = useState<'pulse' | 'scale' | 'fade'>('pulse')
  
  useEffect(() => {
    // Fase 1: Pulse (0-800ms)
    const pulseTimer = setTimeout(() => setPhase('scale'), 800)
    // Fase 2: Scale (800-1200ms)
    const scaleTimer = setTimeout(() => setPhase('fade'), 1200)
    
    return () => {
      clearTimeout(pulseTimer)
      clearTimeout(scaleTimer)
    }
  }, [])
  
  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900 transition-opacity duration-300 ${
        phase === 'fade' ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ 
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
      {/* Logo Container */}
      <div 
        className={`transition-all duration-500 ease-out ${
          phase === 'pulse' ? 'scale-100 animate-pulse' : 
          phase === 'scale' ? 'scale-110' : 
          'scale-100'
        }`}
      >
        {/* Star Icon */}
        <div className="relative">
          <svg 
            width="120" 
            height="120" 
            viewBox="0 0 120 120" 
            className={`transition-transform duration-700 ${
              phase === 'pulse' || phase === 'scale' ? 'animate-spin-slow' : ''
            }`}
            style={{
              filter: 'drop-shadow(0 0 40px rgba(56, 189, 248, 0.5)) drop-shadow(0 0 80px rgba(37, 99, 235, 0.3))'
            }}
          >
            <defs>
              <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
            </defs>
            <path
              d="M60 5 L72 45 L115 45 L80 70 L92 110 L60 85 L28 110 L40 70 L5 45 L48 45 Z"
              fill="url(#starGradient)"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1"
            />
          </svg>
          
          {/* Glow effect */}
          <div 
            className="absolute inset-0 rounded-full blur-3xl opacity-60"
            style={{
              background: 'radial-gradient(circle, rgba(56, 189, 248, 0.4) 0%, transparent 70%)'
            }}
          />
        </div>
      </div>
      
      {/* App Name */}
      <h1 
        className={`mt-8 text-4xl font-black text-white tracking-tight transition-all duration-500 ${
          phase === 'fade' ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
        }`}
        style={{
          textShadow: '0 0 40px rgba(56, 189, 248, 0.5)'
        }}
      >
        Rankify
      </h1>
      
      {/* Loading indicator */}
      <div 
        className={`mt-6 w-32 h-1 bg-white/20 rounded-full overflow-hidden transition-opacity duration-300 ${
          phase === 'fade' ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div 
          className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-loading-bar"
          style={{
            boxShadow: '0 0 10px rgba(56, 189, 248, 0.8)'
          }}
        />
      </div>
      
      {/* Tagline */}
      <p 
        className={`mt-4 text-sm font-semibold text-blue-200/80 transition-all duration-500 ${
          phase === 'fade' ? 'opacity-0' : 'opacity-100'
        }`}
      >
        Gerencie suas páginas
      </p>
    </div>
  )
}

// CSS for animations (add to globals.css)
// @keyframes spin-slow {
//   from { transform: rotate(0deg); }
//   to { transform: rotate(360deg); }
// }
// .animate-spin-slow { animation: spin-slow 3s linear infinite; }
// @keyframes loading-bar {
//   0% { width: 0%; }
//   50% { width: 70%; }
//   100% { width: 100%; }
// }
// .animate-loading-bar { animation: loading-bar 1.2s ease-in-out infinite; }

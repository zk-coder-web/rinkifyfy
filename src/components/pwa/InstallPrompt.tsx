'use client'

import { useEffect, useState, useRef } from 'react'
import { Smartphone, X, Download, Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

// Check if running in emulator/simulator
function checkIfEmulator(): boolean {
  if (typeof window === 'undefined') return true
  
  const ua = navigator.userAgent.toLowerCase()
  
  const emulatorIndicators = [
    'simulator',
    'emulator',
    'sdk',
    'x86',
    'x64',
    'virtualbox',
    'vmware',
    'genymotion',
    'bluestacks',
    'nox',
    'andy',
    'memu',
    'ldplayer',
    'mumu',
  ]
  
  return emulatorIndicators.some(indicator => ua.includes(indicator))
}

// Detect device type - only real devices
function detectDeviceType(): 'ios' | 'android' | null {
  if (typeof window === 'undefined') return null
  
  const ua = navigator.userAgent.toLowerCase()
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  
  if (checkIfEmulator()) {
    console.log('[PWA] Emulator detected, skipping install prompt')
    return null
  }

  const isIOS = /iphone|ipad|ipod/.test(ua) || 
    (ua.includes('mac') && isTouchDevice && navigator.maxTouchPoints > 1)
  
  const isAndroid = /android/.test(ua) && isTouchDevice

  console.log('[PWA] Device detection:', { isIOS, isAndroid, isTouchDevice, ua })

  if (isIOS) return 'ios'
  if (isAndroid) return 'android'
  return null
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | null>(null)
  const [showTutorial, setShowTutorial] = useState(false)

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isIOSSStandalone = (navigator as any).standalone === true
    
    console.log('[PWA] Standalone check:', { isStandalone, isIOSSStandalone })
    
    if (isStandalone || isIOSSStandalone) {
      setIsInstalled(true)
      console.log('[PWA] Already installed, skipping prompt')
      return
    }

    const device = detectDeviceType()
    console.log('[PWA] Detected device:', device)
    setDeviceType(device)
    
    if (!device) {
      console.log('[PWA] No supported device detected')
      return
    }

    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10)
      const daysSinceDismissed = (Date.now() - dismissedTime) / (24 * 60 * 60 * 1000)
      console.log('[PWA] Days since dismissed:', daysSinceDismissed)
      
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        console.log('[PWA] Prompt dismissed recently, skipping')
        return
      }
    }

    if (device === 'ios') {
      console.log('[PWA] iOS detected, showing prompt in 3 seconds...')
      const timer = setTimeout(() => {
        console.log('[PWA] Showing iOS prompt now!')
        setShowPrompt(true)
      }, 3000)
      return () => clearTimeout(timer)
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      console.log('[PWA] beforeinstallprompt event received')
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      setTimeout(() => {
        console.log('[PWA] Showing Android prompt now!')
        setShowPrompt(true)
      }, 3000)
    }

    const handleAppInstalled = () => {
      console.log('[PWA] App installed!')
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setIsInstalled(true)
        setShowPrompt(false)
      }
      
      setDeferredPrompt(null)
    } catch (error) {
      console.error('Error installing PWA:', error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  if (isInstalled || !showPrompt || !deviceType) {
    return null
  }

  return (
    <>
      {/* iOS Install Prompt */}
      {deviceType === 'ios' && (
        <div className="fixed bottom-24 left-4 right-4 z-[100] animate-slide-up">
          <div className="bg-white dark:bg-dark-card rounded-3xl shadow-2xl border border-slate-200 dark:border-dark-border p-4 max-w-sm mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center shrink-0 shadow-lg shadow-blue-200 dark:shadow-none">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-base text-slate-900 dark:text-dark-text">Instale o App!</h3>
                <p className="text-xs text-slate-500 dark:text-dark-muted">Tutorial em vídeo de 20 segundos. Baixe rapidamente!</p>
              </div>
              <button 
                onClick={handleDismiss}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-dark-border rounded-lg transition shrink-0"
                aria-label="Fechar"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setShowTutorial(true)}
                className="flex-1 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-dark-text bg-slate-100 dark:bg-dark-border hover:bg-slate-200 dark:hover:bg-dark-hover transition flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                Tutorial de instalação
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-2.5 rounded-xl text-xs font-bold text-slate-500 dark:text-dark-muted hover:bg-slate-100 dark:hover:bg-dark-border transition"
              >
                Depois
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Android Install Prompt */}
      {deviceType === 'android' && deferredPrompt && (
        <div className="fixed bottom-24 left-4 right-4 z-[100] animate-slide-up">
          <div className="bg-white dark:bg-dark-card rounded-3xl shadow-2xl border border-slate-200 dark:border-dark-border p-4 max-w-sm mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center shrink-0 shadow-lg shadow-blue-200 dark:shadow-none">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-base text-slate-900 dark:text-dark-text">Instale o App!</h3>
                <p className="text-xs text-slate-500 dark:text-dark-muted">Acesse rapidamente pela tela inicial.</p>
              </div>
              <button 
                onClick={handleDismiss}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-dark-border rounded-lg transition shrink-0"
                aria-label="Fechar"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleDismiss}
                className="flex-1 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-500 dark:text-dark-muted bg-slate-100 dark:bg-dark-border hover:bg-slate-200 dark:hover:bg-dark-hover transition"
              >
                Agora não
              </button>
              <button
                onClick={handleInstall}
                className="flex-1 px-3 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transition flex items-center justify-center gap-1.5 shadow-lg shadow-blue-200 dark:shadow-none"
              >
                <Download className="w-3.5 h-3.5" />
                Instalar App
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tutorial Modal */}
      {showTutorial && (
        <TutorialModal onClose={() => setShowTutorial(false)} />
      )}
    </>
  )
}

// Video Tutorial Modal Component
function TutorialModal({ onClose }: { onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(true) // Começa tocando
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto play when modal opens
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        setIsPlaying(false)
      })
    }
  }, [])

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const togglePlay = () => {
    if (!videoRef.current) return
    
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    setCurrentTime(videoRef.current.currentTime)
  }

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return
    setDuration(videoRef.current.duration)
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressRef.current) return
    
    const rect = progressRef.current.getBoundingClientRect()
    const pos = (e.clientX - rect.left) / rect.width
    videoRef.current.currentTime = pos * duration
    setCurrentTime(pos * duration)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    
    if (isMuted) {
      videoRef.current.volume = volume || 1
      setIsMuted(false)
    } else {
      videoRef.current.volume = 0
      setIsMuted(true)
    }
  }

  const changePlaybackRate = () => {
    const rates = [0.5, 1, 1.5, 2]
    const currentIndex = rates.indexOf(playbackRate)
    const nextRate = rates[(currentIndex + 1) % rates.length]
    setPlaybackRate(nextRate)
    if (videoRef.current) {
      videoRef.current.playbackRate = nextRate
    }
  }

  const toggleFullscreen = async () => {
    if (!videoRef.current) return

    if (!isFullscreen) {
      try {
        // Tenta diferentes métodos de fullscreen para compatibilidade
        const video = videoRef.current
        if (video.requestFullscreen) {
          await video.requestFullscreen()
        } else if ((video as any).webkitEnterFullscreen) {
          // iOS Safari
          ;(video as any).webkitEnterFullscreen()
        } else if ((video as any).webkitRequestFullscreen) {
          await (video as any).webkitRequestFullscreen()
        }
        setIsFullscreen(true)
      } catch (err) {
        console.error('Fullscreen error:', err)
      }
    } else {
      try {
        // Tenta sair do fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else if ((document as any).webkitExitFullscreen) {
          ;(document as any).webkitExitFullscreen()
        }
        setIsFullscreen(false)
      } catch (err) {
        console.error('Exit fullscreen error:', err)
      }
    }
  }

  const restart = () => {
    if (!videoRef.current) return
    videoRef.current.currentTime = 0
    setCurrentTime(0)
  }

  const handleVideoEnd = () => {
    setIsPlaying(false)
  }

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement || !!(document as any).webkitFullscreenElement
      setIsFullscreen(isNowFullscreen)
    }
    
    // Escuta ambos os eventos para compatibilidade
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col overflow-hidden">
      {/* Header - só mostra quando não está em fullscreen */}
      {!isFullscreen && (
        <div className="flex items-center justify-between p-4 bg-slate-900 shrink-0">
          <h3 className="font-bold text-white text-lg">Como instalar o App</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-xl transition"
          >
            <X className="w-5 h-5 text-slate-300" />
          </button>
        </div>
      )}

      {/* Video Container - esticado */}
      <div className="flex-1 flex items-center justify-center bg-black relative min-h-0">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleVideoEnd}
          playsInline
        >
          <source src="/assets/tt-install.mov" type="video/quicktime" />
          Seu navegador não suporta vídeos HTML5.
        </video>

        {/* Play overlay */}
        {!isPlaying && !isFullscreen && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 transition hover:bg-black/40"
          >
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
          </button>
        )}

        {/* Fullscreen Close Button */}
        {isFullscreen && (
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 p-3 bg-black/50 rounded-full hover:bg-black/70 transition z-10"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        )}
      </div>

    
      {!isFullscreen && (
        <div className="bg-slate-900 shrink-0">
          <div className="p-4 space-y-3">
            {/* Progress Bar */}
            <div 
              ref={progressRef}
              onClick={handleProgressClick}
              className="relative h-1.5 bg-slate-700 rounded-full cursor-pointer group"
            >
              <div 
                className="absolute h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>

            {/* Time */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button onClick={restart} className="p-2 hover:bg-slate-700 rounded-lg transition">
                  <RotateCcw className="w-4 h-4 text-slate-300" />
                </button>

                <button onClick={togglePlay} className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition">
                  {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
                </button>

                <button onClick={toggleMute} className="p-2 hover:bg-slate-700 rounded-lg transition">
                  {isMuted ? <VolumeX className="w-4 h-4 text-slate-300" /> : <Volume2 className="w-4 h-4 text-slate-300" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-slate-600 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                />
              </div>

              <div className="flex items-center gap-1">
                <button onClick={changePlaybackRate} className="px-2 py-1.5 hover:bg-slate-700 rounded-lg transition text-xs font-bold text-slate-300">
                  {playbackRate}x
                </button>
                <button onClick={toggleFullscreen} className="p-2 hover:bg-slate-700 rounded-lg transition">
                  <Maximize className="w-4 h-4 text-slate-300" />
                </button>
              </div>
            </div>
          </div>

          {/* Tutorial Steps */}
          <div className="p-4 border-t border-slate-700 max-h-[40vh] overflow-y-auto">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Tutorial no Navegador Safari
            </h4>
            
            <div className="space-y-2">
              {/* Step 1 */}
              <div className="flex items-center gap-2 bg-slate-800 rounded-xl p-2.5">
                <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">1</span>
                <span className="text-sm text-slate-300">Clique nos</span>
                <div className="flex flex-col items-center justify-center w-7 h-7 bg-slate-700 rounded-lg gap-0.5">
                  <div className="w-1 h-1 bg-white rounded-full" />
                  <div className="w-1 h-1 bg-white rounded-full" />
                  <div className="w-1 h-1 bg-white rounded-full" />
                </div>
                <span className="text-sm text-slate-300">no navegador</span>
              </div>

              {/* Step 2 */}
              <div className="flex items-center gap-2 bg-slate-800 rounded-xl p-2.5">
                <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">2</span>
                <span className="text-sm text-slate-300">Clique em</span>
                <div className="flex items-center justify-center w-7 h-7 bg-slate-700 rounded-lg">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
                    <polyline points="16 6 12 2 8 6"/>
                    <line x1="12" y1="2" x2="12" y2="15"/>
                  </svg>
                </div>
                <span className="text-sm text-slate-300">Compartilhar</span>
              </div>

              {/* Step 3 */}
              <div className="flex items-center gap-2 bg-slate-800 rounded-xl p-2.5">
                <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">3</span>
                <span className="text-sm text-slate-300">Clique em</span>
                <div className="flex items-center justify-center w-7 h-7 bg-slate-700 rounded-lg">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </div>
                <span className="text-sm text-slate-300">Ver mais</span>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col gap-2 bg-slate-800 rounded-xl p-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">4</span>
                  <span className="text-sm text-slate-300">Toque em</span>
                  <div className="flex items-center justify-center w-7 h-7 bg-slate-700 rounded-lg">
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="3"/>
                      <line x1="12" y1="8" x2="12" y2="16"/>
                      <line x1="8" y1="12" x2="16" y2="12"/>
                    </svg>
                  </div>
                  <span className="text-sm text-slate-300">Adicionar à Tela de Início</span>
                </div>
                <span className="text-xs text-slate-400 ml-8">Depois confirme clicando em "Adicionar"</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Hook to check PWA status
export function usePWA() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [canInstall, setCanInstall] = useState(false)

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isIOSSStandalone = (navigator as any).standalone === true
    setIsInstalled(isStandalone || isIOSSStandalone)

    const handleBeforeInstallPrompt = () => setCanInstall(true)
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setCanInstall(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  return { isInstalled, canInstall }
}

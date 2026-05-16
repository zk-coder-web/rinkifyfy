'use client'

import { useEffect, useState } from 'react'
import { DesktopView } from '@/components/home/DesktopView'
import { MobileView } from '@/components/home/MobileView'
import { SplashScreen } from '@/components/home/SplashScreen'

export default function HomePage() {
  const [isMobile, setIsMobile]     = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [mounted, setMounted]       = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const ua = navigator.userAgent || navigator.vendor || (window as any).opera
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|windows phone|iemobile|opera mini|mobile/i
      return mobileRegex.test(ua.toLowerCase()) || window.innerWidth <= 768
    }

    setIsMobile(checkMobile())
    setMounted(true)

    const timer = window.setTimeout(() => setShowSplash(false), 1200)
    const handleResize = () => setIsMobile(checkMobile())
    window.addEventListener('resize', handleResize)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    document.body.classList.toggle('mobile', isMobile)
    document.body.classList.toggle('desktop', !isMobile)
  }, [isMobile, mounted])

  if (!mounted) return <SplashScreen />

  return (
    <>
      {showSplash && <SplashScreen />}
      <div className={`rankify-page-enter ${showSplash ? 'rankify-real-skeleton' : 'is-ready'}`}>
        {isMobile ? <MobileView /> : <DesktopView />}
      </div>
    </>
  )
}

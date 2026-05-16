'use client'

import { PWASplashScreen, useSplashScreen } from './SplashScreen'

export function SplashWrapper() {
  const { showSplash } = useSplashScreen()
  
  if (!showSplash) return null
  
  return <PWASplashScreen />
}

'use client'

import { useEffect, useState } from 'react'

export function SplashScreen() {
  const [opacity, setOpacity] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpacity(0)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className="rankify-entry-splash fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-500"
      style={{
        opacity,
        pointerEvents: opacity === 0 ? 'none' : 'auto',
      }}
      data-rankify-no-reveal
    >
      <div className="rankify-star-loader" aria-label="Carregando Rankify">
        <div className="rankify-star-scene" aria-hidden="true">
          <div className="rankify-blue-star-3d">
            <span className="rankify-blue-star-face front" />
            <span className="rankify-blue-star-face middle" />
            <span className="rankify-blue-star-face back" />
          </div>
        </div>
        <div className="rankify-star-loader-track">
          <span />
        </div>
      </div>
    </div>
  )
}

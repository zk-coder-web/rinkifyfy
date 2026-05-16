'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { QRCodeProvider } from '@/components/providers/QRCodeProvider'

function FullScreenSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        <p className="text-xs font-semibold text-slate-400 dark:text-dark-muted">Carregando...</p>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, booting } = useAuth()
  const router = useRouter()

  // Fallback redirect — AuthProvider handles this too, but belt-and-suspenders
  useEffect(() => {
    if (!booting && !isLoggedIn) {
      router.replace('/login')
    }
  }, [booting, isLoggedIn, router])

  if (booting) return <FullScreenSpinner />
  if (!isLoggedIn) return null

  return <QRCodeProvider>{children}</QRCodeProvider>
}

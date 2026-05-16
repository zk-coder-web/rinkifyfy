'use client'

import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { useAuth } from '@/components/providers/AuthProvider'

export default function ConfiguracoesPage() {
  const { isLoggedIn, booting, logout } = useAuth()

  return (
    <DashboardShell
      isLoggedIn={isLoggedIn || booting}
      emptyState={{
        icon: 'lock',
        title: 'Acesso restrito',
        description: 'Faça login para alterar configurações.',
      }}
    >
      <main className="min-h-screen bg-slate-950 px-4 pb-24 pt-6 text-white">
        <section className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
          <h1 className="text-3xl font-black">Configurações</h1>
          <p className="mt-2 text-sm font-semibold text-slate-300">Gerencie sua conta Rankify.</p>
          <button onClick={logout} className="mt-6 rounded-2xl bg-red-500 px-5 py-3 text-sm font-black text-white">
            Sair da conta
          </button>
        </section>
      </main>
    </DashboardShell>
  )
}

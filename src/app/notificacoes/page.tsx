'use client'

import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { useAuth } from '@/components/providers/AuthProvider'

export default function NotificacoesPage() {
  const { isLoggedIn, booting } = useAuth()

  return (
    <DashboardShell
      isLoggedIn={isLoggedIn || booting}
      emptyState={{
        icon: 'bell',
        title: 'Acesso restrito',
        description: 'Faça login para ver suas notificações.',
      }}
    >
      <main className="min-h-screen bg-slate-950 px-4 pb-24 pt-6 text-white">
        <section className="mx-auto max-w-2xl">
          <h1 className="mb-5 text-3xl font-black">Notificações</h1>
          <article className="notif-card rounded-3xl border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-500/20 text-cyan-200">
                <i className="fa-solid fa-message" />
              </div>
              <div>
                <h2 className="font-black">Boas-vindas</h2>
                <p className="text-xs text-slate-400">{new Date().toLocaleString('pt-BR')}</p>
              </div>
            </div>
            <p className="mt-4 text-sm font-semibold leading-relaxed text-slate-200">
              Seja bem vindo ao Rankify, qualquer coisa te avisamos por aqui! 😊
            </p>
          </article>
        </section>
      </main>
    </DashboardShell>
  )
}

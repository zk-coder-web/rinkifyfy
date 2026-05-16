'use client'

import Link from 'next/link'
import { ArrowLeft, Building2, Globe, MapPin, Phone } from 'lucide-react'
import { AppShell } from '@/components/app/AppShell'

export default function NovaPaginaPage() {
  return (
    <AppShell title="Nova Página">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Back */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-dark-muted hover:text-slate-900 dark:hover:text-dark-text transition">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Dashboard
        </Link>

        {/* Header */}
        <div className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm">
          <h1 className="text-xl font-black text-slate-900 dark:text-dark-text mb-1">Criar nova página</h1>
          <p className="text-sm text-slate-500 dark:text-dark-muted">
            Preencha os dados da sua empresa para gerar sua página e QR Code.
          </p>
        </div>

        {/* Form — em breve */}
        <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-10 flex flex-col items-center justify-center text-center gap-4">
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs opacity-40">
            {[Building2, Globe, MapPin, Phone].map((Icon, i) => (
              <div key={i} className="rounded-xl bg-slate-100 dark:bg-dark-bg p-4 flex items-center justify-center">
                <Icon className="w-6 h-6 text-slate-400" />
              </div>
            ))}
          </div>
          <div>
            <p className="text-base font-black text-slate-900 dark:text-dark-text">Em breve</p>
            <p className="text-sm text-slate-500 dark:text-dark-muted mt-1 max-w-xs">
              O formulário de criação de páginas está sendo desenvolvido. Em breve você poderá cadastrar sua empresa aqui.
            </p>
          </div>
        </div>

      </div>
    </AppShell>
  )
}

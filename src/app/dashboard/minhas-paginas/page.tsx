'use client'

import { AppShell } from '@/components/app/AppShell'
import GerenciadorPaginas from '@/components/dashboard/GerenciadorPaginas'

export default function MinhasPaginasPage() {
  return (
    <AppShell title="Minhas Páginas">
      <div className="max-w-5xl mx-auto">
        <GerenciadorPaginas autoOpenQR={true} />
      </div>
    </AppShell>
  )
}
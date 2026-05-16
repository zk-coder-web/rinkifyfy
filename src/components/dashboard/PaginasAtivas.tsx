'use client'

import { useState, useEffect } from 'react'
import { Link as LinkIcon, Activity, CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import { usePaginas } from '@/hooks/usePaginas'

export default function PaginasAtivas() {
  const { paginas, toggleAtiva } = usePaginas()
  const [paginasAtivas, setPaginasAtivas] = useState<any[]>([])
  const [paginasInativas, setPaginasInativas] = useState<any[]>([])

  useEffect(() => {
    const ativas = paginas.filter(p => p.ativa)
    const inativas = paginas.filter(p => !p.ativa)
    setPaginasAtivas(ativas)
    setPaginasInativas(inativas)
  }, [paginas])

  const formatarData = (dataISO: string) => {
    const data = new Date(dataISO)
    return data.toLocaleDateString('pt-BR')
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-dark-text">Páginas Ativas</h2>
          <p className="text-sm text-slate-500 dark:text-dark-muted">
            Monitoramento em tempo real das suas páginas
          </p>
        </div>
      </div>

      {/* Páginas Ativas */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-700 dark:text-dark-text">
            Ativas ({paginasAtivas.length})
          </h3>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-green-600 dark:text-green-400">Online</span>
          </div>
        </div>
        
        <div className="space-y-2">
          {paginasAtivas.length === 0 ? (
            <div className="rounded-xl bg-slate-50 dark:bg-dark-border p-4 text-center">
              <p className="text-sm text-slate-500 dark:text-dark-muted">
                Nenhuma página ativa no momento
              </p>
            </div>
          ) : (
            paginasAtivas.map((pagina) => (
              <div
                key={pagina.id}
                className="flex items-center justify-between rounded-xl bg-green-50 dark:bg-green-900/20 p-3 border border-green-100 dark:border-green-800/30"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-800/40 flex items-center justify-center">
                      <LinkIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-dark-text">
                      {pagina.nome}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-dark-muted">
                      Criada em {formatarData(pagina.dataCriacao)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`/p/${pagina.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-white dark:bg-dark-card flex items-center justify-center hover:bg-slate-100 dark:hover:bg-dark-border transition"
                    title="Abrir página"
                  >
                    <ExternalLink className="w-3 h-3 text-slate-600 dark:text-dark-muted" />
                  </a>
                  <button
                    onClick={() => toggleAtiva(pagina.id)}
                    className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-800/50 transition"
                    title="Desativar página"
                  >
                    <XCircle className="w-3 h-3 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Páginas Inativas */}
      {paginasInativas.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-700 dark:text-dark-text">
              Inativas ({paginasInativas.length})
            </h3>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-xs text-red-600 dark:text-red-400">Offline</span>
            </div>
          </div>
          
          <div className="space-y-2">
            {paginasInativas.map((pagina) => (
              <div
                key={pagina.id}
                className="flex items-center justify-between rounded-xl bg-red-50 dark:bg-red-900/20 p-3 border border-red-100 dark:border-red-800/30 opacity-70"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-800/40 flex items-center justify-center">
                    <LinkIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-dark-text line-through">
                      {pagina.nome}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-dark-muted">
                      Desativada • {formatarData(pagina.dataCriacao)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAtiva(pagina.id)}
                    className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center hover:bg-green-200 dark:hover:bg-green-800/50 transition"
                    title="Reativar página"
                  >
                    <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
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
    <div className="rounded-lg md:rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-4 md:p-6 shadow-lg">
      <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
          <Activity className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-dark-text truncate">Páginas Ativas</h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-dark-muted truncate">
            Monitoramento em tempo real
          </p>
        </div>
      </div>

      {/* Páginas Ativas */}
      <div className="mb-4 md:mb-6">
        <div className="flex items-center justify-between mb-2 md:mb-3">
          <h3 className="text-xs md:text-sm font-bold text-slate-700 dark:text-dark-text">
            Ativas ({paginasAtivas.length})
          </h3>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] md:text-xs text-green-600 dark:text-green-400">Online</span>
          </div>
        </div>
        
        <div className="space-y-1.5 md:space-y-2">
          {paginasAtivas.length === 0 ? (
            <div className="rounded-lg md:rounded-xl bg-slate-50 dark:bg-dark-border p-3 md:p-4 text-center">
              <p className="text-xs md:text-sm text-slate-500 dark:text-dark-muted">
                Nenhuma página ativa
              </p>
            </div>
          ) : (
            paginasAtivas.map((pagina) => (
              <div
                key={pagina.id}
                className="flex items-center justify-between rounded-lg md:rounded-xl bg-green-50 dark:bg-green-900/20 p-2.5 md:p-3 border border-green-100 dark:border-green-800/30 gap-2"
              >
                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                  <div className="relative flex-shrink-0">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-green-100 dark:bg-green-800/40 flex items-center justify-center">
                      <LinkIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm font-bold text-slate-900 dark:text-dark-text truncate">
                      {pagina.nome}
                    </p>
                    <p className="text-[10px] md:text-xs text-slate-500 dark:text-dark-muted truncate">
                      {formatarData(pagina.dataCriacao)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                  <a
                    href={`/p/${pagina.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-white dark:bg-dark-card flex items-center justify-center hover:bg-slate-100 dark:hover:bg-dark-border transition"
                    title="Abrir página"
                  >
                    <ExternalLink className="w-3 h-3 md:w-3.5 md:h-3.5 text-slate-600 dark:text-dark-muted" />
                  </a>
                  <button
                    onClick={() => toggleAtiva(pagina.id)}
                    className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-800/50 transition"
                    title="Desativar página"
                  >
                    <XCircle className="w-3 h-3 md:w-3.5 md:h-3.5 text-red-600 dark:text-red-400" />
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
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <h3 className="text-xs md:text-sm font-bold text-slate-700 dark:text-dark-text">
              Inativas ({paginasInativas.length})
            </h3>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-[10px] md:text-xs text-red-600 dark:text-red-400">Offline</span>
            </div>
          </div>
          
          <div className="space-y-1.5 md:space-y-2">
            {paginasInativas.map((pagina) => (
              <div
                key={pagina.id}
                className="flex items-center justify-between rounded-lg md:rounded-xl bg-red-50 dark:bg-red-900/20 p-2.5 md:p-3 border border-red-100 dark:border-red-800/30 opacity-70 gap-2"
              >
                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-red-100 dark:bg-red-800/40 flex items-center justify-center flex-shrink-0">
                    <LinkIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm font-bold text-slate-900 dark:text-dark-text line-through truncate">
                      {pagina.nome}
                    </p>
                    <p className="text-[10px] md:text-xs text-slate-500 dark:text-dark-muted truncate">
                      Desativada • {formatarData(pagina.dataCriacao)}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={() => toggleAtiva(pagina.id)}
                    className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center hover:bg-green-200 dark:hover:bg-green-800/50 transition"
                    title="Reativar página"
                  >
                    <CheckCircle className="w-3 h-3 md:w-3.5 md:h-3.5 text-green-600 dark:text-green-400" />
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
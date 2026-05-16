'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, Eye, Globe, Copy, CheckCircle } from 'lucide-react'
import { ClientOnly } from '@/components/providers/ClientOnly'

interface EmpresaData {
  nome: string
  placeId: string
  instagram: string
  whatsapp: string
  slug: string
  googleReviewLink: string
}

export default function MinhaPagina() {
  const [empresa, setEmpresa] = useState<EmpresaData | null>(null)
  const [copied, setCopied] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const empresaSalva = localStorage.getItem('empresaCriada')
    if (empresaSalva) {
      const data = JSON.parse(empresaSalva)
      setEmpresa(data)
      setPreviewUrl(`/p/${data.slug}`)
    }
  }, [])

  const pageUrl = empresa ? `/p/${empresa.slug}` : ''

  const handleCopyLink = () => {
    if (empresa && typeof window !== 'undefined') {
      navigator.clipboard.writeText(pageUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <ClientOnly
      fallback={
        <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-10 flex flex-col items-center justify-center text-center min-h-[300px]">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-dark-border flex items-center justify-center mb-4">
            <Globe className="w-8 h-8 text-slate-400 dark:text-dark-muted" />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-dark-text mb-2">
            Carregando...
          </h3>
        </div>
      }
    >
      {!empresa ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-10 flex flex-col items-center justify-center text-center min-h-[300px]">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-dark-border flex items-center justify-center mb-4">
            <Globe className="w-8 h-8 text-slate-400 dark:text-dark-muted" />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-dark-text mb-2">
            Nenhuma página criada
          </h3>
          <p className="text-sm text-slate-500 dark:text-dark-muted max-w-xs mb-5">
            Crie sua primeira página para começar a receber avaliações.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-dark-text">Minha Página</h2>
              <p className="text-sm text-slate-500 dark:text-dark-muted">
                Sua página pública premium
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="mb-6">
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center"
            >
              <div className="flex items-center justify-center gap-3">
                <Eye className="w-5 h-5" />
                VER PÁGINA
                <ExternalLink className="w-4 h-4" />
              </div>
            </a>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-700 dark:text-dark-text mb-3">
              Preview da página
            </h3>
            <div className="rounded-xl border border-slate-200 dark:border-dark-border overflow-hidden bg-gradient-to-br from-white via-blue-50 to-cyan-50 p-4">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{empresa.nome}</h4>
                    <p className="text-xs text-slate-500">Escolha uma opção abaixo</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="h-10 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 opacity-80"></div>
                  <div className="h-10 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 opacity-80"></div>
                  <div className="h-10 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 opacity-80"></div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                  <p className="text-xs text-slate-400">Página criada com ❤️ por Rankify</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-dark-text mb-2">
                Link da sua página
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-50 dark:bg-dark-border rounded-xl px-4 py-3">
                  <p className="text-sm text-slate-900 dark:text-dark-text break-all">
                    {pageUrl}
                  </p>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-dark-border flex items-center justify-center hover:bg-slate-200 dark:hover:bg-dark-hover transition"
                >
                  {copied ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-slate-600 dark:text-dark-muted" />
                  )}
                </button>
              </div>
              {copied && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                  Link copiado para a área de transferência!
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-3">
                <p className="text-xs text-slate-500 dark:text-dark-muted mb-1">Link do Google</p>
                <a
                  href={empresa.googleReviewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline truncate block"
                >
                  Ver link
                </a>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-3">
                <p className="text-xs text-slate-500 dark:text-dark-muted mb-1">Slug gerado</p>
                <p className="text-sm font-bold text-slate-900 dark:text-dark-text truncate">
                  {empresa.slug}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </ClientOnly>
  )
}

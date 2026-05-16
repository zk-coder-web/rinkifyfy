'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Eye, 
  Copy, 
  CheckCircle, 
  XCircle,
  Calendar,
  Clock,
  Link as LinkIcon,
  QrCode
} from 'lucide-react'
import CriarEmpresa from './CriarEmpresa'
import QRCodeModal from './QRCodeModal'
import { useErrorHandler } from '@/components/providers/ErrorHandler'
import { useQRCode } from '@/components/providers/QRCodeProvider'
import { usePaginas } from '@/hooks/usePaginas'

interface GerenciadorPaginasProps {
  autoOpenQR?: boolean
}

export default function GerenciadorPaginas({ autoOpenQR = false }: GerenciadorPaginasProps) {
  const { 
    paginas, 
    loading, 
    excluirPagina, 
    toggleAtiva,
    criarPagina,
    atualizarPagina
  } = usePaginas()
  
  const { showSuccess, showApiError, showInfo } = useErrorHandler()
  const { isOpen, slug, nome, openQRCode, closeQRCode } = useQRCode()
  
  const [mostrarCriar, setMostrarCriar] = useState(false)
  const [paginaEditando, setPaginaEditando] = useState<string | null>(null)
  const [dadosEditando, setDadosEditando] = useState<any>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [mostrarQrCodeInicial, setMostrarQrCodeInicial] = useState(false)
  const [currentHost, setCurrentHost] = useState('rankify.com.br')

  // Mostrar QR Code da primeira página ao carregar (apenas 1 vez por sessão no Dashboard)
  useEffect(() => {
    // Detectar o host atual
    if (typeof window !== 'undefined') {
      setCurrentHost(window.location.host)
    }
  }, [])

  // Mostrar QR Code da primeira página ao carregar (apenas 1 vez por sessão no Dashboard)
  useEffect(() => {
    if (paginas.length === 0) return

    // Verificar se o usuário marcou "Não exibir novamente"
    const neverShow = localStorage.getItem('qrCodeNeverShow')
    if (neverShow) {
      setMostrarQrCodeInicial(true)
      return
    }

    // Se autoOpenQR é true (Minhas Páginas), sempre abrir
    if (autoOpenQR) {
      const primeiraPagina = paginas[0]
      openQRCode(primeiraPagina.slug, primeiraPagina.nome)
      setMostrarQrCodeInicial(true)
      return
    }

    // Se autoOpenQR é false (Dashboard), abrir apenas 1 vez por sessão
    // Usar sessionStorage para rastrear se já foi aberto nesta sessão
    const qrCodeSessionKey = 'qrCodeDashboardOpened'
    const alreadyOpened = sessionStorage.getItem(qrCodeSessionKey)
    
    if (!alreadyOpened) {
      const primeiraPagina = paginas[0]
      openQRCode(primeiraPagina.slug, primeiraPagina.nome)
      sessionStorage.setItem(qrCodeSessionKey, 'true')
    }
    
    setMostrarQrCodeInicial(true)
  }, [paginas, autoOpenQR, openQRCode])

  const copiarLink = (slug: string) => {
    if (typeof window === 'undefined') return
    
    const protocol = window.location.protocol
    const link = `${protocol}//${currentHost}/p/${slug}`
    
    // Verificar se clipboard API está disponível
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(link).then(() => {
        setCopiedId(slug)
        setTimeout(() => setCopiedId(null), 2000)
        showInfo('Link copiado!', 'Link copiado para a área de transferência.')
      }).catch(() => {
        // Fallback para método antigo
        const textarea = document.createElement('textarea')
        textarea.value = link
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        setCopiedId(slug)
        setTimeout(() => setCopiedId(null), 2000)
        showInfo('Link copiado!', 'Link copiado para a área de transferência.')
      })
    } else {
      // Fallback para navegadores sem suporte
      const textarea = document.createElement('textarea')
      textarea.value = link
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopiedId(slug)
      setTimeout(() => setCopiedId(null), 2000)
      showInfo('Link copiado!', 'Link copiado para a área de transferência.')
    }
  }

  const handleCriarPagina = async (dados: any) => {
    const novaPagina = await criarPagina(dados)
    setMostrarCriar(false)
  }

  const handleExcluirPagina = async (id: string, nome: string) => {
    if (confirm(`Tem certeza que deseja excluir a página "${nome}"?`)) {
      try {
        await excluirPagina(id)
        showSuccess('Página excluída!', `A página "${nome}" foi excluída com sucesso.`)
      } catch (error: any) {
        showApiError(error)
      }
    }
  }

  const iniciarEdicao = (pagina: any) => {
    setPaginaEditando(pagina.id)
    setDadosEditando({
      nome: pagina.nome,
      placeId: pagina.placeId,
      instagram: pagina.instagram,
      whatsapp: pagina.whatsapp
    })
  }

  const salvarEdicao = async () => {
    if (!paginaEditando || !dadosEditando) return

    try {
      await atualizarPagina(paginaEditando, dadosEditando)
      setPaginaEditando(null)
      setDadosEditando(null)
      showSuccess('Página atualizada!', 'As alterações foram salvas com sucesso.')
    } catch (error: any) {
      showApiError(error)
    }
  }

  const cancelarEdicao = () => {
    setPaginaEditando(null)
    setDadosEditando(null)
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-lg">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
            <p className="text-sm font-semibold text-slate-400">Carregando páginas...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-dark-text">Minhas Páginas</h2>
          <p className="text-sm text-slate-500 dark:text-dark-muted mt-1">
            {paginas.length} página{paginas.length !== 1 ? 's' : ''} criada{paginas.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setMostrarCriar(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold px-5 py-2.5 rounded-xl hover:from-blue-700 hover:to-cyan-600 transition shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Nova Página
        </button>
      </div>

      {/* Formulário de criação */}
      {mostrarCriar && (
        <div className="rounded-2xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-4 sm:p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-dark-text">Criar Nova Página</h3>
            <button
              onClick={() => setMostrarCriar(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-dark-text"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
          <CriarEmpresa onEmpresaCriada={handleCriarPagina} />
        </div>
      )}

      {/* Lista de páginas */}
      <div className="space-y-3">
        {paginas.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-8 sm:p-10 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-dark-border flex items-center justify-center mb-4">
              <LinkIcon className="w-8 h-8 text-slate-400 dark:text-dark-muted" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-dark-text mb-2">
              Nenhuma página criada
            </h3>
            <p className="text-sm text-slate-500 dark:text-dark-muted max-w-xs mb-5">
              Crie sua primeira página para começar a receber avaliações.
            </p>
            <button
              onClick={() => setMostrarCriar(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold px-5 py-2.5 rounded-xl hover:from-blue-700 hover:to-cyan-600 transition"
            >
              <Plus className="w-4 h-4" />
              Criar primeira página
            </button>
          </div>
        ) : (
          paginas.map((pagina) => (
            <div
              key={pagina.id}
              className={`rounded-2xl border ${pagina.ativa ? 'border-slate-200 dark:border-dark-border' : 'border-red-200 dark:border-red-900'} bg-white dark:bg-dark-card shadow-sm overflow-hidden transition hover:shadow-md`}
            >
              {/* Cabeçalho da página - Responsivo */}
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  {/* Info Principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${pagina.ativa ? 'bg-gradient-to-br from-blue-600 to-cyan-500' : 'bg-gradient-to-br from-red-500 to-rose-500'}`}>
                        <LinkIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-dark-text truncate">
                          {pagina.nome}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-dark-muted truncate">
                          /{pagina.slug}
                        </p>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-dark-border text-slate-600 dark:text-dark-muted">
                        ID: {pagina.id}
                      </span>
                      {pagina.ativa ? (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-200 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                          ✓ Ativa
                        </span>
                      ) : (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-200 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                          ✕ Inativa
                        </span>
                      )}
                    </div>

                    {/* Data */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-dark-muted flex-wrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(pagina.dataCriacao).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(pagina.dataCriacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  {/* Botões de Ação - Responsivo */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <a
                      href={`/p/${pagina.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-blue-200 dark:bg-blue-900/30 flex items-center justify-center hover:bg-blue-300 dark:hover:bg-blue-800/50 transition"
                      title="Ver página"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                    </a>
                    <button
                      onClick={() => {
                        openQRCode(pagina.slug, pagina.nome)
                      }}
                      className="w-8 h-8 rounded-lg bg-purple-200 dark:bg-purple-900/30 flex items-center justify-center hover:bg-purple-300 dark:hover:bg-purple-800/50 transition"
                      title="Ver QR Code"
                    >
                      <QrCode className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
                    </button>
                    <button
                      onClick={() => {
                        setExpandedId(expandedId === pagina.id ? null : pagina.id)
                        iniciarEdicao(pagina)
                      }}
                      className="w-8 h-8 rounded-lg bg-amber-200 dark:bg-yellow-900/30 flex items-center justify-center hover:bg-amber-300 dark:hover:bg-yellow-800/50 transition"
                      title="Editar página"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-amber-700 dark:text-yellow-400" />
                    </button>
                    <button
                      onClick={() => handleExcluirPagina(pagina.id, pagina.nome)}
                      className="w-8 h-8 rounded-lg bg-red-200 dark:bg-red-900/30 flex items-center justify-center hover:bg-red-300 dark:hover:bg-red-800/50 transition"
                      title="Excluir página"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                    </button>
                    <button
                      onClick={() => setExpandedId(expandedId === pagina.id ? null : pagina.id)}
                      className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-dark-border flex items-center justify-center hover:bg-slate-300 dark:hover:bg-dark-hover transition"
                      title="Expandir detalhes"
                    >
                      {expandedId === pagina.id ? (
                        <i className="fa-solid fa-chevron-up text-blue-600 dark:text-dark-muted text-xs" />
                      ) : (
                        <i className="fa-solid fa-chevron-down text-blue-600 dark:text-dark-muted text-xs" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Link da Página */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 bg-slate-50 dark:bg-dark-border rounded-lg px-3 py-1.5 min-w-0">
                    <p className="text-xs text-slate-600 dark:text-dark-muted break-all font-mono">
                      {currentHost}/p/{pagina.slug}
                    </p>
                  </div>
                  <button
                    onClick={() => copiarLink(pagina.slug)}
                    className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-dark-border flex items-center justify-center hover:bg-slate-300 dark:hover:bg-dark-hover transition flex-shrink-0"
                    title="Copiar link"
                  >
                    {copiedId === pagina.slug ? (
                      <CheckCircle className="w-4 h-4 text-green-700 dark:text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-700 dark:text-dark-muted" />
                    )}
                  </button>
                </div>

                {/* Estatísticas - Grid Responsivo */}
                <div className="grid grid-cols-4 gap-1.5 mb-4">
                  <div className="rounded-lg bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-950/20 dark:to-pink-900/20 p-2 text-center border border-pink-300 dark:border-pink-800">
                    <p className="text-sm font-bold text-pink-700 dark:text-pink-400">
                      {pagina.cliquesInstagram}
                    </p>
                    <p className="text-xs text-pink-700 dark:text-pink-400 font-semibold mt-0.5">IG</p>
                  </div>
                  <div className="rounded-lg bg-gradient-to-br from-green-100 to-green-200 dark:from-green-950/20 dark:to-green-900/20 p-2 text-center border border-green-300 dark:border-green-800">
                    <p className="text-sm font-bold text-green-700 dark:text-green-400">
                      {pagina.cliquesWhatsApp}
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-400 font-semibold mt-0.5">WA</p>
                  </div>
                  <div className="rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-950/20 dark:to-blue-900/20 p-2 text-center border border-blue-300 dark:border-blue-800">
                    <p className="text-sm font-bold text-blue-700 dark:text-blue-400">
                      {pagina.cliquesGoogle}
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-400 font-semibold mt-0.5">GG</p>
                  </div>
                  <div className="rounded-lg bg-gradient-to-br from-amber-100 to-amber-200 dark:from-yellow-950/20 dark:to-yellow-900/20 p-2 text-center border border-amber-300 dark:border-yellow-800">
                    <p className="text-sm font-bold text-amber-700 dark:text-yellow-400">
                      {pagina.avaliacoes}
                    </p>
                    <p className="text-xs text-amber-700 dark:text-yellow-400 font-semibold mt-0.5">⭐</p>
                  </div>
                </div>

                {/* Seção Expandida */}
                {expandedId === pagina.id && (
                  <div className="border-t border-slate-200 dark:border-dark-border pt-4">
                    {paginaEditando === pagina.id && dadosEditando ? (
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-dark-text">Editar Página</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-dark-text mb-1">
                              Nome da empresa
                            </label>
                            <input
                              type="text"
                              value={dadosEditando.nome}
                              onChange={(e) => setDadosEditando({...dadosEditando, nome: e.target.value})}
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-slate-900 dark:text-dark-text text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-dark-text mb-1">
                              Place ID
                            </label>
                            <input
                              type="text"
                              value={dadosEditando.placeId}
                              onChange={(e) => setDadosEditando({...dadosEditando, placeId: e.target.value})}
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-slate-900 dark:text-dark-text text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-dark-text mb-1">
                              Instagram
                            </label>
                            <input
                              type="text"
                              value={dadosEditando.instagram}
                              onChange={(e) => setDadosEditando({...dadosEditando, instagram: e.target.value})}
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-slate-900 dark:text-dark-text text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-dark-text mb-1">
                              WhatsApp
                            </label>
                            <input
                              type="text"
                              value={dadosEditando.whatsapp}
                              onChange={(e) => setDadosEditando({...dadosEditando, whatsapp: e.target.value})}
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-slate-900 dark:text-dark-text text-sm"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={salvarEdicao}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-2 rounded-lg text-sm hover:from-blue-700 hover:to-cyan-600 transition"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={cancelarEdicao}
                            className="flex-1 bg-slate-200 dark:bg-dark-border text-slate-700 dark:text-dark-text font-bold py-2 rounded-lg text-sm hover:bg-slate-300 dark:hover:bg-dark-hover transition"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs font-bold text-slate-500 dark:text-dark-muted mb-1">Instagram</p>
                          <p className="text-slate-900 dark:text-dark-text font-semibold break-all">{pagina.instagram || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-500 dark:text-dark-muted mb-1">WhatsApp</p>
                          <p className="text-slate-900 dark:text-dark-text font-semibold break-all">{pagina.whatsapp || '-'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* QR Code Modal */}
      {slug && nome && (
        <QRCodeModal
          isOpen={isOpen}
          slug={slug}
          nome={nome}
          onClose={closeQRCode}
        />
      )}
    </div>
  )
}

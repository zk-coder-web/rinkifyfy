'use client'

import { useState, useRef, useCallback } from 'react'
import { Building2, Instagram, MessageSquare, MapPin, Loader2, Eye, X as XIcon, Users } from 'lucide-react'
import { useErrorHandler } from '@/components/providers/ErrorHandler'
import { getErrorMessage } from '@/lib/api-errors'
import { AVAILABLE_THEMES, ThemeType } from '@/lib/page-generators'
import PagePreview from './PagePreview'
import QRCodeModal from './QRCodeModal'

interface InstagramProfile {
  username: string
  fullName: string
  followers: string
  followersRaw: number | null
  avatarUrl: string | null
  status: 'ok' | 'not_found' | 'rate_limited' | 'unavailable'
  error?: string
}

interface CriarEmpresaProps {
  onEmpresaCriada?: (empresa: {
    nome: string
    placeId: string
    instagram: string
    whatsapp: string
    slug: string
    googleReviewLink: string
    theme: string
  }) => Promise<void>
}

interface EmpresaCriada {
  slug: string
  nome: string
}

export default function CriarEmpresa({ onEmpresaCriada }: CriarEmpresaProps) {
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>('neon-pink')
  const [nome, setNome] = useState('')
  const [placeId, setPlaceId] = useState('')
  const [instagram, setInstagram] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [erroPlaceId, setErroPlaceId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [empresaCriada, setEmpresaCriada] = useState<EmpresaCriada | null>(null)
  const [igProfile, setIgProfile] = useState<InstagramProfile | null>(null)
  const [igLoading, setIgLoading] = useState(false)
  const igLookupRef = useRef<string>('')
  const { showSuccess, showApiError } = useErrorHandler()

  const lookupInstagram = useCallback(async (value: string) => {
    const username = value.trim().replace(/^@/, '')
    if (!username || username === igLookupRef.current) return
    igLookupRef.current = username
    setIgProfile(null)
    setIgLoading(true)
    try {
      const res = await fetch('/api/instagram/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })
      const data = await res.json()
      if (res.ok && data.status === 'ok') {
        setIgProfile(data)
      } else {
        setIgProfile({ ...data, status: data.status || 'unavailable' })
      }
    } catch {
      setIgProfile(null)
    } finally {
      setIgLoading(false)
    }
  }, [])

  const validarPlaceId = (id: string) => {
    return id.length === 27
  }

  const gerarSlug = (nome: string) => {
    return nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const gerarGoogleReviewLink = (placeId: string) => {
    return `https://search.google.com/local/writereview?placeid=${placeId}`
  }

  const handlePlaceIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPlaceId(value)
    if (value.length > 0 && value.length !== 27) {
      setErroPlaceId('Place ID inválida. Deve ter exatamente 27 caracteres.')
    } else {
      setErroPlaceId('')
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!nome.trim()) {
      showApiError({ status: 400, message: 'Por favor, insira o nome da empresa.' })
      return
    }

    if (!validarPlaceId(placeId)) {
      showApiError({ status: 400, message: 'Place ID inválida. Deve ter exatamente 27 caracteres.' })
      return
    }

    if (!instagram.trim() && !whatsapp.trim()) {
      showApiError({ status: 400, message: 'Por favor, insira pelo menos um contato (Instagram ou WhatsApp).' })
      return
    }

    setIsSubmitting(true)

    try {
      const slug = gerarSlug(nome.trim())
      const googleReviewLink = gerarGoogleReviewLink(placeId.trim())

      const empresaData = {
        nome: nome.trim(),
        placeId: placeId.trim(),
        instagram: instagram.trim(),
        whatsapp: whatsapp.trim(),
        slug,
        googleReviewLink,
        theme: selectedTheme,
      }

      if (onEmpresaCriada) {
        await onEmpresaCriada(empresaData)
        
        // Mostrar QR Code da página criada
        setEmpresaCriada({
          slug: slug,
          nome: nome.trim()
        })
      }

      // Resetar formulário
      setNome('')
      setPlaceId('')
      setInstagram('')
      setWhatsapp('')
      setErroPlaceId('')
      setIgProfile(null)
      igLookupRef.current = ''
      setSelectedTheme('neon-pink')
      
      showSuccess('Página criada com sucesso!', 'Sua página já está disponível.')

    } catch (error: any) {
      console.error('Erro ao criar empresa:', error)
      showApiError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Botão Ver Preview */}
      <button
        type="button"
        onClick={() => setShowPreviewModal(true)}
        className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all duration-300 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 shadow-lg shadow-purple-200 dark:shadow-none active:scale-98 flex items-center justify-center gap-2"
      >
        <Eye className="w-5 h-5" />
        Ver Preview da Página
      </button>

      {/* Modal Preview Flutuante - Tela Cheia */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-0">
          {/* Container do Modal */}
          <div className="relative w-full h-full flex flex-col bg-white dark:bg-dark-card">
            {/* Header Fixo */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-dark-text">
                Preview da Página
              </h2>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-dark-border rounded-lg transition-colors"
              >
                <XIcon className="w-6 h-6 text-slate-600 dark:text-dark-muted" />
              </button>
            </div>

            {/* Conteúdo - Scrollável */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-slate-50 dark:bg-dark-bg">
              <div className="w-full max-w-6xl">
                <PagePreview 
                  nome={nome || 'Seu Negócio'}
                  instagram={instagram}
                  whatsapp={whatsapp}
                  theme={selectedTheme}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulário em baixo */}
      <div>
        <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nome da Empresa */}
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-dark-text mb-2">
            Nome da empresa *
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Building2 className="w-5 h-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-slate-900 dark:text-dark-text placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Barbearia do Zak"
              required
            />
          </div>
        </div>

        {/* Place ID */}
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-dark-text mb-2">
            Place ID (Google) *
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <MapPin className="w-5 h-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={placeId}
              onChange={(e) => {
                const value = e.target.value
                setPlaceId(value)
                if (value.length > 0 && value.length !== 27) {
                  setErroPlaceId('Place ID inválida. Deve ter exatamente 27 caracteres.')
                } else {
                  setErroPlaceId('')
                }
              }}
              maxLength={27}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border ${erroPlaceId ? 'border-red-500' : 'border-slate-200 dark:border-dark-border'} bg-white dark:bg-dark-card text-slate-900 dark:text-dark-text placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="Ex: ChIJUzQTkpwDzpQRL5zNfGlQgtw"
              required
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-slate-400">
              {placeId.length}/27
            </div>
          </div>
          {erroPlaceId && (
            <div className="mt-2 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {erroPlaceId}
            </div>
          )}
        </div>

        {/* Instagram */}
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-dark-text mb-2">
            Instagram
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Instagram className="w-5 h-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={instagram}
              onChange={(e) => {
                setInstagram(e.target.value)
                setIgProfile(null)
                igLookupRef.current = ''
              }}
              onBlur={(e) => {
                if (e.target.value.trim()) lookupInstagram(e.target.value)
              }}
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-slate-900 dark:text-dark-text placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: @barbeariazak"
            />
            {igLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              </div>
            )}
          </div>

          {/* Preview do perfil Instagram */}
          {igProfile && igProfile.status === 'ok' && (
            <div className="mt-3 flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-green-950/40 to-emerald-950/40 border border-green-500/40 shadow-[0_0_12px_rgba(34,197,94,0.25)]">
              {igProfile.avatarUrl ? (
                <img
                  src={igProfile.avatarUrl}
                  alt={igProfile.fullName}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-green-400"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">
                    {igProfile.fullName?.[0]?.toUpperCase() ?? '?'}
                  </span>
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-bold text-green-300 truncate">{igProfile.fullName}</p>
                <p className="text-xs text-green-500">@{igProfile.username}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Users className="w-3 h-3 text-green-400" />
                  <span className="text-xs font-semibold text-green-400">
                    {igProfile.followersRaw !== null
                      ? igProfile.followersRaw >= 1_000_000
                        ? `${Math.floor(igProfile.followersRaw / 1_000_000)}M seguidores`
                        : igProfile.followersRaw >= 1_000
                        ? `${Math.floor(igProfile.followersRaw / 1_000)}K seguidores`
                        : `${igProfile.followersRaw.toLocaleString('pt-BR')} seguidores`
                      : `${igProfile.followers} seguidores`}
                  </span>
                </div>
              </div>
            </div>
          )}

          {igProfile && igProfile.status !== 'ok' && (
            <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30">
              <p className="text-xs text-red-600 dark:text-red-400">{igProfile.error}</p>
            </div>
          )}
        </div>

        {/* WhatsApp */}
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-dark-text mb-2">
            WhatsApp
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <MessageSquare className="w-5 h-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-slate-900 dark:text-dark-text placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: 5511999999999"
            />
          </div>
        </div>

        {/* Seletor de Temas - Em Baixo */}
        <div className="pt-6 border-t border-slate-200 dark:border-dark-border">
          <label className="block text-sm font-bold text-slate-700 dark:text-dark-text mb-4">
            Escolha o Tema da Página
          </label>
          <div className="grid grid-cols-3 gap-4">
            {AVAILABLE_THEMES.map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => setSelectedTheme(theme.id as ThemeType)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                  selectedTheme === theme.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 shadow-md'
                    : 'border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card hover:border-blue-300 hover:shadow-sm'
                }`}
              >
                <div className="text-3xl">{theme.icon}</div>
                <div className="text-center">
                  <div className="font-bold text-sm text-slate-900 dark:text-dark-text">
                    {theme.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-dark-muted mt-1">
                    {theme.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Botão Gerar Página */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-xl font-bold text-white text-sm transition-all duration-300 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg shadow-blue-200 dark:shadow-none active:scale-98 disabled:opacity-70"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Gerando página...
            </div>
          ) : (
            'GERAR PÁGINA'
          )}
        </button>
      </form>
      </div>

      {/* Modal QR Code - Mostrado após criar empresa */}
      {empresaCriada && (
        <QRCodeModal
          isOpen={true}
          slug={empresaCriada.slug}
          nome={empresaCriada.nome}
          onClose={() => setEmpresaCriada(null)}
        />
      )}
    </div>
  )
}

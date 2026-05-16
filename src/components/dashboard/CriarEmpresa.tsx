'use client'

import { useState, useRef, useEffect } from 'react'
import { Building2, Instagram, MessageSquare, MapPin, Loader2, Check, X, Eye, X as XIcon } from 'lucide-react'
import { useErrorHandler } from '@/components/providers/ErrorHandler'
import { getErrorMessage } from '@/lib/api-errors'
import { AVAILABLE_THEMES, ThemeType } from '@/lib/page-generators'
import PagePreview from './PagePreview'
import QRCodeModal from './QRCodeModal'

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

interface InstagramVerification {
  nome: string
  seguidores: number
  username: string
}

export default function CriarEmpresa({ onEmpresaCriada }: CriarEmpresaProps) {
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>('neon-pink')
  const [nome, setNome] = useState('')
  const [placeId, setPlaceId] = useState('')
  const [instagram, setInstagram] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [erroPlaceId, setErroPlaceId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [instagramVerification, setInstagramVerification] = useState<InstagramVerification | null>(null)
  const [instagramLoading, setInstagramLoading] = useState(false)
  const [instagramError, setInstagramError] = useState('')
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [empresaCriada, setEmpresaCriada] = useState<EmpresaCriada | null>(null)
  const instagramTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const instagramInputRef = useRef<HTMLInputElement | null>(null)
  const { showSuccess, showApiError } = useErrorHandler()

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

  const verificarInstagram = async (username: string) => {
    if (!username.trim()) {
      setInstagramVerification(null)
      setInstagramError('')
      return
    }

    setInstagramLoading(true)
    setInstagramError('')
    setInstagramVerification(null)

    try {
      const response = await fetch('/api/instagram/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })

      if (!response.ok) {
        setInstagramError('@ do usuário não encontrado.')
        setInstagramVerification(null)
        setInstagramLoading(false)
        return
      }

      const data = await response.json()

      if (data.success && data.data) {
        setInstagramVerification({
          nome: data.data.nome,
          seguidores: data.data.seguidores,
          username: data.data.username,
        })
        setInstagramError('')
      } else {
        setInstagramError('@ do usuário não encontrado.')
        setInstagramVerification(null)
      }
    } catch (error) {
      console.error('Erro ao verificar Instagram:', error)
      setInstagramError('@ do usuário não encontrado.')
      setInstagramVerification(null)
    } finally {
      setInstagramLoading(false)
    }
  }

  const handleInstagramBlur = () => {
    if (instagram.trim() && !instagramVerification && !instagramLoading) {
      verificarInstagram(instagram)
    }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (instagramInputRef.current && !instagramInputRef.current.contains(e.target as Node)) {
        handleInstagramBlur()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [instagram, instagramVerification, instagramLoading])

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
      setInstagramVerification(null)
      setInstagramError('')
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
              ref={instagramInputRef}
              type="text"
              value={instagram}
              onChange={(e) => {
                setInstagram(e.target.value)
                setInstagramVerification(null)
                setInstagramError('')
              }}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-slate-900 dark:text-dark-text placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: @barbeariazak"
            />
            {instagramLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              </div>
            )}
            {instagramVerification && !instagramLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Check className="w-5 h-5 text-green-500" />
              </div>
            )}
            {instagramError && !instagramLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <X className="w-5 h-5 text-red-500" />
              </div>
            )}
          </div>

          {instagramVerification && (
            <div className="mt-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30">
              <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                ✓ Nome: <span className="font-normal">{instagramVerification.nome}</span>
              </p>
            </div>
          )}

          {instagramError && (
            <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30">
              <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                ✗ {instagramError}
              </p>
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

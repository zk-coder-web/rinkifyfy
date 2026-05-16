'use client'

import { useEffect, useState } from 'react'
import PhotoEditor from './PhotoEditor'

interface PublicPageData {
  id: string
  nome: string
  placeId?: string
  instagram?: string
  whatsapp?: string
  slug: string
  googleReviewLink?: string
  cliquesInstagram: number
  cliquesWhatsApp: number
  cliquesGoogle: number
  avaliacoes?: string
  tema?: string
  dataCriacao: string
  criadorNome: string
  fotoUrl?: string
  fotoRotacao?: number
  mostrarFoto?: boolean
}

interface PublicPageViewProps {
  pagina: PublicPageData
}

export default function PublicPageView({ pagina }: PublicPageViewProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPhotoEditor, setShowPhotoEditor] = useState(false)
  const [fotoUrl, setFotoUrl] = useState(pagina.fotoUrl)
  const [fotoRotacao, setFotoRotacao] = useState(pagina.fotoRotacao || 0)
  const [avaliacaoCountdown, setAvaliacaoCountdown] = useState(0)
  const [avaliacaoClicked, setAvaliacaoClicked] = useState(false)

  // Determinar tema baseado no campo tema da página
  const getThemeClass = () => {
    const tema = pagina.tema?.toLowerCase() || 'neon-pink'
    
    if (tema.includes('azul')) {
      return 'theme-azul'
    } else if (tema.includes('preto') || tema.includes('branco')) {
      return 'theme-preto'
    } else {
      return 'theme-rosa'
    }
  }

  // Cor dos corações baseada no tema
  const getHeartColor = () => {
    const theme = getThemeClass()
    switch (theme) {
      case 'theme-preto':
        return '#1a1a1a'
      case 'theme-azul':
        return '#3b82f6'
      default:
        return '#ff1493'
    }
  }

  // Cor dos ícones SVG baseada no tema
  const getIconColor = () => {
    const theme = getThemeClass()
    switch (theme) {
      case 'theme-preto':
        return '#1a1a1a'
      default:
        return '#ffffff'
    }
  }

  // Adicionar classe ao body quando o componente montar
  useEffect(() => {
    const themeClass = getThemeClass()
    document.body.classList.add('public-page', themeClass)
    
    return () => {
      document.body.classList.remove('public-page', 'theme-rosa', 'theme-preto', 'theme-azul')
    }
  }, [pagina.tema])

  // Countdown para avaliação
  useEffect(() => {
    if (avaliacaoCountdown <= 0) return

    const timer = setInterval(() => {
      setAvaliacaoCountdown((prev) => {
        if (prev <= 1) {
          setAvaliacaoClicked(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [avaliacaoCountdown])

  const handleClick = async (tipoClique: 'google' | 'instagram' | 'whatsapp') => {
    try {
      setIsLoading(true)
      await fetch(`/api/public/paginas/${pagina.slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipoClique }),
      })

      // Redirecionar para o link apropriado
      if (tipoClique === 'google' && pagina.googleReviewLink) {
        window.open(pagina.googleReviewLink, '_blank')
      } else if (tipoClique === 'instagram' && pagina.instagram) {
        window.open(`https://instagram.com/${pagina.instagram}`, '_blank')
      } else if (tipoClique === 'whatsapp' && pagina.whatsapp) {
        const message = `Olá! Vim através da página ${pagina.nome}`
        window.open(
          `https://wa.me/${pagina.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`,
          '_blank'
        )
      }
    } catch (error) {
      console.error('Erro ao registrar clique:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePhoto = async (imageData: string, rotation: number) => {
    try {
      // Salvar foto no banco de dados
      const response = await fetch(`/api/paginas/${pagina.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fotoUrl: imageData,
          fotoRotacao: rotation,
          mostrarFoto: true,
        }),
      })

      if (response.ok) {
        setFotoUrl(imageData)
        setFotoRotacao(rotation)
        setShowPhotoEditor(false)
      } else {
        alert('Erro ao salvar foto')
      }
    } catch (error) {
      console.error('Erro ao salvar foto:', error)
      alert('Erro ao salvar foto')
    }
  }

  const handleAvaliacaoClick = async () => {
    if (avaliacaoClicked) return

    try {
      setAvaliacaoClicked(true)
      setAvaliacaoCountdown(30)

      // Aguardar 30 segundos
      await new Promise((resolve) => setTimeout(resolve, 30000))

      // Registrar avaliação
      await fetch(`/api/public/paginas/${pagina.slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipoClique: 'avaliacao' }),
      })

      // Mostrar mensagem de sucesso
      alert('Obrigado pela sua avaliação! ⭐')
    } catch (error) {
      console.error('Erro ao registrar avaliação:', error)
    }
  }

  return (
    <div className="main-container">
      {/* Corações Animados SVG */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="heart-container" style={{ '--tx': `${(i - 3) * 80}px` } as any}>
          <svg viewBox="0 0 24 24" fill={getHeartColor()} stroke={getHeartColor()} strokeWidth="1">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </div>
      ))}

      <div className="content-wrapper">
        {/* Header */}
        <header className="text-center fade-in" style={{ animationDelay: '0.2s' }}>
          {/* Se tem foto e está marcado para mostrar, exibe a foto */}
          {fotoUrl && pagina.mostrarFoto ? (
            <div className="mb-6">
              <div className="flex justify-center mb-4">
                <img
                  src={fotoUrl}
                  alt={pagina.nome}
                  className="rounded-2xl shadow-lg max-w-xs w-full"
                  style={{
                    transform: `rotate(${fotoRotacao}deg)`,
                    transition: 'transform 0.3s ease',
                  }}
                />
              </div>
            </div>
          ) : (
            /* Se não tem foto ou não está marcado, exibe mensagem de agradecimento */
            <div className="mb-6">
              <h2 className="text-2xl font-bold title-header inline">
                Obrigado por comprar conosco {pagina.nome}
              </h2>
            </div>
          )}
        </header>

        {/* Nossas Redes Sociais */}
        <div className="text-center mb-6 fade-in" style={{ animationDelay: '0.3s' }}>
          <h3 className="text-xl font-bold title-header">
            Nossas redes sociais:
          </h3>
        </div>

        {/* Menu de Links */}
        <main className="w-full flex flex-col items-center fade-in mt-8" style={{ animationDelay: '0.4s' }}>
          {/* GOOGLE */}
          {pagina.googleReviewLink && (
            <button
              onClick={() => handleClick('google')}
              disabled={isLoading}
              className="btn-slim btn-slim-google shine-slim"
            >
              <div className="w-12 h-12 icon-box-google rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                {/* Ícone oficial do Google */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              <div className="ml-5 flex-1 text-left">
                <div className="btn-text-main">Avaliar no Google</div>
                <div className="btn-text-sub">Sua opinião é muito importante para nós</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={getIconColor()} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          )}

          {/* INSTAGRAM */}
          {pagina.instagram && (
            <button
              onClick={() => handleClick('instagram')}
              disabled={isLoading}
              className="btn-slim btn-slim-insta shine-slim"
            >
              <div className="w-12 h-12 icon-box-insta rounded-2xl flex items-center justify-center flex-shrink-0">
                {/* Ícone oficial do Instagram */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="white" strokeWidth="2" fill="none"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="white" strokeWidth="2" fill="none"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="ml-5 flex-1 text-left">
                <div className="btn-text-main">Instagram</div>
                <div className="btn-text-sub">Veja nossos trabalhos e inspirações</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={getIconColor()} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          )}

          {/* WHATSAPP */}
          {pagina.whatsapp && (
            <button
              onClick={() => handleClick('whatsapp')}
              disabled={isLoading}
              className="btn-slim btn-slim-whats shine-slim"
            >
              <div className="w-12 h-12 icon-box-whats rounded-2xl flex items-center justify-center flex-shrink-0">
                {/* Ícone oficial do WhatsApp */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="white" strokeWidth="2" fill="none"/>
                  <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" stroke="white" strokeWidth="1.5" fill="white"/>
                </svg>
              </div>
              <div className="ml-5 flex-1 text-left">
                <div className="btn-text-main">Agendar Agora</div>
                <div className="btn-text-sub">Reserve seu horário em segundos</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={getIconColor()} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          )}

          {/* AVALIAÇÃO COM DELAY */}
          <button
            onClick={handleAvaliacaoClick}
            disabled={avaliacaoClicked || isLoading}
            className="btn-slim btn-slim-avaliacao shine-slim"
            style={{
              background: avaliacaoClicked 
                ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              opacity: avaliacaoClicked ? 0.7 : 1,
            }}
          >
            <div className="w-12 h-12 icon-box-avaliacao rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
              {/* Ícone de estrela */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div className="ml-5 flex-1 text-left">
              <div className="btn-text-main">Deixe sua Avaliação</div>
              <div className="btn-text-sub">
                {avaliacaoClicked 
                  ? `Processando... ${avaliacaoCountdown}s`
                  : 'Sua opinião é valiosa para nós'
                }
              </div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={getIconColor()} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </main>
      </div>

      {/* Footer Minimalista - sem faixa rosa */}
      <footer className="footer-fixed">
        <p>
          Desenvolvido por <strong>RANKIFY</strong>
        </p>
      </footer>

      {/* Photo Editor Modal */}
      {showPhotoEditor && (
        <PhotoEditor
          onSave={handleSavePhoto}
          onCancel={() => setShowPhotoEditor(false)}
          initialImage={fotoUrl}
          initialRotation={fotoRotacao}
        />
      )}
    </div>
  )
}

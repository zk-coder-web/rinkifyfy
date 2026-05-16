'use client'

import { ThemeType, AVAILABLE_THEMES } from '@/lib/page-generators'

interface PagePreviewProps {
  nome: string
  instagram?: string
  whatsapp?: string
  theme: ThemeType
}

export default function PagePreview({ nome, instagram, whatsapp, theme }: PagePreviewProps) {
  const getThemeClass = () => {
    const temaNormalizado = theme?.toLowerCase() || 'neon-pink'
    
    if (temaNormalizado.includes('azul')) {
      return 'theme-azul'
    } else if (temaNormalizado.includes('preto') || temaNormalizado.includes('branco')) {
      return 'theme-preto'
    } else {
      return 'theme-rosa'
    }
  }

  const getHeartColor = () => {
    const themeClass = getThemeClass()
    switch (themeClass) {
      case 'theme-preto':
        return '#1a1a1a'
      case 'theme-azul':
        return '#3b82f6'
      default:
        return '#ff1493'
    }
  }

  const themeInfo = AVAILABLE_THEMES.find(t => t.id === theme)

  return (
    <>
      {/* Preview renderizado diretamente - Desktop */}
      <div 
        className={`relative rounded-2xl overflow-hidden ${getThemeClass()} preview-container shadow-2xl`}
        style={{
          width: '100%',
          minHeight: '600px',
          background: theme === 'neon-pink' 
            ? 'linear-gradient(135deg, #ff1493 0%, #ff1493 10%, #ff69b4 30%, #ffb3d9 60%, #ffe6f0 100%)'
            : theme === 'azul-puro'
            ? 'linear-gradient(135deg, #0066ff 0%, #0066ff 10%, #00a8e8 30%, #00d4ff 60%, #a8f0ff 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #ffffff 10%, #f5f5f5 30%, #e8e8e8 60%, #f0f0f0 100%)',
          backgroundSize: '100% 100%',
          backgroundAttachment: 'fixed',
          position: 'relative',
        }}
      >
        {/* Padrão geométrico animado - diferente por tema */}
        {theme === 'neon-pink' && (
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `
                radial-gradient(circle, rgba(255,255,255,.2) 3px, transparent 3px)
              `,
              backgroundSize: '40px 40px',
              backgroundPosition: '0 0',
              animation: 'slideRight 20s linear infinite',
              pointerEvents: 'none',
            }}
          />
        )}

        {theme === 'azul-puro' && (
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `
                linear-gradient(45deg, transparent 48%, rgba(255,255,255,.25) 49%, rgba(255,255,255,.25) 51%, transparent 52%),
                linear-gradient(-45deg, transparent 48%, rgba(255,255,255,.25) 49%, rgba(255,255,255,.25) 51%, transparent 52%)
              `,
              backgroundSize: '50px 50px',
              backgroundPosition: '0 0',
              animation: 'slideRight 25s linear infinite',
              pointerEvents: 'none',
            }}
          />
        )}

        {theme === 'preto-branco' && (
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `
                linear-gradient(0deg, transparent 24%, rgba(0,0,0,.15) 25%, rgba(0,0,0,.15) 26%, transparent 27%, transparent 74%, rgba(0,0,0,.15) 75%, rgba(0,0,0,.15) 76%, transparent 77%, transparent),
                linear-gradient(90deg, transparent 24%, rgba(0,0,0,.15) 25%, rgba(0,0,0,.15) 26%, transparent 27%, transparent 74%, rgba(0,0,0,.15) 75%, rgba(0,0,0,.15) 76%, transparent 77%, transparent)
              `,
              backgroundSize: '45px 45px',
              backgroundPosition: '0 0',
              animation: 'slideRight 22s linear infinite',
              pointerEvents: 'none',
            }}
          />
        )}
      
        {/* Corações flutuando - apenas para pink */}
        {theme === 'neon-pink' && [1, 2, 3, 4, 5].map((i) => (
          <div 
            key={i} 
            className="heart-container absolute"
            style={{
              left: `${10 + i * 18}%`,
              top: '-30px',
              width: '28px',
              height: '28px',
              animation: `fly linear infinite`,
              animationDuration: `${22 + i * 2}s`,
              animationDelay: `${i * 4}s`,
              zIndex: 2,
              pointerEvents: 'none',
            }}
          >
            <svg viewBox="0 0 24 24" fill={getHeartColor()} stroke={getHeartColor()} strokeWidth="1">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </div>
        ))}
        <div 
          className="absolute inset-0"
          style={{
            background: theme === 'neon-pink'
              ? 'radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255, 20, 147, 0.1) 0%, transparent 50%)'
              : theme === 'azul-puro'
              ? 'radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)'
              : 'radial-gradient(circle at 30% 20%, rgba(0, 0, 0, 0.05) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(0, 0, 0, 0.08) 0%, transparent 50%)',
          }}
        />

        {/* Conteúdo */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-8 py-12">
          {/* Avatar com glow */}
          <div className="mb-8 relative">
            <div 
              className="absolute inset-0 rounded-full blur-3xl opacity-60"
              style={{
                background: theme === 'azul-puro' 
                  ? 'linear-gradient(45deg, #1e40af, #3b82f6, #60a5fa, #3b82f6, #1e40af)'
                  : theme === 'preto-branco'
                  ? 'linear-gradient(45deg, #ffffff, #cccccc, #888888, #cccccc, #ffffff)'
                  : 'linear-gradient(45deg, #ff1493, #ff69b4, #ffc0cb, #ff69b4, #ff1493)',
              }}
            />
            <div 
              className="relative w-28 h-28 rounded-full border-4 flex items-center justify-center text-5xl font-black shadow-2xl"
              style={{
                borderColor: theme === 'preto-branco' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                background: theme === 'preto-branco' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)',
                color: theme === 'preto-branco' ? '#1a1a1a' : '#ffffff',
              }}
            >
              {nome.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Título */}
          <h1 
            className="text-4xl font-black text-center mb-2"
            style={{
              color: theme === 'preto-branco' ? '#1a1a1a' : '#ffffff',
              textShadow: theme === 'preto-branco' 
                ? '0 2px 8px rgba(0, 0, 0, 0.1)'
                : '0 4px 12px rgba(0, 0, 0, 0.3)',
            }}
          >
            {nome}
          </h1>

          {/* Subtítulo */}
          <p 
            className="text-sm font-bold uppercase tracking-widest mb-8"
            style={{
              color: theme === 'preto-branco' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.9)',
              textShadow: theme === 'preto-branco' 
                ? '0 1px 3px rgba(0, 0, 0, 0.1)'
                : '0 2px 8px rgba(0, 0, 0, 0.2)',
            }}
          >
            {themeInfo?.name}
          </p>

          {/* Botões */}
          <div className="space-y-3 w-full max-w-md">
            {/* Google */}
            <div 
              className="flex items-center gap-4 px-6 py-4 rounded-3xl border-2 backdrop-blur-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(66, 133, 244, 0.9), rgba(51, 103, 214, 0.9))',
                borderColor: 'rgba(255, 255, 255, 0.4)',
              }}
            >
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 shadow-lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white">Avaliar no Google</div>
                <div className="text-xs text-white opacity-90">Sua opinião é importante</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>

            {/* Instagram */}
            {instagram && (
              <div 
                className="flex items-center gap-4 px-6 py-4 rounded-3xl border-2 backdrop-blur-sm"
                style={{
                  background: 'linear-gradient(135deg, rgba(217, 48, 91, 0.9), rgba(187, 38, 71, 0.9))',
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                }}
              >
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="white" strokeWidth="2" fill="none"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="white" strokeWidth="2" fill="none"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white">Instagram</div>
                  <div className="text-xs text-white opacity-90">Veja nossos trabalhos</div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            )}

            {/* WhatsApp */}
            {whatsapp && (
              <div 
                className="flex items-center gap-4 px-6 py-4 rounded-3xl border-2 backdrop-blur-sm"
                style={{
                  background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.9), rgba(27, 171, 82, 0.9))',
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                }}
              >
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="white" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white">Agendar Agora</div>
                  <div className="text-xs text-white opacity-90">Reserve seu horário</div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Animação dos corações */}
        <style>{`
          @keyframes fly {
            0% {
              transform: translateX(0) translateY(0) rotate(0deg) scale(0.8);
              opacity: 0.7;
            }
            25% {
              opacity: 1;
              transform: translateX(calc(var(--tx, 0px) * 0.3)) translateY(25vh) rotate(90deg) scale(1);
            }
            50% {
              opacity: 0.8;
              transform: translateX(calc(var(--tx, 0px) * 0.7)) translateY(50vh) rotate(180deg) scale(1.1);
            }
            75% {
              opacity: 0.6;
              transform: translateX(var(--tx, 0px)) translateY(75vh) rotate(270deg) scale(0.9);
            }
            100% {
              transform: translateX(var(--tx, 0px)) translateY(100vh) rotate(360deg) scale(0.7);
              opacity: 0;
            }
          }

          @keyframes slideRight {
            0% {
              background-position: 0 0;
            }
            100% {
              background-position: 100px 0;
            }
          }
        `}</style>
      </div>
    </>
  )
}

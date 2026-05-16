interface Theme {
  id: string
  category: string
  colors: {
    primary: string
    secondary: string
    tertiary: string
    background: string
    backgroundSecondary: string
    accent: string
    accentLight: string
  }
  effects: {
    particles: boolean
    glow: boolean
  }
}

interface PageData {
  nome: string
  slug: string
  instagram?: string
  whatsapp?: string
  googleReviewLink?: string
  tema?: string
}

export const THEMES: Record<string, Theme> = {
  'neon-pink': {
    id: 'neon-pink',
    category: 'Rosa Neon',
    colors: {
      primary: '#ff006e',
      secondary: '#8338ec',
      tertiary: '#3a86ff',
      background: '#0a0e27',
      backgroundSecondary: '#1a1f3a',
      accent: '#fb5607',
      accentLight: '#ffbe0b',
    },
    effects: {
      particles: true,
      glow: true,
    },
  },
  'azul-puro': {
    id: 'azul-puro',
    category: 'Azul Rankify',
    colors: {
      primary: '#0066ff',
      secondary: '#00a8e8',
      tertiary: '#00d4ff',
      background: '#0a0f2e',
      backgroundSecondary: '#1a1f4a',
      accent: '#00ff88',
      accentLight: '#00ffcc',
    },
    effects: {
      particles: false,
      glow: false,
    },
  },
  'preto-branco': {
    id: 'preto-branco',
    category: 'Preto & Branco',
    colors: {
      primary: '#ffffff',
      secondary: '#e0e0e0',
      tertiary: '#cccccc',
      background: '#0a0a0a',
      backgroundSecondary: '#1a1a1a',
      accent: '#ffffff',
      accentLight: '#f0f0f0',
    },
    effects: {
      particles: false,
      glow: false,
    },
  },
}

export function getTheme(themeId?: string): Theme {
  return THEMES[themeId || 'neon-pink'] || THEMES['neon-pink']
}

export function generatePageHTML(pagina: PageData, themeId?: string): string {
  const theme = getTheme(themeId)
  
  const instagramUrl = pagina.instagram ? `https://instagram.com/${pagina.instagram}` : '#'
  const whatsappUrl = pagina.whatsapp
    ? `https://wa.me/${pagina.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá! Vim através da página ${pagina.nome}`)}`
    : '#'

  const particlesCSS = theme.effects.particles ? `
    .bg-particles {
      position: fixed;
      inset: 0;
      background-image: 
        radial-gradient(2px 2px at 20% 30%, ${theme.colors.accent}40, transparent),
        radial-gradient(2px 2px at 60% 70%, ${theme.colors.accentLight}40, transparent),
        radial-gradient(1px 1px at 50% 50%, ${theme.colors.primary}40, transparent),
        radial-gradient(1px 1px at 80% 10%, ${theme.colors.secondary}40, transparent);
      background-size: 200px 200px, 250px 250px, 150px 150px, 180px 180px;
      background-position: 0 0, 40px 60px, 130px 270px, 70px 100px;
      animation: particlesFloat 20s linear infinite;
      z-index: 2;
    }

    @keyframes particlesFloat {
      0% { transform: translate(0, 0); }
      100% { transform: translate(50px, 50px); }
    }

    .floating-elements {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 4;
    }

    .float-element {
      position: absolute;
      border-radius: 50%;
      filter: blur(40px);
      opacity: 0.15;
    }

    .float-1 {
      width: 200px;
      height: 200px;
      background: var(--primary);
      top: 10%;
      left: 10%;
      animation: float 8s ease-in-out infinite;
    }

    .float-2 {
      width: 150px;
      height: 150px;
      background: var(--secondary);
      top: 60%;
      right: 15%;
      animation: float 10s ease-in-out infinite reverse;
    }

    .float-3 {
      width: 120px;
      height: 120px;
      background: var(--tertiary);
      bottom: 20%;
      left: 50%;
      animation: float 12s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(30px, -30px) scale(1.1); }
    }
  ` : ''

  const glowCSS = theme.effects.glow ? `
    .avatar-glow {
      position: absolute;
      inset: -12px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      filter: blur(24px);
      opacity: 0.5;
      animation: pulse 3s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.5; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.1); }
    }
  ` : ''

  return `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${pagina.nome} | Premium Experience</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :root {
      --primary: ${theme.colors.primary};
      --secondary: ${theme.colors.secondary};
      --tertiary: ${theme.colors.tertiary};
      --bg: ${theme.colors.background};
      --bg-secondary: ${theme.colors.backgroundSecondary};
      --accent: ${theme.colors.accent};
      --accent-light: ${theme.colors.accentLight};
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg);
      color: #ffffff;
      min-height: 100vh;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .bg-base {
      position: fixed;
      inset: 0;
      background: var(--bg);
      z-index: 0;
    }

    .bg-gradient {
      position: fixed;
      inset: 0;
      background: linear-gradient(135deg, 
        ${theme.id === 'neon-pink' ? '#ff1493' : theme.id === 'azul-puro' ? '#0066ff' : theme.colors.primary}30 0%, 
        ${theme.id === 'neon-pink' ? '#ff1493' : theme.id === 'azul-puro' ? '#0066ff' : theme.colors.primary}30 10%,
        ${theme.id === 'neon-pink' ? '#ff69b4' : theme.id === 'azul-puro' ? '#00a8e8' : theme.colors.secondary}20 30%, 
        ${theme.id === 'neon-pink' ? '#ffb3d9' : theme.id === 'azul-puro' ? '#00d4ff' : theme.colors.tertiary}30 60%,
        ${theme.id === 'neon-pink' ? '#ffe6f0' : theme.id === 'azul-puro' ? '#a8f0ff' : theme.colors.tertiary}30 100%);
      background-size: 100% 100%;
      animation: none;
      z-index: 1;
      position: relative;
    }

    .bg-gradient::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: 
        repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,.08) 20px, rgba(255,255,255,.08) 21px),
        repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,.06) 20px, rgba(255,255,255,.06) 21px);
      pointer-events: none;
      z-index: 1;
    }

    .bg-mesh {
      position: fixed;
      inset: 0;
      background: 
        radial-gradient(at 20% 30%, ${theme.id === 'neon-pink' ? 'rgba(217, 70, 239, 0.15)' : theme.colors.primary + '15'} 0px, transparent 50%),
        radial-gradient(at 80% 70%, ${theme.id === 'neon-pink' ? 'rgba(236, 72, 153, 0.15)' : theme.colors.secondary + '15'} 0px, transparent 50%),
        radial-gradient(at 50% 50%, ${theme.id === 'neon-pink' ? 'rgba(244, 114, 182, 0.1)' : theme.colors.tertiary + '10'} 0px, transparent 50%);
      z-index: 2;
    }

    ${particlesCSS}

    .bg-noise {
      position: fixed;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
      opacity: 0.5;
      pointer-events: none;
      z-index: 3;
    }

    .container {
      position: relative;
      z-index: 5;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1.5rem 6rem;
    }

    .header-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 3rem;
      animation: fadeInUp 0.8s ease-out;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .avatar-container {
      position: relative;
      width: 120px;
      height: 120px;
      margin-bottom: 1.5rem;
    }

    .avatar-ring {
      position: absolute;
      inset: -6px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      opacity: 0.3;
      animation: rotate 10s linear infinite;
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    ${glowCSS}

    .avatar {
      position: relative;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: var(--bg-secondary);
      border: 4px solid ${theme.colors.primary}60;
      overflow: hidden;
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
    }

    .avatar-inner {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, ${theme.colors.primary}80, ${theme.colors.secondary}80);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      font-weight: 800;
      color: #ffffff;
    }

    .title-group {
      text-align: center;
    }

    .title {
      font-size: 2.25rem;
      font-weight: 900;
      color: #ffffff;
      margin-bottom: 0.5rem;
      letter-spacing: -0.03em;
      text-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
    }

    .category {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--accent-light);
      text-transform: uppercase;
      letter-spacing: 0.15em;
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      width: 100%;
      max-width: 420px;
      margin-bottom: 3rem;
      animation: fadeInUp 0.8s ease-out 0.2s both;
    }

    .btn {
      position: relative;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.25rem 1.75rem;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      text-decoration: none;
      color: #ffffff;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      cursor: pointer;
    }

    .btn::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, var(--primary)20, var(--secondary)20);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .btn:hover {
      transform: translateY(-4px);
      border-color: rgba(255, 255, 255, 0.3);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
    }

    .btn:hover::before {
      opacity: 1;
    }

    .btn:active {
      transform: translateY(-2px);
    }

    .btn-google {
      background: linear-gradient(135deg, #4285f4, #34a853) !important;
    }

    .btn-instagram {
      background: linear-gradient(135deg, #e1306c, #c13584) !important;
    }

    .btn-whatsapp {
      background: linear-gradient(135deg, #25d366, #128c7e) !important;
    }

    .btn-icon {
      position: relative;
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: transform 0.3s ease;
    }

    .btn:hover .btn-icon {
      transform: scale(1.1) rotate(5deg);
    }

    .btn-content {
      flex: 1;
      position: relative;
    }

    .btn-title {
      font-size: 1.125rem;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 0.25rem;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .btn-description {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.8);
      font-weight: 500;
    }

    .btn-shine {
      position: absolute;
      top: 0;
      left: -100%;
      width: 30%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
      transform: skewX(-20deg);
      animation: shine 8s infinite;
    }

    @keyframes shine {
      0% { left: -100%; }
      20% { left: 150%; }
      100% { left: 150%; }
    }

    .stats {
      display: flex;
      align-items: center;
      gap: 2rem;
      padding: 1.5rem 2rem;
      background: rgba(255, 255, 255, 0.06);
      backdrop-filter: blur(16px);
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      animation: fadeInUp 0.8s ease-out 0.4s both;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.375rem;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 900;
      color: var(--accent-light);
      text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
    }

    .stat-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.6);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .stat-divider {
      width: 1px;
      height: 48px;
      background: rgba(255, 255, 255, 0.15);
    }

    .footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(16px);
      text-align: center;
      z-index: 10;
      border-top: 1px solid rgba(0, 0, 0, 0.05);
    }

    .footer-text {
      font-size: 0.75rem;
      font-weight: 800;
      color: #1a1a1a;
      letter-spacing: 0.12em;
    }

    @media (max-width: 640px) {
      .container {
        padding: 2rem 1rem 6rem;
      }

      .avatar-container {
        width: 100px;
        height: 100px;
      }

      .avatar {
        width: 100px;
        height: 100px;
      }

      .title {
        font-size: 1.875rem;
      }

      .actions {
        max-width: 100%;
      }

      .btn {
        padding: 1rem 1.25rem;
        gap: 1rem;
      }

      .btn-icon {
        width: 44px;
        height: 44px;
      }

      .btn-title {
        font-size: 1rem;
      }

      .stats {
        gap: 1.25rem;
        padding: 1.25rem 1.5rem;
      }

      .stat-value {
        font-size: 1.25rem;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  </style>
</head>
<body>
  <div class="bg-base"></div>
  <div class="bg-gradient"></div>
  <div class="bg-mesh"></div>
  ${theme.effects.particles ? '<div class="bg-particles"></div>' : ''}
  <div class="bg-noise"></div>

  ${theme.effects.particles ? '<div class="floating-elements"><div class="float-element float-1"></div><div class="float-element float-2"></div><div class="float-element float-3"></div></div>' : ''}

  <div class="container">
    <header class="header-section">
      <div class="avatar-container">
        <div class="avatar-ring"></div>
        ${theme.effects.glow ? '<div class="avatar-glow"></div>' : ''}
        <div class="avatar">
          <div class="avatar-inner">${pagina.nome.charAt(0).toUpperCase()}</div>
        </div>
      </div>
      
      <div class="title-group">
        <h1 class="title">${pagina.nome}</h1>
        <p class="category">${theme.category}</p>
      </div>
    </header>

    <div class="actions">
      ${pagina.googleReviewLink ? `<a href="${pagina.googleReviewLink}" target="_blank" onclick="registrarClique('google')" class="btn btn-google"><div class="btn-icon"><svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg></div><div class="btn-content"><div class="btn-title">Avaliar no Google</div><div class="btn-description">Compartilhe sua experiência</div></div><div class="btn-shine"></div></a>` : ''}
      ${pagina.instagram ? `<a href="https://instagram.com/${pagina.instagram}" target="_blank" onclick="registrarClique('instagram')" class="btn btn-instagram"><div class="btn-icon"><svg width="24" height="24" fill="white" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/></svg></div><div class="btn-content"><div class="btn-title">Instagram</div><div class="btn-description">Siga para novidades</div></div><div class="btn-shine"></div></a>` : ''}
      ${pagina.whatsapp ? `<a href="https://wa.me/${pagina.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá! Vim através da página ${pagina.nome}`)}" target="_blank" onclick="registrarClique('whatsapp')" class="btn btn-whatsapp"><div class="btn-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg></div><div class="btn-content"><div class="btn-title">WhatsApp</div><div class="btn-description">Entre em contato</div></div><div class="btn-shine"></div></a>` : ''}
    </div>

    <div class="stats">
      <div class="stat-item">
        <div class="stat-value">2.5K</div>
        <div class="stat-label">Visitas</div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <div class="stat-value">98%</div>
        <div class="stat-label">Satisfação</div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <div class="stat-value">4.9</div>
        <div class="stat-label">Avaliação</div>
      </div>
    </div>
  </div>

  <footer class="footer">
    <p class="footer-text">RANKIFY</p>
  </footer>

  <script>
    function registrarClique(tipo) {
      fetch('/api/public/paginas/${pagina.slug}', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipoClique: tipo })
      }).catch(err => console.error('Erro ao registrar clique:', err))
    }
  </script>
</body>
</html>`
}

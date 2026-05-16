import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const html = `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Barbearia Zak | Premium Experience</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet">
  <style>
    /* Fundo Animado Rosa Neon */
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #ffffff;
      overflow: hidden;
      -webkit-tap-highlight-color: transparent;
    }

    @keyframes gradientBG {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    body::before {
      content: "";
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background-image: url('https://grainy-gradients.vercel.app/noise.svg');
      opacity: 0.05;
      pointer-events: none;
      z-index: 1;
    }

    /* Corações Animados Voadores SVG */
    .heart-container {
      position: fixed;
      pointer-events: none;
      z-index: 0;
      top: -30px;
      width: 24px;
      height: 24px;
      animation: fly linear infinite;
    }

    @keyframes fly {
      0% {
        transform: translateX(0) translateY(0) rotate(0deg);
        opacity: 0.5;
      }
      50% {
        opacity: 0.4;
      }
      100% {
        transform: translateX(var(--tx)) translateY(100vh) rotate(360deg);
        opacity: 0;
      }
    }

    .heart-container:nth-child(1) { left: 15%; animation-duration: 25s; animation-delay: 0s; --tx: 40px; }
    .heart-container:nth-child(2) { left: 35%; animation-duration: 28s; animation-delay: 5s; --tx: -50px; }
    .heart-container:nth-child(3) { left: 55%; animation-duration: 30s; animation-delay: 10s; --tx: 60px; }
    .heart-container:nth-child(4) { left: 75%; animation-duration: 26s; animation-delay: 8s; --tx: -45px; }
    .heart-container:nth-child(5) { left: 25%; animation-duration: 32s; animation-delay: 15s; --tx: 50px; }

    /* Shine suave nos botões */
    .shine-slim {
      position: relative;
      overflow: hidden;
    }

    .shine-slim::before {
      content: "";
      position: absolute;
      top: 0; left: -150%; width: 40%; height: 100%;
      background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.15), transparent);
      transform: skewX(-20deg);
      animation: shine 6s infinite;
    }

    @keyframes shine {
      0% { left: -150%; }
      20% { left: 150%; }
      100% { left: 150%; }
    }

    /* Botão Slim Reestilizado */
    .btn-slim {
      display: flex;
      align-items: center;
      padding: 12px 18px;
      border-radius: 22px;
      text-decoration: none;
      transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(10px);
      width: 100%;
      max-width: 320px;
      margin: 0 auto;
      z-index: 2;
      cursor: pointer;
    }

    .btn-slim:hover {
      border-color: rgba(255, 255, 255, 0.4);
      transform: translateY(-2px);
      background: rgba(255, 255, 255, 0.12);
    }

    .btn-slim:active { transform: scale(0.96); }

    /* Cores dos Ícones e Botões */
    .btn-slim-google {
      background: rgba(66, 133, 244, 0.85) !important;
      border: 1px solid rgba(255, 255, 255, 0.3) !important;
    }

    .btn-slim-google:hover {
      border-color: rgba(255, 255, 255, 0.5) !important;
      background: rgba(51, 103, 214, 0.95) !important;
    }

    .btn-slim-insta {
      background: rgba(217, 48, 91, 0.85) !important;
      border: 1px solid rgba(255, 255, 255, 0.3) !important;
    }

    .btn-slim-insta:hover {
      border-color: rgba(255, 255, 255, 0.5) !important;
      background: rgba(187, 38, 71, 0.95) !important;
    }

    .btn-slim-whats {
      background: rgba(37, 211, 102, 0.85) !important;
      border: 1px solid rgba(255, 255, 255, 0.3) !important;
    }

    .btn-slim-whats:hover {
      border-color: rgba(255, 255, 255, 0.5) !important;
      background: rgba(27, 171, 82, 0.95) !important;
    }

    .btn-slim span, .btn-slim p {
      color: #ffffff !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }

    .icon-box-google { background: #ffffff; }
    .icon-box-google svg { transform: translateX(3px); }
    .icon-box-insta { background: transparent; }
    .icon-box-whats { background: transparent; }

    .fade-in {
      animation: fadeIn 1s ease-out forwards;
      opacity: 0;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .title-header {
      color: #000000;
      font-family: 'Playfair Display', serif;
      font-weight: 700;
      letter-spacing: -1px;
    }

    .footer-fixed {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(255, 255, 255, 0.95);
      text-align: center;
      padding: 8px 12px;
      z-index: 10;
      font-size: 10px;
    }

    .footer-fixed p {
      margin: 0;
      display: inline;
      color: #666666;
    }
  </style>
</head>
<body class="min-h-screen flex flex-col items-center justify-center p-6">
  <!-- Corações Animados SVG -->
  <div class="heart-container">
    <svg viewBox="0 0 24 24" fill="none" stroke="#ff1493" stroke-width="1.5">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  </div>
  <div class="heart-container">
    <svg viewBox="0 0 24 24" fill="none" stroke="#ff1493" stroke-width="1.5">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  </div>
  <div class="heart-container">
    <svg viewBox="0 0 24 24" fill="none" stroke="#ff1493" stroke-width="1.5">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  </div>
  <div class="heart-container">
    <svg viewBox="0 0 24 24" fill="none" stroke="#ff1493" stroke-width="1.5">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  </div>
  <div class="heart-container">
    <svg viewBox="0 0 24 24" fill="none" stroke="#ff1493" stroke-width="1.5">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  </div>

  <!-- Header -->
  <header class="text-center mb-10 fade-in" style="animation-delay: 0.2s; z-index: 2;">
    <div class="relative w-24 h-24 mx-auto mb-5">
      <!-- Glow branco sutil atrás da foto -->
      <div class="absolute inset-0 bg-white rounded-full blur-2xl opacity-10 animate-pulse"></div>
      <img src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=200&h=200&auto=format&fit=crop" alt="Barbearia Zak" class="relative w-24 h-24 rounded-full border border-white/20 object-cover shadow-2xl">
    </div>
    <h1 class="text-2xl tracking-tight mb-1 title-header">Barbearia Zak</h1>
    <p class="text-slate-400 text-xs font-medium uppercase tracking-[0.2em]">Corte & Estilo Premium</p>
  </header>

  <!-- Menu de Links -->
  <main class="w-full flex flex-col gap-4 items-center fade-in" style="animation-delay: 0.4s; z-index: 2;">
    <!-- GOOGLE -->
    <a href="https://g.page/barbearia-zak" target="_blank" class="btn-slim btn-slim-google shine-slim">
      <div class="w-10 h-10 icon-box-google rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
          <path fill="#1a73e8" d="M14.45.78A8.09,8.09,0,0,0,5.8,3.29L9.63,6.51Z" transform="translate(-3.91 -0.4)"></path>
          <path fill="#ea4335" d="M5.8,3.29a8.07,8.07,0,0,0-1.89,5.2,9.06,9.06,0,0,0,.8,3.86L9.63,6.51Z" transform="translate(-3.91 -0.4)"></path>
          <path fill="#4285f4" d="M12,5.4a3.09,3.09,0,0,1,3.1,3.09,3.06,3.06,0,0,1-.74,2l4.82-5.73a8.12,8.12,0,0,0-4.73-4L9.63,6.51A3.07,3.07,0,0,1,12,5.4Z" transform="translate(-3.91 -0.4)"></path>
          <path fill="#fbbc04" d="M12,11.59a3.1,3.1,0,0,1-3.1-3.1,3.07,3.07,0,0,1,.73-2L4.71,12.35A28.67,28.67,0,0,0,8.38,17.6l6-7.11A3.07,3.07,0,0,1,12,11.59Z" transform="translate(-3.91 -0.4)"></path>
          <path fill="#34a853" d="M14.25,19.54c2.7-4.22,5.84-6.14,5.84-11a8.1,8.1,0,0,0-.91-3.73L8.38,17.6c.46.6.92,1.24,1.37,1.94C11.4,22.08,10.94,23.6,12,23.6S12.6,22.08,14.25,19.54Z" transform="translate(-3.91 -0.4)"></path>
        </svg>
      </div>
      <div class="ml-4 flex-1">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-white tracking-wide">Avaliar no Google</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
        <p class="text-[10px] text-slate-400 font-medium mt-0.5">Sua satisfação é nossa prioridade.</p>
      </div>
    </a>

    <!-- INSTAGRAM -->
    <a href="https://instagram.com/barbearia_zak" target="_blank" class="btn-slim btn-slim-insta shine-slim">
      <div class="w-10 h-10 icon-box-insta rounded-xl flex items-center justify-center flex-shrink-0">
        <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      </div>
      <div class="ml-4 flex-1">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-white tracking-wide">Instagram</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
        <p class="text-[10px] text-slate-400 font-medium mt-0.5">Confira nossas últimas tendências.</p>
      </div>
    </a>

    <!-- WHATSAPP -->
    <a href="https://wa.me/5511999999999?text=Olá! Vim através da página Barbearia Zak" target="_blank" class="btn-slim btn-slim-whats shine-slim">
      <div class="w-10 h-10 icon-box-whats rounded-xl flex items-center justify-center flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" aria-label="WhatsApp" role="img" viewBox="0 0 512 512" fill="#000000" width="22" height="22">
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
          <g id="SVGRepo_iconCarrier">
            <rect width="512" height="512" rx="15%" fill="#25d366"></rect>
            <path fill="#25d366" stroke="#ffffff" stroke-width="26" d="M123 393l14-65a138 138 0 1150 47z"></path>
            <path fill="#ffffff" d="M308 273c-3-2-6-3-9 1l-12 16c-3 2-5 3-9 1-15-8-36-17-54-47-1-4 1-6 3-8l9-14c2-2 1-4 0-6l-12-29c-3-8-6-7-9-7h-8c-2 0-6 1-10 5-22 22-13 53 3 73 3 4 23 40 66 59 32 14 39 12 48 10 11-1 22-10 27-19 1-3 6-16 2-18"></path>
          </g>
        </svg>
      </div>
      <div class="ml-4 flex-1">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-white tracking-wide">Agendar agora</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
        <p class="text-[10px] text-slate-400 font-medium mt-0.5">Garanta seu horário em segundos.</p>
      </div>
    </a>
  </main>

  <!-- Footer Minimalista -->
  <footer class="footer-fixed">
    <p><strong>Desenvolvido por</strong> RANKIFY</p>
  </footer>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}

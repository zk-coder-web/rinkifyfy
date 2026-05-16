'use client'

import { useState } from 'react'

const flowSteps = [
  {
    number: '01',
    title: 'Ative o Rankify',
    text: 'Assine e destrave um sistema feito para aumentar reputação e visibilidade no Google.',
    icon: 'card',
  },
  {
    number: '02',
    title: 'Cadastre sua empresa em minutos',
    text: 'Adicione dados essenciais e conecte o Place ID do Google corretamente.',
    icon: 'form',
  },
  {
    number: '03',
    title: 'Página única criada automaticamente',
    text: 'O Rankify gera uma página profissional pronta para direcionar clientes.',
    icon: 'page',
  },
  {
    number: '04',
    title: 'QR Code pronto para divulgar',
    text: 'Baixe seu QR Code em PNG ou PDF e use no balcão, mesas e embalagens.',
    icon: 'qr',
  },
  {
    number: '05',
    title: 'Avaliação em menos de 1 minuto',
    text: 'O cliente escaneia e cai direto na tela de avaliação do Google, pronta para enviar.',
    icon: 'star',
  },
  {
    number: '06',
    title: 'Mais avaliações = mais destaque',
    text: 'Cada avaliação aumenta sua relevância no Google Maps e melhora sua posição.',
    icon: 'trend',
  },
  {
    number: '07',
    title: 'Mais visibilidade gera mais clientes',
    text: 'Com mais confiança, mais pessoas encontram sua empresa e entram em contato.',
    icon: 'pin',
  },
  {
    number: '08',
    title: 'Painel com resultados em tempo real',
    text: 'Acompanhe acessos, cliques e desempenho dos últimos 7 dias com métricas claras.',
    icon: 'chart',
  },
  {
    number: '09',
    title: 'O ciclo que faz sua empresa crescer',
    text: 'Cliente avalia -> Google recomenda mais -> sua empresa aparece mais -> mais clientes chegam.',
    icon: 'cycle',
  },
]

const introCards = [
  { title: 'Ativação rápida', text: 'Do plano ao painel liberado em poucos minutos.', icon: 'card' },
  { title: 'Caminho direto', text: 'Página e QR Code conectam o cliente ao Google.', icon: 'qr' },
  { title: 'Métricas claras', text: 'Acompanhe o crescimento com dados simples.', icon: 'chart' },
]

function FlowIcon({ type }: { type: string }) {
  const shared = 'stroke-current'

  if (type === 'card') {
    return (
      <svg viewBox="0 0 48 48" className="h-6 w-6" fill="none" aria-hidden="true">
        <rect x="7" y="12" width="34" height="24" rx="6" className={shared} strokeWidth="2.8" />
        <path d="M7 20h34M15 29h10" className={shared} strokeWidth="2.8" strokeLinecap="round" />
      </svg>
    )
  }

  if (type === 'form') {
    return (
      <svg viewBox="0 0 48 48" className="h-6 w-6" fill="none" aria-hidden="true">
        <rect x="11" y="8" width="26" height="32" rx="6" className={shared} strokeWidth="2.8" />
        <path d="M18 18h12M18 25h12M18 32h7" className={shared} strokeWidth="2.8" strokeLinecap="round" />
      </svg>
    )
  }

  if (type === 'page') {
    return (
      <svg viewBox="0 0 48 48" className="h-6 w-6" fill="none" aria-hidden="true">
        <rect x="8" y="10" width="32" height="28" rx="7" className={shared} strokeWidth="2.8" />
        <path d="M8 18h32M16 27h16M16 32h10" className={shared} strokeWidth="2.8" strokeLinecap="round" />
      </svg>
    )
  }

  if (type === 'qr') {
    return (
      <svg viewBox="0 0 48 48" className="h-6 w-6" fill="none" aria-hidden="true">
        <path d="M10 10h10v10H10zM28 10h10v10H28zM10 28h10v10H10z" className={shared} strokeWidth="2.8" strokeLinejoin="round" />
        <path d="M29 29h4v4h5M28 38h4M38 28v4" className={shared} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (type === 'star') {
    return (
      <svg viewBox="0 0 48 48" className="h-6 w-6" fill="none" aria-hidden="true">
        <path d="m24 7 5.1 10.4 11.4 1.7-8.2 8 1.9 11.3L24 33l-10.2 5.4 1.9-11.3-8.2-8 11.4-1.7L24 7z" className={shared} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (type === 'trend') {
    return (
      <svg viewBox="0 0 48 48" className="h-6 w-6" fill="none" aria-hidden="true">
        <path d="M10 34h28M14 30l8-8 7 6 9-13" className={shared} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M31 15h7v7" className={shared} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (type === 'pin') {
    return (
      <svg viewBox="0 0 48 48" className="h-6 w-6" fill="none" aria-hidden="true">
        <path d="M24 42s13-11.2 13-23A13 13 0 1 0 11 19c0 11.8 13 23 13 23z" className={shared} strokeWidth="2.8" strokeLinejoin="round" />
        <circle cx="24" cy="19" r="4.5" className={shared} strokeWidth="2.8" />
      </svg>
    )
  }

  if (type === 'cycle') {
    return (
      <svg viewBox="0 0 48 48" className="h-6 w-6" fill="none" aria-hidden="true">
        <path d="M36 16a14 14 0 0 0-23.5 4M12 12v8h8M12 32a14 14 0 0 0 23.5-4M36 36v-8h-8" className={shared} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 48 48" className="h-6 w-6" fill="none" aria-hidden="true">
      <rect x="8" y="10" width="32" height="28" rx="7" className={shared} strokeWidth="2.8" />
      <path d="M16 31V23M24 31V17M32 31v-6" className={shared} strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  )
}

export function RankifyFlow() {
  const [open, setOpen] = useState(false)

  return (
    <section className="bg-white px-4 py-12 dark:bg-dark-bg md:px-6 md:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="rankify-practice-card">
          {!open ? (
            <>
              <div className="max-w-2xl">
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">
                  Demonstração interativa
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-5xl">
                  Fluxo da Rankify na Prática.
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-dark-muted md:text-base">
                  Veja como a Rankify transforma atendimento, QR Code, avaliações e dados em um processo simples para aumentar reputação e trazer mais clientes pelo Google.
                </p>
              </div>

              <div className="mt-7 grid gap-3 md:grid-cols-3">
                {introCards.map((card) => (
                  <div key={card.title} className="rankify-practice-mini">
                    <div className="rankify-practice-icon">
                      <FlowIcon type={card.icon} />
                    </div>
                    <div>
                      <h3>{card.title}</h3>
                      <p>{card.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setOpen(true)}
                className="mt-8 inline-flex items-center justify-center gap-3 rounded-2xl bg-slate-950 px-7 py-4 text-sm font-extrabold text-white shadow-2xl shadow-blue-200 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-blue-300 dark:bg-blue-600 dark:shadow-none dark:hover:bg-blue-500"
              >
                Ver Fluxo Rankify
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                  <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          ) : (
            <div className="rankify-simple-flow">
              <div className="text-center">
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">
                  Fluxo Rankify
                </p>
                <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">
                  Funcionamento do Fluxo na prática:
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-dark-muted md:text-base">
                  Os cards aparecem em sequência para mostrar o caminho completo que leva o cliente satisfeito até a avaliação no Google.
                </p>
              </div>

              <div className="mt-8 space-y-3">
                {flowSteps.map((step, index) => (
                  <article
                    key={step.number}
                    className="rankify-simple-step"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="rankify-simple-number">{step.number}</div>
                    <div className="rankify-simple-icon">
                      <FlowIcon type={step.icon} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3>{step.title}</h3>
                      <p>{step.text}</p>
                    </div>
                  </article>
                ))}
              </div>

              <div className="rankify-simple-explain">
                Se sua empresa atende 10 a 30 clientes por dia, é possível gerar novas avaliações diariamente. Em poucos dias, sua reputação cresce e sua empresa começa a aparecer como uma das melhores opções no Google. Avaliar leva menos de 1 minuto, mas pode trazer semanas de vendas e crescimento.
              </div>

              <div className="rankify-simple-final">
                Rankify não é só um QR Code. É um sistema que transforma reputação em crescimento.
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

'use client'

import { Instagram, MessageCircle, Star, Sparkles, ArrowRight, X } from 'lucide-react'

interface PreviewPaginaPublicaProps {
  nome: string
  instagram: string
  whatsapp: string
  onClose: () => void
}

export default function PreviewPaginaPublica({
  nome,
  instagram,
  whatsapp,
  onClose
}: PreviewPaginaPublicaProps) {
  const instagramLink = instagram.startsWith('@') 
    ? `https://instagram.com/${instagram.substring(1)}`
    : `https://instagram.com/${instagram}`

  const whatsappLink = whatsapp.startsWith('+')
    ? `https://wa.me/${whatsapp.substring(1)}`
    : `https://wa.me/${whatsapp}`

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-dark-card border-b border-slate-200 dark:border-dark-border p-4 flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 dark:text-dark-text">Preview da Página</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-border flex items-center justify-center transition"
          >
            <X className="w-5 h-5 text-slate-600 dark:text-dark-muted" />
          </button>
        </div>

        {/* Preview Content */}
        <div className="p-6 bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:from-dark-card dark:via-dark-card dark:to-dark-card">
          {/* Background animado */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-b-2xl">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-300 to-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob"></div>
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-indigo-300 to-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-blob animation-delay-2000"></div>
          </div>

          {/* Conteúdo */}
          <div className="relative z-10">
            {/* Header Premium */}
            <div className="text-center mb-8">
              {/* Ícone decorativo */}
              <div className="inline-flex items-center justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur-2xl opacity-30"></div>
                  <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow-2xl">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              {/* Título */}
              <h1 className="text-2xl font-black text-slate-900 dark:text-dark-text mb-2 line-clamp-2">
                {nome || 'Nome da Empresa'}
              </h1>

              {/* Subtítulo */}
              <p className="text-sm text-slate-600 dark:text-dark-muted font-medium">
                Escolha uma opção para entrar em contato ou avaliar nossa empresa
              </p>
            </div>

            {/* Cards de botões */}
            <div className="space-y-3">
              {/* Botão Instagram */}
              {instagram && (
                <div className="group block relative overflow-hidden rounded-2xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600"></div>
                  <div className="relative px-4 py-4 flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                        <Instagram className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-base font-black text-white">Instagram</h3>
                      <p className="text-xs text-white/90">@{instagram.replace('@', '')}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Botão Google Reviews */}
              <div className="group block relative overflow-hidden rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700"></div>
                <div className="relative px-4 py-4 flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <Star className="w-6 h-6 text-white fill-white" />
                    </div>
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-base font-black text-white">Avaliar no Google</h3>
                    <p className="text-xs text-white/90">Deixe sua avaliação</p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Botão WhatsApp */}
              {whatsapp && (
                <div className="group block relative overflow-hidden rounded-2xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600"></div>
                  <div className="relative px-4 py-4 flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-white fill-white" />
                      </div>
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-base font-black text-white">WhatsApp</h3>
                      <p className="text-xs text-white/90">Fale conosco agora</p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Rodapé */}
            <div className="mt-8 pt-6 border-t border-slate-200/40 text-center">
              <p className="text-xs text-slate-600 dark:text-dark-muted font-medium">
                Página criada com ❤️ por{' '}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-black">
                  Rankify
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  )
}

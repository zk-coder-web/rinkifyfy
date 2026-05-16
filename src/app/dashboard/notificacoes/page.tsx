'use client'

import { useNotificacoes } from '@/hooks/useNotificacoes'
import { AppShell } from '@/components/app/AppShell'
import { Bell, CheckCircle, Trash2, Calendar, Clock } from 'lucide-react'

export default function NotificacoesPage() {
  const { 
    notificacoes, 
    loading, 
    marcarComoLida, 
    marcarTodasComoLidas, 
    limparNotificacoes 
  } = useNotificacoes()

  const formatarData = (dataISO: string) => {
    const data = new Date(dataISO)
    return data.toLocaleDateString('pt-BR')
  }

  const formatarHora = (dataISO: string) => {
    const data = new Date(dataISO)
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatarTempo = (dataISO: string) => {
    const data = new Date(dataISO)
    const agora = new Date()
    const diffMs = agora.getTime() - data.getTime()
    const diffMin = Math.floor(diffMs / (1000 * 60))
    
    if (diffMin < 1) return 'Agora mesmo'
    if (diffMin < 60) return `há ${diffMin} min`
    if (diffMin < 1440) return `há ${Math.floor(diffMin / 60)} h`
    return `há ${Math.floor(diffMin / 1440)} d`
  }

  const getTipoIcone = (tipo: string) => {
    switch (tipo) {
      case 'pagina_criada':
        return '🆕'
      case 'pagina_atualizada':
        return '✏️'
      case 'pagina_excluida':
        return '🗑️'
      case 'clique':
        return '👆'
      case 'avaliacao':
        return '⭐'
      case 'sistema':
        return '⚙️'
      default:
        return '📢'
    }
  }

  const getTipoCor = (tipo: string) => {
    switch (tipo) {
      case 'pagina_criada':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
      case 'pagina_atualizada':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
      case 'pagina_excluida':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
      case 'clique':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
      case 'avaliacao':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
      case 'sistema':
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400'
      default:
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400'
    }
  }

  const excluirNotificacao = async (id: string) => {
    // Nota: A API atual não suporta exclusão individual
    // Podemos marcar como lida como alternativa
    await marcarComoLida(id)
  }

  const limparTodas = async () => {
    if (confirm('Tem certeza que deseja limpar todas as notificações?')) {
      await limparNotificacoes()
    }
  }

  if (loading) {
    return (
      <AppShell title="Notificações">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
              <p className="text-sm font-semibold text-slate-400">Carregando notificações...</p>
            </div>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Notificações">
      <div className="max-w-3xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-900 dark:text-dark-text">Notificações</h1>
          <p className="text-sm text-slate-500 dark:text-dark-muted">
            {notificacoes.length} notificação{notificacoes.length !== 1 ? 'es' : ''}
          </p>
        </div>

        {/* Botões de ação - Mobile otimizado */}
        {notificacoes.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button
              onClick={marcarTodasComoLidas}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition"
            >
              <CheckCircle className="w-4 h-4" />
              Marcar todas como lidas
            </button>
            <button
              onClick={limparTodas}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-200 dark:bg-dark-border text-slate-700 dark:text-dark-text text-sm font-bold hover:bg-slate-300 dark:hover:bg-dark-hover transition"
            >
              <Trash2 className="w-4 h-4" />
              Limpar todas
            </button>
          </div>
        )}

        {/* Lista de notificações */}
        <div className="space-y-3">
          {notificacoes.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-10 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-dark-border flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-slate-400 dark:text-dark-muted" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-dark-text mb-2">
                Nenhuma notificação
              </h3>
              <p className="text-sm text-slate-500 dark:text-dark-muted max-w-xs">
                Quando algo acontecer no sistema, você será notificado aqui.
              </p>
            </div>
          ) : (
            notificacoes.map((notif) => (
              <div
                key={notif.id}
                className={`rounded-2xl border ${notif.lida ? 'border-slate-200 dark:border-dark-border' : 'border-blue-200 dark:border-blue-800'} bg-white dark:bg-dark-card p-4 shadow-sm`}
              >
                <div className="flex items-start gap-3">
                  {/* Ícone do tipo */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${getTipoCor(notif.tipo)}`}>
                    {getTipoIcone(notif.tipo)}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-dark-text">
                          {notif.mensagem}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-dark-muted">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatarData(notif.data)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatarHora(notif.data)}
                          </div>
                          <span>•</span>
                          <span>{formatarTempo(notif.data)}</span>
                        </div>
                      </div>
                      {!notif.lida && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                          Nova
                        </span>
                      )}
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-2 mt-3">
                      {!notif.lida && (
                        <button
                          onClick={() => marcarComoLida(notif.id)}
                          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Marcar como lida
                        </button>
                      )}
                      <button
                        onClick={() => excluirNotificacao(notif.id)}
                        className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  )
}
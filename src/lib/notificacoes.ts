export function inicializarNotificacoes() {
  if (typeof window === 'undefined') return

  try {
    const notificacoes = localStorage.getItem('notificacoes')
    if (!notificacoes) {
      const notifInicial = [
        {
          id: 'welcome',
          tipo: 'sistema',
          mensagem: 'Bem-vindo ao Rankify! Comece criando sua primeira página.',
          data: new Date().toISOString(),
          lida: false
        }
      ]
      localStorage.setItem('notificacoes', JSON.stringify(notifInicial))
    }
  } catch (error) {
    console.error('Erro ao inicializar notificações:', error)
  }
}

export function adicionarNotificacao(tipo: string, mensagem: string) {
  if (typeof window === 'undefined') return

  try {
    const notificacoes = JSON.parse(localStorage.getItem('notificacoes') || '[]')
    const novaNotif = {
      id: Date.now().toString(),
      tipo,
      mensagem,
      data: new Date().toISOString(),
      lida: false
    }
    
    notificacoes.unshift(novaNotif)
    localStorage.setItem('notificacoes', JSON.stringify(notificacoes))
  } catch (error) {
    console.error('Erro ao adicionar notificação:', error)
  }
}
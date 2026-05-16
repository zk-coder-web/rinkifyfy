'use client'

import { useState, useEffect } from 'react'
import { notificacaoService } from '@/services/api'

export interface Notificacao {
  id: string
  tipo: string
  mensagem: string
  data: string
  lida: boolean
}

export function useNotificacoes() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [naoLidas, setNaoLidas] = useState(0)
  const [loading, setLoading] = useState(true)

  const carregarNotificacoes = async () => {
    try {
      const notifsApi = await notificacaoService.listar()
      
      // Converter IDs para string para compatibilidade
      const notifsConvertidas = notifsApi.map(notif => ({
        ...notif,
        id: notif.id.toString(),
        lida: Boolean(notif.lida)
      }))
      
      console.log('[useNotificacoes] Notificações carregadas:', notifsConvertidas)
      setNotificacoes(notifsConvertidas)
      setLoading(false)
    } catch (error) {
      console.error('[useNotificacoes] Erro ao carregar notificações:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarNotificacoes()
    
    // Timeout de segurança: se não carregar em 10 segundos, para o loading
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 10000)
    
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    setNaoLidas(notificacoes.filter(n => !n.lida).length)
  }, [notificacoes])

  const marcarComoLida = async (id: string) => {
    try {
      await notificacaoService.marcarComoLida(id)
      await carregarNotificacoes() // Recarregar para sincronização
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)
    }
  }

  const marcarTodasComoLidas = async () => {
    try {
      await notificacaoService.marcarTodasComoLidas()
      await carregarNotificacoes() // Recarregar para sincronização
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error)
    }
  }

  const limparNotificacoes = async () => {
    try {
      await notificacaoService.limparTodas()
      await carregarNotificacoes() // Recarregar para sincronização
    } catch (error) {
      console.error('Erro ao limpar notificações:', error)
    }
  }

  return {
    notificacoes,
    naoLidas,
    loading,
    marcarComoLida,
    marcarTodasComoLidas,
    limparNotificacoes,
    recarregar: carregarNotificacoes
  }
}
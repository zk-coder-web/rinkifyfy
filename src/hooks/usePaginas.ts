'use client'

import { useState, useEffect } from 'react'
import { Pagina, PaginaCriacao } from '@/types/pagina'
import { paginaService } from '@/services/api'

export function usePaginas() {
  const [paginas, setPaginas] = useState<Pagina[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregarPaginas = async () => {
    try {
      setError(null)
      const paginasApi = await paginaService.listar()
      
      // Converter IDs para string para compatibilidade
      const paginasConvertidas = paginasApi.map(pagina => ({
        ...pagina,
        id: pagina.id.toString(),
        ativa: Boolean(pagina.ativa)
      }))
      
      console.log('[usePaginas] Páginas carregadas:', paginasConvertidas)
      setPaginas(paginasConvertidas)
      setLoading(false)
    } catch (error: any) {
      console.error('[usePaginas] Erro ao carregar páginas:', error)
      setError(error.message || 'Erro ao carregar páginas')
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarPaginas()
    
    // Timeout de segurança: se não carregar em 10 segundos, para o loading
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 10000)
    
    return () => clearTimeout(timeout)
  }, [])

  // Função para recarregar manualmente
  const recarregar = async () => {
    await carregarPaginas()
  }

  const criarPagina = async (dados: PaginaCriacao) => {
    try {
      setError(null)
      const novaPagina = await paginaService.criar(dados)
      
      // Atualizar lista local
      await carregarPaginas()
      
      return {
        ...novaPagina,
        id: novaPagina.id.toString(),
        ativa: Boolean(novaPagina.ativa)
      }
    } catch (error: any) {
      console.error('Erro ao criar página:', error)
      setError(error.message || 'Erro ao criar página')
      throw error
    }
  }

  const atualizarPagina = async (id: string, dados: Partial<PaginaCriacao>) => {
    try {
      setError(null)
      const paginaAtualizada = await paginaService.atualizar(id, dados)
      
      // Atualizar lista local
      await carregarPaginas()
      
      return {
        ...paginaAtualizada,
        id: paginaAtualizada.id.toString(),
        ativa: Boolean(paginaAtualizada.ativa)
      }
    } catch (error: any) {
      console.error('Erro ao atualizar página:', error)
      setError(error.message || 'Erro ao atualizar página')
      throw error
    }
  }

  const excluirPagina = async (id: string) => {
    try {
      setError(null)
      await paginaService.excluir(id)
      
      // Atualizar lista local
      await carregarPaginas()
    } catch (error: any) {
      console.error('Erro ao excluir página:', error)
      setError(error.message || 'Erro ao excluir página')
      throw error
    }
  }

  const toggleAtiva = async (id: string) => {
    try {
      setError(null)
      const pagina = paginas.find(p => p.id === id)
      if (!pagina) return

      const novaAtiva = !pagina.ativa
      await paginaService.toggleAtiva(id, novaAtiva)
      
      // Atualizar lista local
      await carregarPaginas()
    } catch (error: any) {
      console.error('Erro ao alterar status da página:', error)
      setError(error.message || 'Erro ao alterar status da página')
      throw error
    }
  }

  const registrarClique = async (id: string, tipo: 'instagram' | 'whatsapp' | 'google') => {
    try {
      await paginaService.registrarClique(id, tipo)
      
      // Atualizar contador local imediatamente para feedback visual
      setPaginas(prev => prev.map(pagina => {
        if (pagina.id === id) {
          return {
            ...pagina,
            cliquesInstagram: tipo === 'instagram' ? pagina.cliquesInstagram + 1 : pagina.cliquesInstagram,
            cliquesWhatsApp: tipo === 'whatsapp' ? pagina.cliquesWhatsApp + 1 : pagina.cliquesWhatsApp,
            cliquesGoogle: tipo === 'google' ? pagina.cliquesGoogle + 1 : pagina.cliquesGoogle
          }
        }
        return pagina
      }))
    } catch (error) {
      console.error('Erro ao registrar clique:', error)
    }
  }

  return {
    paginas,
    loading,
    error,
    criarPagina,
    atualizarPagina,
    excluirPagina,
    registrarClique,
    toggleAtiva,
    recarregar: carregarPaginas
  }
}
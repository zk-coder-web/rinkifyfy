import { Pagina, PaginaCriacao } from '@/types/pagina'
import { parseErrorResponse, isAuthError } from '@/lib/api-errors'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

/**
 * Wrapper para fetch com tratamento de erros padronizado
 */
async function apiFetch<T>(
  url: string, 
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const apiError = await parseErrorResponse(response)
      
      // Se for erro de autenticação, dispara evento global
      if (isAuthError(apiError)) {
        window.dispatchEvent(new CustomEvent('auth-error', { 
          detail: apiError 
        }))
      }
      
      throw apiError
    }

    const data = await response.json()
    return data
  } catch (error) {
    // Re-throw se já for um ApiError
    if (error && typeof error === 'object' && 'status' in error) {
      throw error
    }
    
    // Erro de rede ou outro erro
    throw {
      status: 0,
      message: error instanceof TypeError && error.message === 'Failed to fetch'
        ? 'Erro de conexão. Verifique sua internet.'
        : 'Erro desconhecido. Tente novamente.',
    }
  }
}

// Serviço para páginas
export const paginaService = {
  // Listar todas as páginas do usuário
  async listar(): Promise<Pagina[]> {
    const data = await apiFetch<{ paginas: Pagina[] }>(`${API_BASE}/api/paginas`, {
      cache: 'no-store'
    })
    return data.paginas || []
  },

  // Criar nova página
  async criar(dados: PaginaCriacao): Promise<Pagina> {
    const data = await apiFetch<{ pagina: Pagina; message?: string }>(`${API_BASE}/api/paginas`, {
      method: 'POST',
      body: JSON.stringify(dados)
    })
    return data.pagina
  },

  // Atualizar página
  async atualizar(id: string, dados: Partial<PaginaCriacao>): Promise<Pagina> {
    const data = await apiFetch<{ pagina: Pagina }>(`${API_BASE}/api/paginas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados)
    })
    return data.pagina
  },

  // Excluir página
  async excluir(id: string): Promise<void> {
    await apiFetch(`${API_BASE}/api/paginas/${id}`, {
      method: 'DELETE'
    })
  },

  // Alternar status ativa/inativa
  async toggleAtiva(id: string, ativa: boolean): Promise<Pagina> {
    const data = await apiFetch<{ pagina: Pagina }>(`${API_BASE}/api/paginas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ ativa })
    })
    return data.pagina
  },

  // Registrar clique
  async registrarClique(id: string, tipo: 'instagram' | 'whatsapp' | 'google'): Promise<void> {
    try {
      await apiFetch(`${API_BASE}/api/paginas/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ tipoClique: tipo })
      })
    } catch {
      // Ignora erros de registro de clique (não crítico)
      console.warn('Erro ao registrar clique')
    }
  }
}

// Serviço para páginas públicas
export const paginaPublicaService = {
  // Buscar página pública por slug
  async buscarPorSlug(slug: string): Promise<Pagina | null> {
    try {
      const data = await apiFetch<{ pagina: Pagina }>(`${API_BASE}/api/public/paginas/${slug}`, {
        cache: 'no-store'
      })
      return data.pagina
    } catch {
      return null
    }
  },

  // Registrar clique em página pública
  async registrarClique(slug: string, tipo: 'instagram' | 'whatsapp' | 'google'): Promise<void> {
    try {
      await apiFetch(`${API_BASE}/api/public/paginas/${slug}`, {
        method: 'POST',
        body: JSON.stringify({ tipoClique: tipo })
      })
    } catch {
      console.warn('Erro ao registrar clique público')
    }
  }
}

// Serviço para notificações
export const notificacaoService = {
  // Listar notificações
  async listar(): Promise<any[]> {
    const data = await apiFetch<{ notificacoes: any[] }>(`${API_BASE}/api/notificacoes`, {
      cache: 'no-store'
    })
    return data.notificacoes || []
  },

  // Marcar como lida
  async marcarComoLida(id: string): Promise<void> {
    await apiFetch(`${API_BASE}/api/notificacoes`, {
      method: 'POST',
      body: JSON.stringify({ id })
    })
  },

  // Marcar todas como lidas
  async marcarTodasComoLidas(): Promise<void> {
    await apiFetch(`${API_BASE}/api/notificacoes`, {
      method: 'POST',
      body: JSON.stringify({ marcarTodas: true })
    })
  },

  // Limpar todas
  async limparTodas(): Promise<void> {
    await apiFetch(`${API_BASE}/api/notificacoes`, {
      method: 'DELETE'
    })
  }
}
/**
 * Utilitários para tratamento de erros da API
 */

export interface ApiError {
  status: number
  message: string
  details?: string
  code?: string
}

// Mapeamento de códigos de status HTTP para mensagens amigáveis
const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: 'Requisição inválida. Verifique os dados enviados.',
  401: 'Sessão expirada. Faça login novamente.',
  403: 'Acesso negado. Você não tem permissão para esta ação.',
  404: 'Recurso não encontrado.',
  409: 'Conflito. Este registro já existe.',
  422: 'Dados inválidos. Verifique os campos preenchidos.',
  429: 'Muitas requisições. Aguarde alguns segundos.',
  500: 'Erro interno do servidor. Tente novamente.',
  502: 'Servidor indisponível. Tente novamente em instantes.',
  503: 'Serviço em manutenção. Tente novamente mais tarde.',
  504: 'Tempo de espera esgotado. Verifique sua conexão.',
}

// Mapeamento de códigos de erro personalizados
const ERROR_CODES: Record<string, string> = {
  // Autenticação
  'AUTH_INVALID_CREDENTIALS': 'E-mail ou senha incorretos.',
  'AUTH_SESSION_EXPIRED': 'Sua sessão expirou. Faça login novamente.',
  'AUTH_TOKEN_INVALID': 'Token de sessão inválido.',
  'AUTH_NOT_VERIFIED': 'E-mail não verificado. Verifique sua caixa de entrada.',
  'AUTH_ACCOUNT_LOCKED': 'Conta bloqueada por muitas tentativas. Tente novamente em 15 minutos.',
  'AUTH_GOOGLE_ERROR': 'Erro ao autenticar com Google.',
  
  // Usuário
  'USER_NOT_FOUND': 'Usuário não encontrado.',
  'USER_EMAIL_EXISTS': 'Este e-mail já está cadastrado.',
  'USER_PASSWORD_WEAK': 'Senha muito fraca. Use pelo menos 8 caracteres.',
  
  // Páginas
  'PAGE_NOT_FOUND': 'Página não encontrada.',
  'PAGE_SLUG_EXISTS': 'Já existe uma página com este nome.',
  'PAGE_LIMIT_REACHED': 'Limite de páginas atingido.',
  'PAGE_PLACE_ID_INVALID': 'Place ID inválido. Deve ter exatamente 27 caracteres.',
  
  // Geral
  'VALIDATION_ERROR': 'Dados inválidos. Verifique os campos.',
  'DATABASE_ERROR': 'Erro ao salvar dados. Tente novamente.',
  'NETWORK_ERROR': 'Erro de conexão. Verifique sua internet.',
  'UNKNOWN_ERROR': 'Erro desconhecido. Tente novamente.',
}

/**
 * Converte um erro da API em uma mensagem amigável
 */
export function getErrorMessage(error: unknown): string {
  // Erro de rede (fetch failed)
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return 'Erro de conexão. Verifique sua internet e tente novamente.'
  }
  
  // Erro de rede genérico
  if (error instanceof TypeError) {
    return 'Erro de conexão. Verifique sua internet.'
  }
  
  // Erro personalizado da API
  if (isApiError(error)) {
    // Primeiro tenta usar o código de erro personalizado
    if (error.code && ERROR_CODES[error.code]) {
      return ERROR_CODES[error.code]
    }
    
    // Depois tenta usar a mensagem do erro
    if (error.message) {
      return error.message
    }
    
    // Por fim, usa a mensagem padrão do status HTTP
    return HTTP_ERROR_MESSAGES[error.status] || `Erro ${error.status}`
  }
  
  // Erro com status HTTP
  if (hasStatus(error)) {
    return HTTP_ERROR_MESSAGES[error.status] || `Erro ${error.status}`
  }
  
  // Erro genérico com mensagem
  if (error instanceof Error && error.message) {
    // Traduz mensagens comuns
    if (error.message.includes('Failed to fetch')) {
      return 'Erro de conexão. Verifique sua internet.'
    }
    if (error.message.includes('NetworkError')) {
      return 'Erro de rede. Verifique sua conexão.'
    }
    if (error.message.includes('timeout')) {
      return 'Tempo de espera esgotado. Tente novamente.'
    }
    return error.message
  }
  
  return 'Erro desconhecido. Tente novamente.'
}

/**
 * Verifica se o erro tem status HTTP
 */
function hasStatus(error: unknown): error is { status: number } {
  return typeof error === 'object' && error !== null && 'status' in error
}

/**
 * Verifica se é um erro da API
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'message' in error
  )
}

/**
 * Extrai informações de erro de uma resposta HTTP
 */
export async function parseErrorResponse(response: Response): Promise<ApiError> {
  const status = response.status
  
  try {
    const data = await response.json()
    
    return {
      status,
      message: data.error || data.message || HTTP_ERROR_MESSAGES[status] || `Erro ${status}`,
      details: data.details,
      code: data.code,
    }
  } catch {
    return {
      status,
      message: HTTP_ERROR_MESSAGES[status] || `Erro ${status}`,
    }
  }
}

/**
 * Formata erro para log
 */
export function formatErrorForLog(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}\n${error.stack || ''}`
  }
  return String(error)
}

/**
 * Verifica se o erro indica que o usuário precisa fazer login
 */
export function isAuthError(error: unknown): boolean {
  if (isApiError(error)) {
    return error.status === 401 || error.code?.startsWith('AUTH_') || false
  }
  if (hasStatus(error)) {
    return error.status === 401
  }
  return false
}

/**
 * Verifica se o erro é de rede
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return error.message.includes('fetch') || error.message.includes('network')
  }
  return false
}

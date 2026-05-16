'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CreatePublicPageFormProps {
  userId: string
  onSuccess?: () => void
}

export default function CreatePublicPageForm({ userId, onSuccess }: CreatePublicPageFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    slug: '',
    instagram: '',
    whatsapp: '',
    googleReviewLink: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Auto-gerar slug a partir do nome
    if (name === 'nome') {
      const autoSlug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setFormData((prev) => ({
        ...prev,
        slug: autoSlug,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validar campos obrigatórios
      if (!formData.nome || !formData.slug) {
        throw new Error('Nome e slug são obrigatórios')
      }

      // Validar pelo menos um contato
      if (!formData.instagram && !formData.whatsapp && !formData.googleReviewLink) {
        throw new Error('Adicione pelo menos um contato (Instagram, WhatsApp ou Google Reviews)')
      }

      // Chamar API para criar página
      const response = await fetch('/api/paginas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao criar página')
      }

      const data = await response.json()
      
      // Redirecionar para a página pública
      router.push(`/p/${formData.slug}`)
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <div>
        <label htmlFor="nome" className="block text-sm font-medium mb-1">
          Nome da Empresa *
        </label>
        <input
          type="text"
          id="nome"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          placeholder="Ex: Barbearia Zak"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium mb-1">
          URL da Página *
        </label>
        <div className="flex items-center">
          <span className="text-sm text-gray-500">rankify.com.br/p/</span>
          <input
            type="text"
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            placeholder="barbearia-zak"
            required
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="instagram" className="block text-sm font-medium mb-1">
          Instagram (sem @)
        </label>
        <input
          type="text"
          id="instagram"
          name="instagram"
          value={formData.instagram}
          onChange={handleChange}
          placeholder="Ex: barbearia_zak"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="whatsapp" className="block text-sm font-medium mb-1">
          WhatsApp
        </label>
        <input
          type="tel"
          id="whatsapp"
          name="whatsapp"
          value={formData.whatsapp}
          onChange={handleChange}
          placeholder="Ex: +5511999999999"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="googleReviewLink" className="block text-sm font-medium mb-1">
          Link Google Reviews
        </label>
        <input
          type="url"
          id="googleReviewLink"
          name="googleReviewLink"
          value={formData.googleReviewLink}
          onChange={handleChange}
          placeholder="Ex: https://g.page/..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
      >
        {isLoading ? 'Criando...' : 'Criar Página Pública'}
      </button>
    </form>
  )
}

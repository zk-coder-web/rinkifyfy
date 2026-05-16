import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rankify - Página Pública',
  description: 'Acesse os links oficiais da empresa',
}

export default function PublicPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
}
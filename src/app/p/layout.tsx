import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rankify - Página Pública',
  description: 'Página pública de empresa no Rankify',
}

export default function PublicLayout({
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

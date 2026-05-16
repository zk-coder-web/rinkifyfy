import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from 'next-themes'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { PageTransition } from '@/components/providers/PageTransition'
import { DynamicReveal } from '@/components/providers/DynamicReveal'
import { ErrorHandlerProvider } from '@/components/providers/ErrorHandler'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'
import { ServiceWorkerRegistration } from '@/components/pwa/ServiceWorkerRegistration'
import { SplashWrapper } from '@/components/pwa/SplashWrapper'
import './globals.css'
import '@/styles/public-page.css'

export const metadata: Metadata = {
  title: 'Rankify | Autoridade no Google',
  description: 'Centralize suas avaliações, redes sociais e contatos em uma página ultraveloz.',
  applicationName: 'Rankify',
  manifest: '/manifest.json',
  appleWebApp: { 
    capable: true, 
    statusBarStyle: 'black-translucent', 
    title: 'Rankify',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Rankify',
    title: 'Rankify | Autoridade no Google',
    description: 'Centralize suas avaliações, redes sociais e contatos em uma página ultraveloz.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rankify | Autoridade no Google',
    description: 'Centralize suas avaliações, redes sociais e contatos em uma página ultraveloz.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2563eb' },
    { media: '(prefers-color-scheme: dark)', color: '#0d1117' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* PWA meta tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Rankify" />
        
        {/* iOS splash screens */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.svg" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-192x192.svg" />
        
        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="/icons/icon.svg" />
        <link rel="icon" type="image/svg+xml" sizes="32x32" href="/icons/icon-96x96.svg" />
        <link rel="icon" type="image/svg+xml" sizes="16x16" href="/icons/icon-72x72.svg" />
        
        {/* Tailwind CSS for public pages */}
        <script src="https://cdn.tailwindcss.com"></script>
        
        {/* Google Fonts for public pages */}
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ErrorHandlerProvider>
            <AuthProvider>
              <SplashWrapper />
              <PageTransition>
                <DynamicReveal>{children}</DynamicReveal>
              </PageTransition>
            </AuthProvider>
            {/* PWA Install Prompt - aparece para todos os usuários */}
            <InstallPrompt />
            <ServiceWorkerRegistration />
          </ErrorHandlerProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

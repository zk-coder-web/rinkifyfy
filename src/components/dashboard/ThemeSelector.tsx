'use client'

import { AVAILABLE_THEMES, ThemeType } from '@/lib/page-generators'

interface ThemeSelectorProps {
  selectedTheme: ThemeType
  onThemeChange: (theme: ThemeType) => void
}

export default function ThemeSelector({ selectedTheme, onThemeChange }: ThemeSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-black text-slate-900 dark:text-dark-text">
        Escolha o Tema da Página
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {AVAILABLE_THEMES.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onThemeChange(theme.id as ThemeType)}
            className={`p-4 rounded-xl border-2 transition-all duration-300 ${
              selectedTheme === theme.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : 'border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card hover:border-blue-300'
            }`}
          >
            <div className="text-3xl mb-2">{theme.icon}</div>
            <h4 className="font-bold text-slate-900 dark:text-dark-text mb-1">
              {theme.name}
            </h4>
            <p className="text-sm text-slate-600 dark:text-dark-muted">
              {theme.description}
            </p>
            {selectedTheme === theme.id && (
              <div className="mt-3 flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Selecionado
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

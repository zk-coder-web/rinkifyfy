import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['Plus Jakarta Sans', 'sans-serif'] },
      colors: {
        dark: {
          bg:     '#0d1117',
          card:   '#161b22',
          border: '#21262d',
          text:   '#e6edf3',
          muted:  '#8b949e',
          subtle: '#6e7681',
        },
      },
    },
  },
  plugins: [],
}

export default config

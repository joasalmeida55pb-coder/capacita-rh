import type { Config } from 'tailwindcss'

/* Tailwind CSS v3 — o `content` cobre src/ E a raiz, para que
   nenhuma página fique de fora do scan (causa nº1 de página sem estilo). */
const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config

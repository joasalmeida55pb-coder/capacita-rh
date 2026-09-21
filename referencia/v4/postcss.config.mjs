/* Tailwind v4 — o plugin mudou de nome.
   npm install -D @tailwindcss/postcss
   Manter "tailwindcss" aqui em v4 = zero CSS gerado. */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

export default config

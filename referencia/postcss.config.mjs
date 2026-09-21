/* Tailwind v4 — o plugin do PostCSS mudou de nome.
   Deixar "tailwindcss" aqui em v4 gera ZERO CSS, sem erro visível.

   Tenha APENAS UM postcss.config no projeto. Se existirem
   postcss.config.js e postcss.config.mjs ao mesmo tempo, apague o que não usa. */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

export default config

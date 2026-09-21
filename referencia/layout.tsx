/* REFERÊNCIA — não substitua o seu às cegas.
   Se o seu layout já tem fontes, providers ou metadata, acrescente apenas
   a primeira linha ao topo do seu ficheiro. */
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Capacita RH',
  description: 'Qualificação e recolocação profissional — Balneário Camboriú',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 antialiased">{children}</body>
    </html>
  )
}

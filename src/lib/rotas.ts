/* ============================================================================
 * Rota pública da vaga — FONTE ÚNICA DA VERDADE
 * ----------------------------------------------------------------------------
 * A listagem pública, o painel da empresa e a página de detalhe importam daqui.
 * Mudar a rota é mudar esta constante, e mais nada.
 *
 * A pasta real é src/app/vagas/[id]/page.tsx.
 * src/app/vaga/[id]/page.tsx existe só para redirecionar o singular.
 * ==========================================================================*/

export const ROTA_VAGA = '/vagas'

/** Caminho relativo: use em <Link href={...}>. */
export function linkVaga(id: string): string {
  return `${ROTA_VAGA}/${id}`
}

/** URL absoluta: use em partilhas (WhatsApp, e-mail, copiar link). */
export function urlVaga(id: string): string {
  const origem = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origem}${linkVaga(id)}`
}

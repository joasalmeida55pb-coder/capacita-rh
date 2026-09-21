/* ============================================================================
 * src/app/vaga/[id]/page.tsx — só redireciona.
 * ----------------------------------------------------------------------------
 * Existe para que links antigos no singular (/vaga/<id>) continuem a funcionar
 * e para acabar com a dúvida "a rota é /vaga ou /vagas?": as duas respondem,
 * e a página real é uma só, em /vagas/[id].
 *
 * `await params` funciona tanto no Next 15 (onde params é Promise) como no 14
 * (onde é um objeto — await sobre um não-thenable devolve o próprio objeto).
 * ==========================================================================*/

import { redirect } from 'next/navigation'
import { linkVaga } from '@/lib/rotas'

export default async function VagaSingularRedirect({
  params,
}: {
  params: Promise<{ id: string }> | { id: string }
}) {
  const { id } = await params
  redirect(linkVaga(id))
}

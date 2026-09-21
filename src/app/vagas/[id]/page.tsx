'use client'

/* ============================================================================
 * Página pública da vaga + Trilha de Qualificação + candidatura interna
 * src/app/vagas/[id]/page.tsx
 * ----------------------------------------------------------------------------
 * Fluxo: ver vaga → concluir a trilha (módulos) → preencher dados → gravar.
 * A candidatura é 100% interna: grava em `candidatos` e em `candidaturas`.
 * Não há saída para WhatsApp nem e-mail no caminho da candidatura.
 *
 * Schema real do projeto (lido no Supabase):
 *   candidatos   → id, created_at, nome, email, telefone, cpf, bairro,
 *                  experiencia, curriculo_url
 *   candidaturas → id, created_at, vaga_id, candidato_id, status
 *
 * `candidaturas` não tem colunas para a trilha. O insert tenta gravar
 * `trilha_concluida` e `trilha_area` e, se essas colunas não existirem,
 * repete sem elas — a candidatura entra na mesma. Ver migracao-trilha.sql
 * para as acrescentar.
 * ==========================================================================*/

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase, type Vaga, type Empresa } from '@/lib/supabaseClient'
import { CSS_EMPRESA } from '@/lib/estilos'
import { urlVaga } from '@/lib/rotas'

/* ------------------------------- estilos base ------------------------------ */

const CARTAO = 'rounded-2xl border border-gray-200 bg-white shadow-sm'

const INPUT =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'

const BTN_VERDE =
  'inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50'

const BTN_CONTORNO =
  'inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50'

/* ======================================================================== */
/*  Trilhas de qualificação (Secção 5.3 da proposta)                        */
/* ======================================================================== */

type Modulo = { titulo: string; detalhe: string; horas: number }
type Trilha = { area: string; resumo: string; modulos: Modulo[] }

const TRILHAS: Array<{ chaves: RegExp; trilha: Trilha }> = [
  {
    chaves:
      /estoqu|estoque|vend|comerci|loja|caixa|balcon|repositor|pdv|atendente|vendedor|supermerc/i,
    trilha: {
      area: 'Comércio e Vendas',
      resumo:
        'Base para trabalhar em loja, caixa e estoque: atender bem, vender com técnica e não perder o controlo do que entra e sai.',
      modulos: [
        {
          titulo: 'Atendimento ao cliente',
          detalhe: 'Abordagem, escuta, postura e resolução de reclamações no balcão.',
          horas: 4,
        },
        {
          titulo: 'Técnicas básicas de vendas',
          detalhe: 'Sondagem de necessidade, apresentação do produto, fecho e venda adicional.',
          horas: 4,
        },
        {
          titulo: 'Operação de PDV',
          detalhe: 'Abertura e fecho de caixa, meios de pagamento, trocas e sangria.',
          horas: 3,
        },
        {
          titulo: 'Noções de controlo de estoque',
          detalhe: 'Recebimento, conferência, endereçamento, inventário e ruptura.',
          horas: 3,
        },
      ],
    },
  },
  {
    chaves: /gar(ç|c)o|gar(ç|c)onete|sal(ã|a)o|bar\b|barista|copeir|ma(î|i)tre|atendimento de mesa/i,
    trilha: {
      area: 'Garçom e Salão',
      resumo:
        'Serviço de salão em restaurante e bar: da receção do cliente ao fecho da conta, com segurança alimentar.',
      modulos: [
        {
          titulo: 'Serviço de salão e etiqueta',
          detalhe: 'Receção, sequência de serviço, postura e linguagem com o cliente.',
          horas: 4,
        },
        {
          titulo: 'Bandeja, mise en place e comanda',
          detalhe: 'Preparação da praça, transporte seguro e registo correto do pedido.',
          horas: 4,
        },
        {
          titulo: 'Bebidas e harmonização básica',
          detalhe: 'Carta, sugestão ao cliente e serviço de bebidas.',
          horas: 3,
        },
        {
          titulo: 'Higiene e segurança alimentar',
          detalhe: 'Boas práticas de manipulação e contaminação cruzada.',
          horas: 3,
        },
      ],
    },
  },
  {
    chaves: /hotel|hotelaria|recep(ç|c)|camareir|governant|turism|guia|pousada|concierge|reserv/i,
    trilha: {
      area: 'Turismo e Hospitalidade',
      resumo:
        'Receber bem o hóspede na alta temporada: check-in, quartos impecáveis e informação turística da cidade.',
      modulos: [
        {
          titulo: 'Recepção e check-in/check-out',
          detalhe: 'Acolhimento, reservas, cobrança e resolução de imprevistos.',
          horas: 4,
        },
        {
          titulo: 'Governança e arrumação de apartamentos',
          detalhe: 'Rotina de limpeza, enxoval, reposição e vistoria.',
          horas: 4,
        },
        {
          titulo: 'Atendimento ao turista',
          detalhe: 'Pontos de interesse de Balneário Camboriú, transportes e informação local.',
          horas: 3,
        },
        {
          titulo: 'Noções de inglês e espanhol para atendimento',
          detalhe: 'Frases essenciais do dia a dia com hóspedes estrangeiros.',
          horas: 4,
        },
      ],
    },
  },
  {
    chaves: /cozinh|chapeir|pizzaiol|confeit|padeir|auxiliar de cozinha|churrasqueir|sushi/i,
    trilha: {
      area: 'Cozinha e Alimentos',
      resumo: 'Trabalhar numa cozinha profissional com segurança, ritmo e padrão.',
      modulos: [
        {
          titulo: 'Higiene e manipulação de alimentos',
          detalhe: 'Boas práticas, temperaturas e armazenamento.',
          horas: 4,
        },
        {
          titulo: 'Pré-preparo e mise en place',
          detalhe: 'Cortes básicos, organização da praça e fichas técnicas.',
          horas: 4,
        },
        {
          titulo: 'Operação de linha em alta temporada',
          detalhe: 'Ritmo de serviço, comunicação com o salão e controlo de desperdício.',
          horas: 3,
        },
        {
          titulo: 'Segurança na cozinha',
          detalhe: 'Equipamentos, prevenção de acidentes e primeiros socorros.',
          horas: 2,
        },
      ],
    },
  },
  {
    chaves: /limpeza|servi(ç|c)os gerais|zelador|portari|porteir|seguran(ç|c)|vigilan|jardin|camar/i,
    trilha: {
      area: 'Serviços e Facilities',
      resumo: 'Rotinas de conservação, portaria e segurança em condomínios e empresas.',
      modulos: [
        {
          titulo: 'Rotinas de limpeza e conservação',
          detalhe: 'Produtos, diluição, sequência e áreas críticas.',
          horas: 3,
        },
        {
          titulo: 'Portaria e controlo de acesso',
          detalhe: 'Identificação de visitantes, registo e comunicação.',
          horas: 3,
        },
        {
          titulo: 'Segurança do trabalho e EPI',
          detalhe: 'Riscos, equipamento de proteção e prevenção de acidentes.',
          horas: 3,
        },
        {
          titulo: 'Relacionamento com moradores e clientes',
          detalhe: 'Postura, discrição e resolução de conflitos.',
          horas: 2,
        },
      ],
    },
  },
  {
    chaves: /constru|pedreir|servente|pintor|eletricist|encanador|hidr(á|a)ulic|gesseir|obra/i,
    trilha: {
      area: 'Construção Civil',
      resumo: 'Entrar na obra com noções de leitura, materiais e segurança.',
      modulos: [
        {
          titulo: 'Segurança do trabalho na obra (NR-18)',
          detalhe: 'Riscos, EPI, trabalho em altura e sinalização.',
          horas: 4,
        },
        {
          titulo: 'Leitura básica de projeto',
          detalhe: 'Plantas, medidas, esquadro e nível.',
          horas: 4,
        },
        {
          titulo: 'Materiais e traços',
          detalhe: 'Argamassa, concreto, desperdício e armazenamento.',
          horas: 3,
        },
        {
          titulo: 'Organização do canteiro',
          detalhe: 'Fluxo de materiais, limpeza e produtividade.',
          horas: 2,
        },
      ],
    },
  },
]

const TRILHA_GERAL: Trilha = {
  area: 'Atendimento e Mundo do Trabalho',
  resumo:
    'Trilha base do Capacita RH, para quem está a entrar ou a voltar ao mercado de trabalho.',
  modulos: [
    {
      titulo: 'Atendimento ao cliente',
      detalhe: 'Comunicação, escuta e postura profissional.',
      horas: 4,
    },
    {
      titulo: 'Rotinas e responsabilidades no trabalho',
      detalhe: 'Pontualidade, escala, trabalho em equipa e hierarquia.',
      horas: 3,
    },
    {
      titulo: 'Segurança e saúde no trabalho',
      detalhe: 'Riscos comuns, EPI e prevenção de acidentes.',
      horas: 3,
    },
    {
      titulo: 'Entrevista e primeiro emprego',
      detalhe: 'Currículo, entrevista e documentação de admissão.',
      horas: 2,
    },
  ],
}

function escolherTrilha(vaga: Vaga, empresa: Empresa | null): Trilha {
  const texto = [vaga.titulo, vaga.descricao, vaga.requisitos, empresa?.setor]
    .filter(Boolean)
    .join(' ')
  const achada = TRILHAS.find((t) => t.chaves.test(texto))
  return achada ? achada.trilha : TRILHA_GERAL
}

/* ======================================================================== */

type Estado =
  | { fase: 'a-carregar' }
  | { fase: 'ok'; vaga: Vaga; empresa: Empresa | null }
  | { fase: 'nao-encontrada'; erro: string | null }

export default function VagaPublicaPage() {
  const params = useParams<{ id: string | string[] }>()
  const bruto = params?.id
  const id = (Array.isArray(bruto) ? bruto[0] : bruto ?? '').trim()

  const [estado, setEstado] = useState<Estado>({ fase: 'a-carregar' })

  const carregar = useCallback(async (vagaId: string) => {
    if (!vagaId) {
      setEstado({ fase: 'nao-encontrada', erro: 'Nenhum id chegou à rota.' })
      return
    }

    const { data, error } = await supabase
      .from('vagas')
      .select('*')
      .eq('id', vagaId)
      .maybeSingle()

    if (error) return setEstado({ fase: 'nao-encontrada', erro: error.message })
    if (!data) return setEstado({ fase: 'nao-encontrada', erro: null })

    const vaga = data as Vaga
    let empresa: Empresa | null = null
    if (vaga.empresa_id) {
      const r = await supabase
        .from('empresas')
        .select('*')
        .eq('id', vaga.empresa_id)
        .maybeSingle()
      empresa = (r.data as Empresa) ?? null
    }
    setEstado({ fase: 'ok', vaga, empresa })
  }, [])

  useEffect(() => {
    carregar(id)
  }, [id, carregar])

  if (estado.fase === 'a-carregar') {
    return (
      <Moldura>
        <div className="flex min-h-[60vh] items-center justify-center gap-3 text-sm text-gray-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-emerald-600" />
          A carregar a vaga…
        </div>
      </Moldura>
    )
  }

  if (estado.fase === 'nao-encontrada') {
    return (
      <Moldura>
        <div className={`mx-auto mt-12 w-full max-w-lg p-8 text-center ${CARTAO}`}>
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-xl font-bold text-gray-400">
            ?
          </span>
          <h1 className="text-lg font-semibold text-gray-900">Vaga não encontrada</h1>
          <p className="mt-2 text-sm text-gray-500">
            Esta vaga pode ter sido removida, ou o link está incompleto.
          </p>

          {process.env.NODE_ENV !== 'production' && (
            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-left">
              <p className="text-xs font-semibold tracking-wide text-amber-900 uppercase">
                Diagnóstico (só em desenvolvimento)
              </p>
              <p className="mt-2 text-xs text-amber-900">
                <span className="font-semibold">id recebido: </span>
                <span className="font-mono break-all">
                  {id ? `"${id}" (${id.length} caracteres)` : '— vazio —'}
                </span>
              </p>
              <p className="mt-1 text-xs text-amber-900">
                <span className="font-semibold">erro do Supabase: </span>
                <span className="font-mono break-all">{estado.erro ?? 'nenhum'}</span>
              </p>
            </div>
          )}

          <a href="/vagas" className={`mt-6 ${BTN_CONTORNO}`}>
            Ver todas as vagas
          </a>
        </div>
      </Moldura>
    )
  }

  return <VagaCompleta vaga={estado.vaga} empresa={estado.empresa} />
}

/* ------------------------------------------------------------------------ */

function VagaCompleta({ vaga, empresa }: { vaga: Vaga; empresa: Empresa | null }) {
  const trilha = useMemo(() => escolherTrilha(vaga, empresa), [vaga, empresa])
  const ativa = (vaga.status ?? '').trim().toLowerCase() === 'ativa'

  const linhas = [
    vaga.regime,
    vaga.modalidade,
    [vaga.bairro, vaga.cidade].filter(Boolean).join(' · '),
  ].filter(Boolean)

  return (
    <Moldura>
      {!ativa && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Esta vaga já não está a receber candidaturas.
        </div>
      )}

      <article className={`p-6 sm:p-8 ${CARTAO}`}>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {vaga.titulo ?? 'Vaga sem título'}
          </h1>
          <span
            className={
              ativa
                ? 'rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700'
                : 'rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600'
            }
          >
            {ativa ? 'Ativa' : 'Encerrada'}
          </span>
        </div>

        {empresa?.nome && (
          <p className="mt-1.5 text-sm font-medium text-gray-700">
            {empresa.nome}
            {empresa.setor ? ` · ${empresa.setor}` : ''}
          </p>
        )}
        {linhas.length > 0 && <p className="mt-1 text-sm text-gray-500">{linhas.join(' • ')}</p>}
        {vaga.salario && (
          <p className="mt-4 text-xl font-bold text-emerald-700">{vaga.salario}</p>
        )}

        <Bloco titulo="Descrição" texto={vaga.descricao} />
        <Bloco titulo="Requisitos" texto={vaga.requisitos} />
        <Bloco titulo="Benefícios" texto={vaga.beneficios} />

        <p className="mt-6 text-xs text-gray-400">
          Publicada em {new Date(vaga.created_at).toLocaleDateString('pt-BR')}
        </p>
      </article>

      {ativa ? (
        <TrilhaECandidatura vaga={vaga} empresa={empresa} trilha={trilha} />
      ) : (
        <div className={`mt-6 p-6 text-center text-sm text-gray-500 ${CARTAO}`}>
          As candidaturas para esta vaga estão encerradas.
        </div>
      )}

      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <a href="/vagas" className="text-sm font-medium text-emerald-700 hover:underline">
          Ver todas as vagas
        </a>
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(urlVaga(vaga.id))}
          className="text-sm font-medium text-gray-500 hover:underline"
        >
          Copiar link desta vaga
        </button>
      </div>
    </Moldura>
  )
}

/* ======================================================================== */
/*  Trilha + candidatura interna                                            */
/* ======================================================================== */

type Passo = 'trilha' | 'dados' | 'sucesso'

function TrilhaECandidatura({
  vaga,
  empresa,
  trilha,
}: {
  vaga: Vaga
  empresa: Empresa | null
  trilha: Trilha
}) {
  const [passo, setPasso] = useState<Passo>('trilha')
  const [feitos, setFeitos] = useState<boolean[]>(() => trilha.modulos.map(() => false))
  const [aceite, setAceite] = useState(false)

  const [nome, setNome] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [cpf, setCpf] = useState('')
  const [email, setEmail] = useState('')
  const [bairro, setBairro] = useState('')
  const [experiencia, setExperiencia] = useState('')

  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const totalHoras = trilha.modulos.reduce((a, m) => a + m.horas, 0)
  const concluidos = feitos.filter(Boolean).length
  const progresso = Math.round((concluidos / trilha.modulos.length) * 100)
  const trilhaCompleta = concluidos === trilha.modulos.length

  const alternar = (i: number) =>
    setFeitos((f) => f.map((v, idx) => (idx === i ? !v : v)))

  const submeter = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro(null)

    if (!nome.trim()) return setErro('Informe o seu nome completo.')
    if (!whatsapp.trim()) return setErro('Informe o seu WhatsApp.')
    if (!cpf.trim() && !email.trim())
      return setErro('Informe o CPF ou o e-mail — precisamos de pelo menos um.')
    if (!aceite) return setErro('Confirme a conclusão e o aceite da trilha de capacitação.')

    setEnviando(true)

    const cpfLimpo = cpf.replace(/\D/g, '')
    const emailLimpo = email.trim().toLowerCase()

    /* 1. Reaproveitar o candidato, se já existir (por CPF, depois por e-mail). */
    let candidatoId: string | null = null

    if (cpfLimpo) {
      const r = await supabase.from('candidatos').select('id').eq('cpf', cpfLimpo).limit(1)
      candidatoId = r.data?.[0]?.id ?? null
    }
    if (!candidatoId && emailLimpo) {
      const r = await supabase.from('candidatos').select('id').eq('email', emailLimpo).limit(1)
      candidatoId = r.data?.[0]?.id ?? null
    }

    const dadosCandidato = {
      nome: nome.trim(),
      telefone: whatsapp.trim(),
      cpf: cpfLimpo || null,
      email: emailLimpo || null,
      bairro: bairro.trim() || null,
      experiencia: experiencia.trim() || null,
    }

    /* 2. Criar ou atualizar o candidato. */
    if (candidatoId) {
      const { error } = await supabase
        .from('candidatos')
        .update(dadosCandidato)
        .eq('id', candidatoId)
      if (error) {
        setEnviando(false)
        return setErro(`Não foi possível gravar os seus dados: ${error.message}`)
      }
    } else {
      const { data, error } = await supabase
        .from('candidatos')
        .insert(dadosCandidato)
        .select('id')
        .single()
      if (error || !data) {
        setEnviando(false)
        return setErro(`Não foi possível criar o seu cadastro: ${error?.message ?? 'erro'}`)
      }
      candidatoId = data.id as string
    }

    /* 3. Evitar candidatura duplicada na mesma vaga. */
    const jaExiste = await supabase
      .from('candidaturas')
      .select('id')
      .eq('vaga_id', vaga.id)
      .eq('candidato_id', candidatoId)
      .limit(1)

    if (jaExiste.data && jaExiste.data.length > 0) {
      setEnviando(false)
      setPasso('sucesso')
      return
    }

    /* 4. Gravar a candidatura. Tenta com os campos da trilha; se essas colunas
          ainda não existirem na tabela, repete sem elas. */
    const base = {
      vaga_id: vaga.id,
      candidato_id: candidatoId,
      status: 'recebida',
    }

    let { error } = await supabase.from('candidaturas').insert({
      ...base,
      trilha_concluida: true,
      trilha_area: trilha.area,
    })

    if (error && /trilha|column|schema cache/i.test(error.message)) {
      const retry = await supabase.from('candidaturas').insert(base)
      error = retry.error
    }

    setEnviando(false)

    if (error) return setErro(`Não foi possível submeter a candidatura: ${error.message}`)

    setPasso('sucesso')
  }

  /* ------------------------------- sucesso -------------------------------- */
  if (passo === 'sucesso') {
    return (
      <section className={`mt-6 overflow-hidden ${CARTAO}`}>
        <div className="bg-emerald-600 px-6 py-8 text-center sm:px-8">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-3xl font-bold text-white">
            ✓
          </span>
          <h2 className="text-xl font-bold text-white">Candidatura submetida com sucesso</h2>
          <p className="mt-2 text-sm text-emerald-50">
            Trilha <strong className="font-semibold">{trilha.area}</strong> concluída e
            candidatura registada para <strong className="font-semibold">{vaga.titulo}</strong>.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          <ul className="space-y-3">
            <LinhaSucesso>
              {empresa?.nome ?? 'A empresa'} já tem acesso ao seu perfil no painel de gestão do
              Capacita RH.
            </LinhaSucesso>
            <LinhaSucesso>
              O seu registo ficou marcado como <strong>trilha concluída</strong>, o que dá
              prioridade na triagem.
            </LinhaSucesso>
            <LinhaSucesso>
              O contacto é feito pelo WhatsApp que informou. Mantenha o telemóvel à mão.
            </LinhaSucesso>
          </ul>

          <div className="mt-8 flex flex-wrap gap-2 border-t border-gray-100 pt-6">
            <a href="/vagas" className={BTN_VERDE}>
              Ver outras vagas
            </a>
          </div>
        </div>
      </section>
    )
  }

  /* --------------------------- trilha + formulário ------------------------ */
  return (
    <section className={`mt-6 overflow-hidden ${CARTAO}`}>
      {/* Cabeçalho da trilha */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-5 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Trilha de Qualificação da Vaga</h2>
            <p className="mt-1 text-sm text-gray-600">{trilha.resumo}</p>
          </div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {trilha.area}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
          <span>
            <strong className="font-semibold text-gray-700">{trilha.modulos.length}</strong> módulos
          </span>
          <span>
            <strong className="font-semibold text-gray-700">{totalHoras}h</strong> no total
          </span>
          <span>Formato rápido, online e gratuito</span>
        </div>

        {/* Progresso */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-medium text-gray-600">
            <span>
              {concluidos} de {trilha.modulos.length} concluídos
            </span>
            <span className="tabular-nums">{progresso}%</span>
          </div>
          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${progresso}%` }}
            />
          </div>
        </div>
      </div>

      {/* Passos */}
      <div className="flex border-b border-gray-200">
        <Etapa numero={1} rotulo="Concluir a trilha" ativo={passo === 'trilha'} feito={trilhaCompleta} />
        <Etapa numero={2} rotulo="Os meus dados" ativo={passo === 'dados'} feito={false} />
      </div>

      <div className="p-6 sm:p-8">
        {erro && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm font-medium text-red-800">
            {erro}
          </div>
        )}

        {passo === 'trilha' && (
          <div>
            <ol className="space-y-3">
              {trilha.modulos.map((m, i) => (
                <li key={m.titulo}>
                  <label
                    className={
                      feitos[i]
                        ? 'flex cursor-pointer gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 transition'
                        : 'flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4 transition hover:border-gray-300'
                    }
                  >
                    <input
                      type="checkbox"
                      checked={feitos[i]}
                      onChange={() => alternar(i)}
                      className="mt-0.5 h-5 w-5 shrink-0 accent-emerald-600"
                    />
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {i + 1}. {m.titulo}
                        </span>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                          {m.horas}h
                        </span>
                      </span>
                      <span className="mt-1 block text-sm text-gray-600">{m.detalhe}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ol>

            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-6">
              <button
                type="button"
                disabled={!trilhaCompleta}
                onClick={() => {
                  setErro(null)
                  setPasso('dados')
                }}
                className={BTN_VERDE}
              >
                Continuar para os meus dados
              </button>
              {!trilhaCompleta && (
                <p className="text-sm text-gray-500">
                  Marque os {trilha.modulos.length} módulos para continuar.
                </p>
              )}
            </div>
          </div>
        )}

        {passo === 'dados' && (
          <form onSubmit={submeter} className="grid gap-5 md:grid-cols-2">
            <Campo className="md:col-span-2" rotulo="Nome completo *">
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Como está no seu documento"
                className={INPUT}
                required
              />
            </Campo>

            <Campo rotulo="WhatsApp *">
              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="(47) 90000-0000"
                inputMode="tel"
                className={INPUT}
                required
              />
            </Campo>

            <Campo rotulo="Bairro">
              <input
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                placeholder="Ex.: Centro"
                className={INPUT}
              />
            </Campo>

            <Campo rotulo="CPF">
              <input
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="000.000.000-00"
                inputMode="numeric"
                className={INPUT}
              />
            </Campo>

            <Campo rotulo="E-mail">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className={INPUT}
              />
            </Campo>

            <p className="-mt-2 text-xs text-gray-500 md:col-span-2">
              Informe pelo menos um dos dois: CPF ou e-mail. É o que evita candidaturas
              duplicadas.
            </p>

            <Campo className="md:col-span-2" rotulo="Experiência">
              <textarea
                value={experiencia}
                onChange={(e) => setExperiencia(e.target.value)}
                rows={4}
                placeholder="Onde já trabalhou, por quanto tempo e o que fazia. Se for o primeiro emprego, escreva isso mesmo."
                className={INPUT}
              />
            </Campo>

            <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 md:col-span-2">
              <input
                type="checkbox"
                checked={aceite}
                onChange={(e) => setAceite(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-emerald-600"
              />
              <span className="text-sm text-gray-700">
                Confirmo que concluí os {trilha.modulos.length} módulos da trilha{' '}
                <strong className="font-semibold">{trilha.area}</strong> ({totalHoras}h) e aceito
                que os meus dados sejam partilhados com{' '}
                <strong className="font-semibold">{empresa?.nome ?? 'a empresa'}</strong> para fins
                de recrutamento.
              </span>
            </label>

            <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-6 md:col-span-2">
              <button type="submit" disabled={enviando} className={BTN_VERDE}>
                {enviando ? 'A submeter…' : 'Concluir Trilha & Candidatar-me'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setErro(null)
                  setPasso('trilha')
                }}
                className={BTN_CONTORNO}
              >
                Voltar à trilha
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}

/* ============================== componentes ============================== */

function Moldura({ children }: { children: React.ReactNode }) {
  return (
    <main className="capacita-rh min-h-screen bg-gray-50">
      <style dangerouslySetInnerHTML={{ __html: CSS_EMPRESA }} />
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-5 sm:px-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-base font-bold text-white shadow-sm">
            C
          </span>
          <div>
            <p className="text-lg font-bold tracking-tight text-gray-900">Capacita RH</p>
            <p className="text-sm text-gray-500">Vagas em Balneário Camboriú</p>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">{children}</div>
    </main>
  )
}

function Bloco({ titulo, texto }: { titulo: string; texto: string | null }) {
  if (!texto) return null
  return (
    <section className="mt-6">
      <h2 className="text-sm font-semibold tracking-wide text-gray-500 uppercase">{titulo}</h2>
      <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-gray-700">{texto}</p>
    </section>
  )
}

function Campo({
  rotulo,
  children,
  className = '',
}: {
  rotulo: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-gray-700">{rotulo}</span>
      {children}
    </label>
  )
}

function Etapa({
  numero,
  rotulo,
  ativo,
  feito,
}: {
  numero: number
  rotulo: string
  ativo: boolean
  feito: boolean
}) {
  return (
    <div
      className={
        ativo
          ? 'flex flex-1 items-center justify-center gap-2 border-b-2 border-emerald-600 px-4 py-3 text-sm font-semibold text-gray-900'
          : 'flex flex-1 items-center justify-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-medium text-gray-400'
      }
    >
      <span
        className={
          feito
            ? 'flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white'
            : ativo
              ? 'flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white'
              : 'flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-500'
        }
      >
        {feito ? '✓' : numero}
      </span>
      {rotulo}
    </div>
  )
}

function LinhaSucesso({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
        ✓
      </span>
      <span className="text-sm leading-relaxed text-gray-700">{children}</span>
    </li>
  )
}

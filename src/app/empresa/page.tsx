'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import {
  supabase,
  type Vaga,
  type Empresa,
  type Candidato,
  type Candidatura,
  type CandidaturaComCandidato,
} from '@/lib/supabaseClient'

import { urlVaga } from '@/lib/rotas'

const REGIMES = ['CLT', 'Temporário', 'Estágio', 'Jovem Aprendiz', 'Freelancer', 'PJ']
const MODALIDADES = ['Presencial', 'Híbrido', 'Remoto']
const SETORES = [
  'Comércio',
  'Hotelaria',
  'Restaurantes e bares',
  'Serviços',
  'Construção civil',
  'Saúde',
  'Educação',
  'Outro',
]

/* ---- classes base reutilizadas (strings literais, legíveis pelo Tailwind) ---- */

const INPUT =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'

const CARTAO = 'rounded-2xl border border-gray-200 bg-white shadow-sm'

const BTN_VERDE =
  'inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-50'

const BTN_PRETO =
  'inline-flex items-center justify-center rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:cursor-not-allowed disabled:opacity-50'

const BTN_CONTORNO =
  'inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50'

type Aviso = { tipo: 'ok' | 'erro'; texto: string } | null

/* ========================================================================== */
/*  Raiz: decide entre ecrã de autenticação e painel                          */
/* ========================================================================== */

export default function EmpresaPage() {
  const [sessao, setSessao] = useState<Session | null>(null)
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [estado, setEstado] = useState<'a-carregar' | 'auth' | 'painel'>('a-carregar')

  /* Garante que existe uma linha em `empresas` ligada a este utilizador.
     Criada no primeiro login, a partir dos metadados do registo. */
  const garantirEmpresa = useCallback(async (user: User): Promise<Empresa | null> => {
    const porId = await supabase.from('empresas').select('*').eq('id', user.id).maybeSingle()
    if (porId.data) return porId.data as Empresa

    if (user.email) {
      const porEmail = await supabase
        .from('empresas')
        .select('*')
        .eq('email', user.email)
        .maybeSingle()
      if (porEmail.data) return porEmail.data as Empresa
    }

    const meta = (user.user_metadata ?? {}) as Record<string, string>
    const nova = {
      id: user.id,
      nome: meta.nome ?? null,
      email: user.email ?? null,
      telefone: meta.telefone ?? null,
      cnpj: meta.cnpj ?? null,
      setor: meta.setor ?? null,
      logo_url: null,
    }
    const { data, error } = await supabase.from('empresas').insert(nova).select().single()
    if (error) return null
    return data as Empresa
  }, [])

  useEffect(() => {
    let vivo = true

    const aplicar = async (s: Session | null) => {
      if (!vivo) return
      setSessao(s)
      if (!s?.user) {
        setEmpresa(null)
        setEstado('auth')
        return
      }
      const e = await garantirEmpresa(s.user)
      if (!vivo) return
      setEmpresa(e)
      setEstado('painel')
    }

    supabase.auth.getSession().then(({ data }) => aplicar(data.session))

    const { data: sub } = supabase.auth.onAuthStateChange((_evento, s) => {
      aplicar(s)
    })

    return () => {
      vivo = false
      sub.subscription.unsubscribe()
    }
  }, [garantirEmpresa])

  const sair = async () => {
    await supabase.auth.signOut()
    setSessao(null)
    setEmpresa(null)
    setEstado('auth')
  }

  if (estado === 'a-carregar') {
    return (
      <main className="capacita-rh flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-emerald-600" />
          A carregar…
        </div>
      </main>
    )
  }

  if (estado === 'auth' || !sessao) {
    return <EcraAutenticacao />
  }

  return <Painel empresa={empresa} setEmpresa={setEmpresa} onSair={sair} />
}

/* ========================================================================== */
/*  Ecrã de autenticação                                                      */
/* ========================================================================== */

function EcraAutenticacao() {
  const [modo, setModo] = useState<'entrar' | 'criar'>('entrar')
  const [aviso, setAviso] = useState<Aviso>(null)
  const [ocupado, setOcupado] = useState(false)

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [telefone, setTelefone] = useState('')
  const [setor, setSetor] = useState('Comércio')

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault()
    setOcupado(true)
    setAviso(null)
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    })
    setOcupado(false)
    if (error) {
      setAviso({
        tipo: 'erro',
        texto:
          error.message === 'Invalid login credentials'
            ? 'E-mail ou senha incorretos.'
            : error.message === 'Email not confirmed'
              ? 'Confirme o e-mail antes de entrar. Verifique a sua caixa de entrada.'
              : error.message,
      })
      return
    }
    /* onAuthStateChange trata da transição para o painel. */
  }

  const criarConta = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim()) {
      setAviso({ tipo: 'erro', texto: 'Informe o nome da empresa.' })
      return
    }
    if (senha.length < 6) {
      setAviso({ tipo: 'erro', texto: 'A senha precisa de pelo menos 6 caracteres.' })
      return
    }

    setOcupado(true)
    setAviso(null)

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: senha,
      options: {
        data: {
          nome: nome.trim(),
          cnpj: cnpj.trim(),
          telefone: telefone.trim(),
          setor,
        },
      },
    })

    setOcupado(false)

    if (error) {
      setAviso({
        tipo: 'erro',
        texto: error.message.includes('already registered')
          ? 'Já existe uma conta com este e-mail. Use a aba Entrar.'
          : error.message,
      })
      return
    }

    if (!data.session) {
      setAviso({
        tipo: 'ok',
        texto:
          'Conta criada. Confirme o e-mail que enviámos e depois entre na aba Entrar. O registo da empresa é concluído no primeiro acesso.',
      })
      setModo('entrar')
      return
    }
    /* Sessão imediata (confirmação de e-mail desligada): onAuthStateChange leva ao painel. */
  }

  return (
    <main className="capacita-rh flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-lg font-bold text-white shadow-sm">
            C
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Capacita RH</h1>
          <p className="mt-1 text-sm text-gray-500">Área da Empresa · Balneário Camboriú</p>
        </div>

        <div className={`overflow-hidden ${CARTAO}`}>
          {/* Alternância Entrar / Cadastrar */}
          <div className="grid grid-cols-2 gap-1 border-b border-gray-200 bg-gray-50 p-1.5">
            <button
              type="button"
              onClick={() => {
                setModo('entrar')
                setAviso(null)
              }}
              className={
                modo === 'entrar'
                  ? 'rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm transition'
                  : 'rounded-lg px-4 py-2.5 text-sm font-medium text-gray-500 transition hover:text-gray-800'
              }
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setModo('criar')
                setAviso(null)
              }}
              className={
                modo === 'criar'
                  ? 'rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm transition'
                  : 'rounded-lg px-4 py-2.5 text-sm font-medium text-gray-500 transition hover:text-gray-800'
              }
            >
              Cadastrar Empresa
            </button>
          </div>

          <div className="p-6 sm:p-7">
            {aviso && (
              <div
                className={
                  aviso.tipo === 'ok'
                    ? 'mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm font-medium text-emerald-800'
                    : 'mb-5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm font-medium text-red-800'
                }
              >
                {aviso.texto}
              </div>
            )}

            {modo === 'entrar' ? (
              <form onSubmit={entrar} className="space-y-4">
                <Campo rotulo="E-mail">
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rh@suaempresa.com.br"
                    className={INPUT}
                    required
                  />
                </Campo>
                <Campo rotulo="Senha">
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className={INPUT}
                    required
                  />
                </Campo>
                <button type="submit" disabled={ocupado} className={`w-full ${BTN_VERDE}`}>
                  {ocupado ? 'A entrar…' : 'Entrar na Área da Empresa'}
                </button>
                <p className="pt-1 text-center text-sm text-gray-500">
                  Ainda não tem conta?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setModo('criar')
                      setAviso(null)
                    }}
                    className="font-semibold text-emerald-700 underline-offset-2 hover:underline"
                  >
                    Cadastrar empresa
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={criarConta} className="space-y-4">
                <Campo rotulo="Nome da empresa *">
                  <input
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex.: Hotel Marambaia"
                    className={INPUT}
                    required
                  />
                </Campo>
                <Campo rotulo="CNPJ">
                  <input
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className={INPUT}
                  />
                </Campo>
                <Campo rotulo="E-mail *">
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rh@suaempresa.com.br"
                    className={INPUT}
                    required
                  />
                </Campo>
                <Campo rotulo="Senha *">
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    className={INPUT}
                    required
                  />
                </Campo>
                <Campo rotulo="Telefone / WhatsApp">
                  <input
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(47) 90000-0000"
                    className={INPUT}
                  />
                </Campo>
                <Campo rotulo="Setor">
                  <select
                    value={setor}
                    onChange={(e) => setSetor(e.target.value)}
                    className={INPUT}
                  >
                    {SETORES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Campo>
                <button type="submit" disabled={ocupado} className={`w-full ${BTN_VERDE}`}>
                  {ocupado ? 'A criar conta…' : 'Criar Conta de Empresa'}
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Prefeitura de Balneário Camboriú · Programa Capacita RH
        </p>
      </div>
    </main>
  )
}

/* ========================================================================== */
/*  Painel restrito                                                           */
/* ========================================================================== */

type Aba = 'publicar' | 'vagas' | 'dados'

type FormVaga = {
  titulo: string
  descricao: string
  regime: string
  modalidade: string
  salario: string
  beneficios: string
  requisitos: string
  bairro: string
  cidade: string
  status: string
}

const FORM_VAZIO: FormVaga = {
  titulo: '',
  descricao: '',
  regime: 'CLT',
  modalidade: 'Presencial',
  salario: '',
  beneficios: '',
  requisitos: '',
  bairro: '',
  cidade: 'Balneário Camboriú',
  status: 'ativa',
}

function Painel({
  empresa,
  setEmpresa,
  onSair,
}: {
  empresa: Empresa | null
  setEmpresa: (e: Empresa) => void
  onSair: () => void
}) {
  const [aba, setAba] = useState<Aba>('publicar')
  const [vagas, setVagas] = useState<Vaga[]>([])
  const [candidaturasPorVaga, setCandidaturasPorVaga] = useState<Record<string, number>>({})
  const [aviso, setAviso] = useState<Aviso>(null)
  const [form, setForm] = useState<FormVaga>(FORM_VAZIO)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [vagaPartilha, setVagaPartilha] = useState<Vaga | null>(null)

  /* Candidatos por vaga (modal) */
  const [vagaCandidatos, setVagaCandidatos] = useState<Vaga | null>(null)
  const [listaCandidatos, setListaCandidatos] = useState<CandidaturaComCandidato[]>([])
  const [carregandoCandidatos, setCarregandoCandidatos] = useState(false)

  const empresaId = empresa?.id ?? null

  const carregarVagas = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from('vagas')
      .select('*')
      .eq('empresa_id', id)
      .order('created_at', { ascending: false })

    if (error) {
      setAviso({ tipo: 'erro', texto: `Erro ao carregar as vagas: ${error.message}` })
      return
    }

    const lista = (data ?? []) as Vaga[]
    setVagas(lista)

    if (lista.length === 0) {
      setCandidaturasPorVaga({})
      return
    }

    /* `select('*')` e não um join embutido: com RLS ativo, um
       `candidatos!inner(...)` faria desaparecer candidaturas cujo candidato a
       empresa ainda não pode ler. Os candidatos são lidos à parte, ao abrir o
       modal. */
    const { data: cands } = await supabase
      .from('candidaturas')
      .select('id, vaga_id')
      .in(
        'vaga_id',
        lista.map((v) => v.id)
      )

    const contagem: Record<string, number> = {}
    ;(cands ?? []).forEach((c: Candidatura) => {
      if (!c.vaga_id) return
      contagem[c.vaga_id] = (contagem[c.vaga_id] ?? 0) + 1
    })
    setCandidaturasPorVaga(contagem)
  }, [])

  useEffect(() => {
    if (empresaId) carregarVagas(empresaId)
  }, [empresaId, carregarVagas])

  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(null), 5000)
    return () => clearTimeout(t)
  }, [aviso])

  const stats = useMemo(() => {
    const total = vagas.length
    const ativas = vagas.filter((v) => (v.status ?? '').toLowerCase() === 'ativa').length
    return {
      total,
      ativas,
      encerradas: total - ativas,
      candidaturas: Object.values(candidaturasPorVaga).reduce((a, b) => a + b, 0),
    }
  }, [vagas, candidaturasPorVaga])

  const abrirCandidatos = async (v: Vaga) => {
    setVagaCandidatos(v)
    setCarregandoCandidatos(true)
    setListaCandidatos([])

    /* Recarrega as candidaturas desta vaga, para o modal nunca mostrar
       um estado velho. */
    const { data: cands, error } = await supabase
      .from('candidaturas')
      .select('*')
      .eq('vaga_id', v.id)
      .order('created_at', { ascending: false })

    if (error) {
      setCarregandoCandidatos(false)
      setAviso({ tipo: 'erro', texto: `Erro ao carregar candidaturas: ${error.message}` })
      return
    }

    const candidaturas = (cands ?? []) as Candidatura[]
    const ids = candidaturas.map((c) => c.candidato_id).filter(Boolean) as string[]

    const porId: Record<string, Candidato> = {}
    if (ids.length > 0) {
      const { data: pessoas } = await supabase.from('candidatos').select('*').in('id', ids)
      ;(pessoas ?? []).forEach((p: Candidato) => {
        porId[p.id] = p
      })
    }

    setListaCandidatos(
      candidaturas.map((c) => ({
        ...c,
        candidato: c.candidato_id ? (porId[c.candidato_id] ?? null) : null,
      }))
    )
    setCarregandoCandidatos(false)
  }

  const alterarCampo = (campo: keyof FormVaga, valor: string) =>
    setForm((f) => ({ ...f, [campo]: valor }))

  const submeterVaga = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!empresaId) return
    if (!form.titulo.trim()) {
      setAviso({ tipo: 'erro', texto: 'Informe o título da vaga.' })
      return
    }

    setSalvando(true)

    const payload = {
      empresa_id: empresaId,
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim() || null,
      regime: form.regime || null,
      modalidade: form.modalidade || null,
      salario: form.salario.trim() || null,
      beneficios: form.beneficios.trim() || null,
      requisitos: form.requisitos.trim() || null,
      bairro: form.bairro.trim() || null,
      cidade: form.cidade.trim() || null,
      status: form.status || 'ativa',
    }

    const { error } = editandoId
      ? await supabase.from('vagas').update(payload).eq('id', editandoId)
      : await supabase.from('vagas').insert(payload)

    setSalvando(false)

    if (error) {
      setAviso({ tipo: 'erro', texto: `Não foi possível gravar a vaga: ${error.message}` })
      return
    }

    setAviso({
      tipo: 'ok',
      texto: editandoId ? 'Vaga atualizada com sucesso.' : 'Vaga publicada com sucesso.',
    })
    setForm(FORM_VAZIO)
    setEditandoId(null)
    await carregarVagas(empresaId)
    setAba('vagas')
  }

  const editarVaga = (v: Vaga) => {
    setEditandoId(v.id)
    setForm({
      titulo: v.titulo ?? '',
      descricao: v.descricao ?? '',
      regime: v.regime ?? 'CLT',
      modalidade: v.modalidade ?? 'Presencial',
      salario: v.salario ?? '',
      beneficios: v.beneficios ?? '',
      requisitos: v.requisitos ?? '',
      bairro: v.bairro ?? '',
      cidade: v.cidade ?? '',
      status: v.status ?? 'ativa',
    })
    setAba('publicar')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const alternarStatus = async (v: Vaga) => {
    const novo = (v.status ?? '').toLowerCase() === 'ativa' ? 'encerrada' : 'ativa'
    const { error } = await supabase.from('vagas').update({ status: novo }).eq('id', v.id)
    if (error) {
      setAviso({ tipo: 'erro', texto: `Erro ao alterar o estado: ${error.message}` })
      return
    }
    setAviso({ tipo: 'ok', texto: `Vaga ${novo === 'ativa' ? 'reaberta' : 'encerrada'}.` })
    if (empresaId) carregarVagas(empresaId)
  }

  const excluirVaga = async (v: Vaga) => {
    if (!window.confirm(`Excluir definitivamente a vaga "${v.titulo ?? 'sem título'}"?`)) return
    const { error } = await supabase.from('vagas').delete().eq('id', v.id)
    if (error) {
      setAviso({ tipo: 'erro', texto: `Erro ao excluir: ${error.message}` })
      return
    }
    setAviso({ tipo: 'ok', texto: 'Vaga excluída.' })
    if (empresaId) carregarVagas(empresaId)
  }

  const guardarDados = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!empresa) return
    setSalvando(true)
    const { error } = await supabase
      .from('empresas')
      .update({
        nome: empresa.nome,
        email: empresa.email,
        telefone: empresa.telefone,
        cnpj: empresa.cnpj,
        setor: empresa.setor,
        logo_url: empresa.logo_url,
      })
      .eq('id', empresa.id)
    setSalvando(false)
    if (error) {
      setAviso({ tipo: 'erro', texto: `Erro ao gravar os dados: ${error.message}` })
      return
    }
    setAviso({ tipo: 'ok', texto: 'Dados da empresa atualizados.' })
  }

  return (
    <main className="capacita-rh min-h-screen bg-gray-50">
      {/* O cabeçalho global (Navbar) já vem do layout raiz. Aqui ficamos só
          com a identificação da empresa autenticada, logo abaixo dele. */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {empresa?.nome ?? 'Empresa sem nome'}
            </p>
            <p className="text-xs text-gray-500">{empresa?.email ?? ''}</p>
          </div>
          <button onClick={onSair} className={BTN_CONTORNO}>
            Sair
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {aviso && (
          <div
            className={
              aviso.tipo === 'ok'
                ? 'mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800'
                : 'mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800'
            }
          >
            {aviso.texto}
          </div>
        )}

        {!empresa && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            A sua conta está autenticada mas ainda não tem registo na tabela de empresas.
            Preencha Meus Dados / Perfil para concluir.
          </div>
        )}

        {/* -------------------------- Cartões de métricas ----------------------- */}
        <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <CartaoMetrica rotulo="Vagas publicadas" valor={stats.total} tom="escuro" />
          <CartaoMetrica rotulo="Vagas ativas" valor={stats.ativas} tom="verde" />
          <CartaoMetrica rotulo="Candidaturas recebidas" valor={stats.candidaturas} tom="verde" />
          <CartaoMetrica rotulo="Vagas encerradas" valor={stats.encerradas} tom="cinza" />
        </section>

        {/* ------------------------ Separadores de navegação -------------------- */}
        <nav className={`mb-6 grid grid-cols-1 gap-1.5 p-1.5 sm:grid-cols-3 ${CARTAO}`}>
          <Separador ativo={aba === 'publicar'} onClick={() => setAba('publicar')}>
            {editandoId ? 'Editar Vaga' : 'Publicar Nova Vaga'}
          </Separador>
          <Separador
            ativo={aba === 'vagas'}
            onClick={() => setAba('vagas')}
            contagem={stats.total}
          >
            Minhas Vagas
          </Separador>
          <Separador ativo={aba === 'dados'} onClick={() => setAba('dados')}>
            Meus Dados / Perfil
          </Separador>
        </nav>

        {/* ------------------------------ Publicar ------------------------------ */}
        {aba === 'publicar' && (
          <form onSubmit={submeterVaga} className={`p-6 sm:p-8 ${CARTAO}`}>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {editandoId ? 'Editar vaga' : 'Publicar nova vaga'}
                </h2>
                <p className="mt-0.5 text-sm text-gray-500">
                  Os campos marcados com * são obrigatórios.
                </p>
              </div>
              {editandoId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditandoId(null)
                    setForm(FORM_VAZIO)
                  }}
                  className="text-sm font-medium text-gray-500 underline-offset-2 hover:text-gray-800 hover:underline"
                >
                  Cancelar edição
                </button>
              )}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Campo className="md:col-span-2" rotulo="Título da vaga *">
                <input
                  value={form.titulo}
                  onChange={(e) => alterarCampo('titulo', e.target.value)}
                  placeholder="Ex.: Recepcionista de hotel"
                  className={INPUT}
                  required
                />
              </Campo>

              <Campo rotulo="Regime">
                <select
                  value={form.regime}
                  onChange={(e) => alterarCampo('regime', e.target.value)}
                  className={INPUT}
                >
                  {REGIMES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </Campo>

              <Campo rotulo="Modalidade">
                <select
                  value={form.modalidade}
                  onChange={(e) => alterarCampo('modalidade', e.target.value)}
                  className={INPUT}
                >
                  {MODALIDADES.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </Campo>

              <Campo rotulo="Salário">
                <input
                  value={form.salario}
                  onChange={(e) => alterarCampo('salario', e.target.value)}
                  placeholder="Ex.: R$ 2.200,00 + comissão"
                  className={INPUT}
                />
              </Campo>

              <Campo rotulo="Estado da vaga">
                <select
                  value={form.status}
                  onChange={(e) => alterarCampo('status', e.target.value)}
                  className={INPUT}
                >
                  <option value="ativa">Ativa</option>
                  <option value="encerrada">Encerrada</option>
                </select>
              </Campo>

              <Campo rotulo="Bairro">
                <input
                  value={form.bairro}
                  onChange={(e) => alterarCampo('bairro', e.target.value)}
                  placeholder="Ex.: Centro"
                  className={INPUT}
                />
              </Campo>

              <Campo rotulo="Cidade">
                <input
                  value={form.cidade}
                  onChange={(e) => alterarCampo('cidade', e.target.value)}
                  className={INPUT}
                />
              </Campo>

              <Campo className="md:col-span-2" rotulo="Descrição da vaga">
                <textarea
                  value={form.descricao}
                  onChange={(e) => alterarCampo('descricao', e.target.value)}
                  rows={4}
                  placeholder="Atividades do dia a dia, horário, escala…"
                  className={INPUT}
                />
              </Campo>

              <Campo className="md:col-span-2" rotulo="Requisitos">
                <textarea
                  value={form.requisitos}
                  onChange={(e) => alterarCampo('requisitos', e.target.value)}
                  rows={3}
                  placeholder="Ex.: Ensino médio completo, experiência com atendimento…"
                  className={INPUT}
                />
              </Campo>

              <Campo className="md:col-span-2" rotulo="Benefícios">
                <textarea
                  value={form.beneficios}
                  onChange={(e) => alterarCampo('beneficios', e.target.value)}
                  rows={3}
                  placeholder="Ex.: Vale-transporte, refeição no local, plano de saúde…"
                  className={INPUT}
                />
              </Campo>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-6">
              <button type="submit" disabled={salvando} className={BTN_VERDE}>
                {salvando ? 'A gravar…' : editandoId ? 'Guardar alterações' : 'Publicar vaga'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setForm(FORM_VAZIO)
                  setEditandoId(null)
                }}
                className={BTN_CONTORNO}
              >
                Limpar formulário
              </button>
            </div>
          </form>
        )}

        {/* ---------------------------- Minhas Vagas ---------------------------- */}
        {aba === 'vagas' && (
          <section className="space-y-4">
            {vagas.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
                <p className="text-sm text-gray-500">
                  Ainda não há vagas publicadas por esta empresa.
                </p>
                <button onClick={() => setAba('publicar')} className={`mt-5 ${BTN_VERDE}`}>
                  Publicar a primeira vaga
                </button>
              </div>
            )}

            {vagas.map((v) => {
              const ativa = (v.status ?? '').toLowerCase() === 'ativa'
              return (
                <article
                  key={v.id}
                  className={`p-5 transition hover:border-gray-300 hover:shadow-md sm:p-6 ${CARTAO}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-gray-900">
                          {v.titulo ?? 'Vaga sem título'}
                        </h3>
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

                      <p className="mt-1.5 text-sm text-gray-500">
                        {[v.regime, v.modalidade, [v.bairro, v.cidade].filter(Boolean).join(' · ')]
                          .filter(Boolean)
                          .join(' • ') || '—'}
                      </p>

                      {v.salario && (
                        <p className="mt-1.5 text-sm font-semibold text-gray-900">{v.salario}</p>
                      )}

                      {v.descricao && (
                        <p
                          className="mt-2.5 text-sm leading-relaxed text-gray-600"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {v.descricao}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                        <span>
                          Publicada em {new Date(v.created_at).toLocaleDateString('pt-BR')}
                        </span>
                        {(candidaturasPorVaga[v.id] ?? 0) > 0 ? (
                          <button
                            type="button"
                            onClick={() => abrirCandidatos(v)}
                            className="text-xs font-semibold text-emerald-700 underline-offset-2 hover:underline"
                          >
                            {candidaturasPorVaga[v.id]} candidatura(s) — ver candidatos
                          </button>
                        ) : (
                          <span className="font-medium text-gray-500">
                            Ainda sem candidaturas
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      {(candidaturasPorVaga[v.id] ?? 0) > 0 && (
                        <BotaoAcao onClick={() => abrirCandidatos(v)} variante="preto">
                          Ver Candidatos ({candidaturasPorVaga[v.id]})
                        </BotaoAcao>
                      )}
                      <BotaoAcao onClick={() => setVagaPartilha(v)} variante="verde">
                        Partilhar
                      </BotaoAcao>
                      <BotaoAcao onClick={() => editarVaga(v)} variante="contorno">
                        Editar
                      </BotaoAcao>
                      <BotaoAcao onClick={() => alternarStatus(v)} variante="preto">
                        {ativa ? 'Encerrar' : 'Reabrir'}
                      </BotaoAcao>
                      <BotaoAcao onClick={() => excluirVaga(v)} variante="perigo">
                        Excluir
                      </BotaoAcao>
                    </div>
                  </div>
                </article>
              )
            })}
          </section>
        )}

        {/* ----------------------------- Meus Dados ----------------------------- */}
        {aba === 'dados' && empresa && (
          <section className={`p-6 sm:p-8 ${CARTAO}`}>
            <div className="mb-6 border-b border-gray-100 pb-5">
              <h2 className="text-lg font-semibold text-gray-900">Meus dados / Perfil</h2>
              <p className="mt-0.5 text-sm text-gray-500">
                Estes dados aparecem nas vagas publicadas por si.
              </p>
            </div>

            <form onSubmit={guardarDados} className="grid gap-5 md:grid-cols-2">
              <Campo rotulo="Nome da empresa">
                <input
                  value={empresa.nome ?? ''}
                  onChange={(e) => setEmpresa({ ...empresa, nome: e.target.value })}
                  className={INPUT}
                />
              </Campo>
              <Campo rotulo="CNPJ">
                <input
                  value={empresa.cnpj ?? ''}
                  onChange={(e) => setEmpresa({ ...empresa, cnpj: e.target.value })}
                  placeholder="00.000.000/0001-00"
                  className={INPUT}
                />
              </Campo>
              <Campo rotulo="E-mail de contacto">
                <input
                  type="email"
                  value={empresa.email ?? ''}
                  onChange={(e) => setEmpresa({ ...empresa, email: e.target.value })}
                  className={INPUT}
                />
              </Campo>
              <Campo rotulo="Telefone / WhatsApp">
                <input
                  value={empresa.telefone ?? ''}
                  onChange={(e) => setEmpresa({ ...empresa, telefone: e.target.value })}
                  placeholder="(47) 90000-0000"
                  className={INPUT}
                />
              </Campo>
              <Campo rotulo="Setor">
                <select
                  value={empresa.setor ?? ''}
                  onChange={(e) => setEmpresa({ ...empresa, setor: e.target.value })}
                  className={INPUT}
                >
                  <option value="">—</option>
                  {SETORES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Campo>
              <Campo rotulo="URL do logótipo">
                <input
                  value={empresa.logo_url ?? ''}
                  onChange={(e) => setEmpresa({ ...empresa, logo_url: e.target.value })}
                  placeholder="https://…"
                  className={INPUT}
                />
              </Campo>

              <div className="mt-2 flex flex-wrap items-center gap-3 md:col-span-2">
                <button type="submit" disabled={salvando} className={BTN_VERDE}>
                  {salvando ? 'A gravar…' : 'Guardar dados'}
                </button>
                <button type="button" onClick={onSair} className={BTN_CONTORNO}>
                  Terminar sessão
                </button>
              </div>
            </form>
          </section>
        )}
      </div>

      {vagaCandidatos && (
        <ModalCandidatos
          vaga={vagaCandidatos}
          lista={listaCandidatos}
          carregando={carregandoCandidatos}
          onFechar={() => setVagaCandidatos(null)}
        />
      )}

      {vagaPartilha && (
        <ModalPartilha
          vaga={vagaPartilha}
          empresa={empresa}
          onFechar={() => setVagaPartilha(null)}
        />
      )}
    </main>
  )
}

/* ============================== componentes ============================== */

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

function Separador({
  ativo,
  onClick,
  contagem,
  children,
}: {
  ativo: boolean
  onClick: () => void
  contagem?: number
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        ativo
          ? 'flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition'
          : 'flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900'
      }
    >
      {ativo && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
      {children}
      {typeof contagem === 'number' && (
        <span
          className={
            ativo
              ? 'rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold text-white'
              : 'rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600'
          }
        >
          {contagem}
        </span>
      )}
    </button>
  )
}

function CartaoMetrica({
  rotulo,
  valor,
  tom,
}: {
  rotulo: string
  valor: number
  tom: 'verde' | 'escuro' | 'cinza'
}) {
  const ponto =
    tom === 'verde'
      ? 'h-2 w-2 rounded-full bg-emerald-500'
      : tom === 'escuro'
        ? 'h-2 w-2 rounded-full bg-gray-900'
        : 'h-2 w-2 rounded-full bg-gray-300'

  const numero =
    tom === 'verde'
      ? 'mt-2 text-3xl font-bold tabular-nums tracking-tight text-emerald-600'
      : tom === 'escuro'
        ? 'mt-2 text-3xl font-bold tabular-nums tracking-tight text-gray-900'
        : 'mt-2 text-3xl font-bold tabular-nums tracking-tight text-gray-400'

  return (
    <div className={`p-5 ${CARTAO}`}>
      <div className="flex items-center gap-2">
        <span className={ponto} />
        <p className="text-sm font-medium text-gray-500">{rotulo}</p>
      </div>
      <p className={numero}>{valor}</p>
    </div>
  )
}

function BotaoAcao({
  children,
  onClick,
  variante,
}: {
  children: React.ReactNode
  onClick: () => void
  variante: 'verde' | 'preto' | 'contorno' | 'perigo'
}) {
  const estilo =
    variante === 'verde'
      ? 'rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700'
      : variante === 'preto'
        ? 'rounded-lg bg-gray-900 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800'
        : variante === 'perigo'
          ? 'rounded-lg border border-red-200 bg-white px-3.5 py-2 text-sm font-medium text-red-600 shadow-sm transition hover:bg-red-50'
          : 'rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50'

  return (
    <button type="button" onClick={onClick} className={estilo}>
      {children}
    </button>
  )
}

function ModalPartilha({
  vaga,
  empresa,
  onFechar,
}: {
  vaga: Vaga
  empresa: Empresa | null
  onFechar: () => void
}) {
  const [copiado, setCopiado] = useState<'link' | 'texto' | null>(null)

  const link = urlVaga(vaga.id)

  const mensagem = [
    `*${vaga.titulo ?? 'Nova vaga'}*`,
    empresa?.nome ? `Empresa: ${empresa.nome}` : null,
    [vaga.regime, vaga.modalidade].filter(Boolean).join(' · ') || null,
    [vaga.bairro, vaga.cidade].filter(Boolean).join(' · ') || null,
    vaga.salario ? `Salário: ${vaga.salario}` : null,
    '',
    'Candidate-se pelo Capacita RH:',
    link,
  ]
    .filter((l) => l !== null)
    .join('\n')

  const copiar = async (valor: string, qual: 'link' | 'texto') => {
    try {
      await navigator.clipboard.writeText(valor)
      setCopiado(qual)
      setTimeout(() => setCopiado(null), 2000)
    } catch {
      /* ignora */
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm"
      onClick={onFechar}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Partilhar vaga</h3>
            <p className="mt-0.5 text-sm text-gray-500">{vaga.titulo ?? 'Vaga sem título'}</p>
          </div>
          <button
            onClick={onFechar}
            className="rounded-lg px-2 py-1 text-lg leading-none text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <label className="mb-1.5 block text-sm font-medium text-gray-700">Link público</label>
        <div className="flex gap-2">
          <input readOnly value={link} className={`${INPUT} font-mono text-xs`} />
          <button
            onClick={() => copiar(link, 'link')}
            className="shrink-0 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            {copiado === 'link' ? 'Copiado!' : 'Copiar'}
          </button>
        </div>

        <label className="mb-1.5 mt-5 block text-sm font-medium text-gray-700">
          Mensagem pronta
        </label>
        <textarea
          readOnly
          value={mensagem}
          rows={8}
          className={`${INPUT} bg-gray-50 font-mono text-xs leading-relaxed`}
        />

        <div className="mt-6 flex flex-wrap gap-2 border-t border-gray-100 pt-5">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(mensagem)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={BTN_VERDE}
          >
            Enviar por WhatsApp
          </a>
          <button onClick={() => copiar(mensagem, 'texto')} className={BTN_PRETO}>
            {copiado === 'texto' ? 'Mensagem copiada!' : 'Copiar mensagem'}
          </button>
          <a
            href={`mailto:?subject=${encodeURIComponent(
              vaga.titulo ?? 'Vaga'
            )}&body=${encodeURIComponent(mensagem)}`}
            className={BTN_CONTORNO}
          >
            E-mail
          </a>
        </div>
      </div>
    </div>
  )
}

/* ======================================================================== */
/*  Modal de candidatos da vaga                                             */
/* ======================================================================== */

/** Normaliza para o formato do wa.me: só dígitos, com 55 à frente. */
function linkWhatsApp(telefone: string | null, mensagem: string): string | null {
  const digitos = (telefone ?? '').replace(/\D/g, '')
  if (digitos.length < 10) return null
  const comPais = digitos.startsWith('55') ? digitos : `55${digitos}`
  return `https://wa.me/${comPais}?text=${encodeURIComponent(mensagem)}`
}

function BadgeTrilha({ concluida }: { concluida?: boolean | null }) {
  if (concluida === true) {
    return (
      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
        Trilha Concluída
      </span>
    )
  }
  if (concluida === false) {
    return (
      <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
        Em Capacitação
      </span>
    )
  }
  /* Coluna `trilha_concluida` ainda não existe na tabela. */
  return (
    <span
      className="rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500"
      title="Corra migracao-trilha.sql para passar a registar a trilha"
    >
      Trilha sem registo
    </span>
  )
}

function ModalCandidatos({
  vaga,
  lista,
  carregando,
  onFechar,
}: {
  vaga: Vaga
  lista: CandidaturaComCandidato[]
  carregando: boolean
  onFechar: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm"
      onClick={onFechar}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-gray-900">Candidatos</h3>
            <p className="mt-0.5 truncate text-sm text-gray-500">
              {vaga.titulo ?? 'Vaga sem título'}
              {lista.length > 0 && ` · ${lista.length} candidatura(s)`}
            </p>
          </div>
          <button
            onClick={onFechar}
            className="rounded-lg px-2 py-1 text-lg leading-none text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {/* Lista */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">
          {carregando && (
            <div className="flex items-center justify-center gap-3 py-12 text-sm text-gray-500">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-emerald-600" />
              A carregar candidatos…
            </div>
          )}

          {!carregando && lista.length === 0 && (
            <p className="py-12 text-center text-sm text-gray-500">
              Ainda não há candidaturas para esta vaga.
            </p>
          )}

          <div className="space-y-4">
            {lista.map((c) => {
              const p = c.candidato
              const mensagem = `Olá${p?.nome ? ` ${p.nome.split(' ')[0]}` : ''}! Sou da ${
                vaga.titulo ? 'empresa que publicou a vaga de ' + vaga.titulo : 'empresa'
              } no Capacita RH e gostaria de falar sobre a sua candidatura.`
              const wa = linkWhatsApp(p?.telefone ?? null, mensagem)

              return (
                <article
                  key={c.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="text-base font-semibold text-gray-900">
                        {p?.nome ?? 'Candidato sem nome'}
                      </h4>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Candidatou-se em{' '}
                        {new Date(c.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                        {' às '}
                        {new Date(c.created_at).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {p?.bairro ? ` · ${p.bairro}` : ''}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <BadgeTrilha concluida={c.trilha_concluida} />
                      {c.status && (
                        <span className="rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600 capitalize">
                          {c.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contactos */}
                  <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-medium text-gray-500">WhatsApp / Telefone</dt>
                      <dd className="text-sm text-gray-900">{p?.telefone ?? '—'}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs font-medium text-gray-500">E-mail</dt>
                      <dd className="truncate text-sm text-gray-900">{p?.email ?? '—'}</dd>
                    </div>
                  </dl>

                  {/* Experiência */}
                  <div className="mt-4">
                    <p className="text-xs font-medium text-gray-500">Experiência anterior</p>
                    <p className="mt-1 rounded-lg bg-gray-50 p-3 text-sm leading-relaxed whitespace-pre-line text-gray-700">
                      {p?.experiencia?.trim() || 'Não informada.'}
                    </p>
                  </div>

                  {c.trilha_area && (
                    <p className="mt-3 text-xs text-gray-500">
                      Trilha: <span className="font-medium text-gray-700">{c.trilha_area}</span>
                    </p>
                  )}

                  {/* Ações */}
                  <div className="mt-5 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                    {wa ? (
                      <a
                        href={wa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                      >
                        Falar no WhatsApp
                      </a>
                    ) : (
                      <span className="rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm font-medium text-gray-400">
                        Telefone inválido para WhatsApp
                      </span>
                    )}

                    {p?.email && (
                      <a
                        href={`mailto:${p.email}?subject=${encodeURIComponent(
                          `Sua candidatura — ${vaga.titulo ?? 'vaga'}`
                        )}`}
                        className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                      >
                        Enviar e-mail
                      </a>
                    )}

                    {p?.curriculo_url && (
                      <a
                        href={p.curriculo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                      >
                        Ver currículo
                      </a>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        {/* Rodapé */}
        <div className="flex items-center justify-end border-t border-gray-200 px-6 py-4">
          <button onClick={onFechar} className={BTN_CONTORNO}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

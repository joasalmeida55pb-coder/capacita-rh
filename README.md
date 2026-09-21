# Capacita RH — piloto Balneário Camboriú

Plataforma de qualificação rápida e recolocação para trabalhadores de comércio,
hotelaria, restaurantes e serviços. Next.js 16 (App Router) + TypeScript +
Tailwind v4, com a tabela de **vagas** já integrada ao **Supabase**.

## Rodando o projeto

```bash
npm install
npm run dev     # http://localhost:3000
```

## ⚠️ Passo obrigatório antes de testar a integração

O schema criado originalmente no SQL Editor não tinha todas as colunas que o app
usa (`categoria`, `carga_horaria`, `trilha_requerida_id`, `aceita_capacitacao`,
`empresa_nome`, `empresa_local_id`) e a tabela `vagas` fica **invisível para a
publishable key** enquanto não houver policies de RLS.

Abra o **SQL Editor** do Supabase, cole o conteúdo de
[`supabase/schema.sql`](supabase/schema.sql) e rode uma vez. O arquivo:

1. adiciona as colunas que faltam (`add column if not exists`);
2. cria as policies de RLS de leitura pública e de insert (sandbox);
3. insere as 4 vagas de exemplo no banco, **apenas se a tabela estiver vazia**.

Sem esse passo o app não quebra — ele simplesmente exibe os dados de exemplo e
mostra um aviso amarelo indicando o motivo.

## Variáveis de ambiente

`.env.local` (já incluso; `.env.example` serve de modelo):

```
NEXT_PUBLIC_SUPABASE_URL=https://htgbhowjywbplugacjbj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

A publishable/anon key é pública por natureza — ela vai para o bundle do
navegador. Quem protege os dados é o RLS. **Nunca** coloque aqui a
`service_role` / secret key.

## Como a integração está montada

| Arquivo | Papel |
| --- | --- |
| `src/lib/supabase.ts` | Cria o client. Se as env vars faltarem, `supabase` é `null` e o app usa o mock. |
| `src/lib/vagas-service.ts` | Traduz linha do banco ↔ tipo `Vaga` e expõe `listarVagas`, `buscarVagaPorId`, `inserirVaga`. Nunca lança exceção: devolve `{ dados, erro }`. |
| `src/hooks/use-vagas.ts` | Lista usada por `/vagas`, `/candidato`, `/empresa` e `/admin`. Lê do banco, cai para o mock, e `publicarVaga` grava na tabela. |
| `src/hooks/use-vaga.ts` | Consulta uma vaga por ID (uuid) direto no banco, para `/vagas/[id]`. |
| `supabase/schema.sql` | Migração + policies. |

### Rotas

- `/vagas` — listagem pública (busca + filtro por setor), lê do Supabase.
- `/vagas/[id]` — detalhe, consulta por ID no banco.
- `/candidato` — vagas recomendadas + trilhas (vagas vêm do banco).
- `/empresa` — publica na tabela `vagas`; mostra a origem dos dados e um botão "Atualizar".
- `/admin` — painel do sandbox.

### Estratégia de fallback

Leitura: banco → se vier **0 registros** ou der erro, usa `vagasSeed`
(`src/lib/mock-data.ts`). A faixa colorida no topo das telas sempre diz qual das
duas fontes está em uso e, no caso do fallback, qual foi o erro.

Escrita: se o `insert` falhar (RLS, coluna faltando, rede), a vaga ainda é criada
no LocalStorage para o piloto continuar demonstrável, e o formulário mostra um
aviso âmbar com a mensagem de erro do Postgres.

## O que ainda NÃO está no banco

Contas de **empresa**, contas de **candidato**, sessão e trilhas concluídas
continuam no LocalStorage — a integração pedida cobria apenas as vagas.

Consequência prática: `vagas.empresa_id` (FK uuid → `empresas.id`) fica nulo,
porque os ids das empresas locais (`empresa-1737...`) não são uuid. O nome da
empresa vai em `empresa_nome` e o id local em `empresa_local_id`. Quando o
cadastro de empresas for para o banco, é só passar a preencher `empresa_id` e
remover essas duas colunas auxiliares.

As tabelas `candidatos` e `candidaturas` já existem no Supabase, mas ainda não
são usadas pelo app.

## Segurança (ler antes de publicar)

A policy de insert atual (`with check (true)`) libera **qualquer visitante** a
publicar vaga. Serve para o piloto; antes de ir a produção, troque por Supabase
Auth + `auth.uid()`. As senhas de empresa/candidato também estão em texto puro
no LocalStorage, o que só é aceitável enquanto isto for um sandbox.

-- ============================================================================
-- Capacita RH — colunas da trilha em `candidaturas`  (OPCIONAL)
-- ----------------------------------------------------------------------------
-- A página funciona sem isto: se estas colunas não existirem, o insert é
-- repetido sem elas e a candidatura entra na mesma — só sem o registo de qual
-- trilha foi concluída.
--
-- Correr no SQL Editor do Supabase para passar a guardar essa informação.
-- ============================================================================

alter table public.candidaturas
  add column if not exists trilha_concluida boolean not null default false;

alter table public.candidaturas
  add column if not exists trilha_area text;

comment on column public.candidaturas.trilha_concluida is
  'Candidato confirmou a conclusão dos módulos da trilha antes de se candidatar.';
comment on column public.candidaturas.trilha_area is
  'Área da trilha concluída (ex.: Comércio e Vendas, Garçom e Salão).';

-- Evita duas candidaturas do mesmo candidato à mesma vaga.
-- A página já verifica antes de gravar; isto fecha a porta do lado do banco.
create unique index if not exists candidaturas_vaga_candidato_unico
  on public.candidaturas (vaga_id, candidato_id);

-- Mesma ideia para não duplicar candidatos.
-- (índices parciais: só valem quando o campo está preenchido)
create unique index if not exists candidatos_cpf_unico
  on public.candidatos (cpf) where cpf is not null and cpf <> '';

create unique index if not exists candidatos_email_unico
  on public.candidatos (lower(email)) where email is not null and email <> '';

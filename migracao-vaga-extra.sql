-- ============================================================================
-- Capacita RH — vagas confidenciais, escala de trabalho e upload de currículo
-- ----------------------------------------------------------------------------
-- A página funciona sem isto: `vagas-service.ts` detecta coluna inexistente e
-- repete a consulta/gravação sem `confidencial`/`escala`. O upload de
-- currículo em /vagas/[id] e no perfil do candidato também não bloqueia a
-- candidatura se o bucket `curriculos` ainda não existir — só não anexa o
-- arquivo.
--
-- Correr no SQL Editor do Supabase para ativar os recursos por completo.
-- ============================================================================

-- 1. Vaga confidencial (oculta o nome da empresa na listagem pública) e escala.
alter table public.vagas
  add column if not exists confidencial boolean not null default false;

alter table public.vagas
  add column if not exists escala text;

comment on column public.vagas.confidencial is
  'Quando true, a listagem pública mostra "Empresa Confidencial" no lugar do nome da empresa.';
comment on column public.vagas.escala is
  'Escala de trabalho da vaga (ex.: 6x1, 5x2, 12x36).';

-- 2. Bucket de armazenamento para currículos (PDF/DOCX) enviados por candidatos.
insert into storage.buckets (id, name, public)
values ('curriculos', 'curriculos', true)
on conflict (id) do nothing;

-- Qualquer pessoa pode enviar um currículo (o formulário público de
-- candidatura não exige login) e o arquivo fica com leitura pública, para a
-- empresa conseguir abrir o link salvo em `candidatos.curriculo_url`.
create policy if not exists "Envio publico de curriculos"
  on storage.objects for insert
  to public
  with check (bucket_id = 'curriculos');

create policy if not exists "Leitura publica de curriculos"
  on storage.objects for select
  to public
  using (bucket_id = 'curriculos');

create policy if not exists "Substituicao publica de curriculos"
  on storage.objects for update
  to public
  using (bucket_id = 'curriculos')
  with check (bucket_id = 'curriculos');

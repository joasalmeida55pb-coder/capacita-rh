-- ============================================================================
-- Capacita RH — RLS (Row Level Security)
-- ----------------------------------------------------------------------------
-- HOJE as quatro tabelas estão UNRESTRICTED. Como a chave anon vai no browser,
-- qualquer pessoa com o DevTools aberto consegue ler e escrever em todas elas,
-- esteja autenticada ou não. O ecrã de login não muda isso: é uma porta com
-- fechadura numa parede sem tijolos.
--
-- Corra este script no SQL Editor do Supabase DEPOIS de testar o login.
-- Pressupõe que `empresas.id` é igual ao `auth.uid()` do utilizador — é o que
-- o page.tsx faz ao criar a empresa no primeiro acesso.
--
-- ATENÇÃO às empresas já existentes: as linhas criadas antes do Auth têm um id
-- que não corresponde a nenhum utilizador, e passam a ficar inacessíveis.
-- Alinhe-as antes (ver o bloco no fim) ou recadastre-as.
-- ============================================================================

-- ------------------------------- empresas -----------------------------------
alter table public.empresas enable row level security;

create policy "empresa lê o próprio registo"
  on public.empresas for select
  using (auth.uid() = id);

create policy "empresa cria o próprio registo"
  on public.empresas for insert
  with check (auth.uid() = id);

create policy "empresa atualiza o próprio registo"
  on public.empresas for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- --------------------------------- vagas ------------------------------------
alter table public.vagas enable row level security;

-- Vagas ativas são públicas: é o que os candidatos veem no site.
create policy "vagas ativas são públicas"
  on public.vagas for select
  using (status = 'ativa' or auth.uid() = empresa_id);

create policy "empresa cria as próprias vagas"
  on public.vagas for insert
  with check (auth.uid() = empresa_id);

create policy "empresa atualiza as próprias vagas"
  on public.vagas for update
  using (auth.uid() = empresa_id)
  with check (auth.uid() = empresa_id);

create policy "empresa apaga as próprias vagas"
  on public.vagas for delete
  using (auth.uid() = empresa_id);

-- ----------------------------- candidaturas ---------------------------------
alter table public.candidaturas enable row level security;

create policy "empresa vê candidaturas das suas vagas"
  on public.candidaturas for select
  using (
    exists (
      select 1 from public.vagas v
      where v.id = candidaturas.vaga_id
        and v.empresa_id = auth.uid()
    )
  );

-- O candidato NÃO se autentica neste piloto: candidata-se direto na página
-- pública da vaga. Por isso a inserção tem de ser permitida a anon.
-- Insert aberto, leitura fechada: ninguém lê as candidaturas dos outros.
create policy "qualquer pessoa pode candidatar-se"
  on public.candidaturas for insert
  to anon, authenticated
  with check (true);

-- ----------------------------- candidatos -----------------------------------
alter table public.candidatos enable row level security;

-- O formulário público precisa de criar o candidato e de o atualizar quando
-- ele se candidata outra vez. Leitura fica reservada às empresas que têm uma
-- candidatura desse candidato numa vaga sua.
create policy "qualquer pessoa pode criar o seu cadastro"
  on public.candidatos for insert
  to anon, authenticated
  with check (true);

create policy "qualquer pessoa pode atualizar o seu cadastro"
  on public.candidatos for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "empresa vê os candidatos das suas vagas"
  on public.candidatos for select
  using (
    exists (
      select 1
        from public.candidaturas c
        join public.vagas v on v.id = c.vaga_id
       where c.candidato_id = candidatos.id
         and v.empresa_id = auth.uid()
    )
  );

-- NOTA HONESTA sobre as duas políticas de insert/update acima: com a chave
-- anon no browser, qualquer pessoa consegue criar ou alterar uma linha em
-- `candidatos`. É o preço de ter candidatura sem login. Para o piloto é
-- aceitável; para produção, mova a gravação para uma Route Handler do Next
-- (server-side, com a service_role key) ou para uma Edge Function, e retire
-- estas duas políticas.

-- ============================================================================
-- Alinhar uma empresa antiga a um utilizador do Auth (correr uma vez, por
-- empresa, ANTES de ativar o RLS). Substitua os dois valores.
-- ============================================================================
-- update public.vagas
--    set empresa_id = '<uuid-do-utilizador-no-auth>'
--  where empresa_id = '<uuid-antigo-da-empresa>';
--
-- update public.empresas
--    set id = '<uuid-do-utilizador-no-auth>'
--  where id = '<uuid-antigo-da-empresa>';

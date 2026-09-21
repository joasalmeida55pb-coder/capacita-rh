-- =============================================================================
-- Capacita RH — ajustes de schema + RLS necessários para a integração
-- Rode este arquivo UMA VEZ no SQL Editor do Supabase (Run / Ctrl+Enter).
-- Ele é idempotente: pode ser executado de novo sem quebrar nada.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Colunas que o app usa e que não existiam na criação original da tabela
--    `vagas`. Sem elas o insert de /empresa falha.
--
--    Contexto: as contas de empresa ainda vivem no LocalStorage do navegador
--    (ids do tipo "empresa-1737...", que NÃO são uuid). Por isso a vaga guarda
--    o nome da empresa em `empresa_nome` e o id local em `empresa_local_id`,
--    deixando `empresa_id` (FK uuid -> empresas.id) nulo até que o cadastro de
--    empresas também seja migrado para o banco.
-- -----------------------------------------------------------------------------
alter table public.vagas
  add column if not exists empresa_nome        text,
  add column if not exists empresa_local_id    text,
  add column if not exists categoria           text,
  add column if not exists carga_horaria       text,
  add column if not exists trilha_requerida_id text,
  add column if not exists aceita_capacitacao  boolean not null default true;

-- `modalidade` e `regime` foram criados como NOT NULL sem default; damos um
-- default para que inserts parciais não quebrem.
alter table public.vagas alter column modalidade set default 'Presencial';
alter table public.vagas alter column regime     set default 'Temporário';

create index if not exists vagas_status_idx     on public.vagas (status);
create index if not exists vagas_created_at_idx on public.vagas (created_at desc);

-- -----------------------------------------------------------------------------
-- 2. Row Level Security
--
--    IMPORTANTE: com a publishable (anon) key, nada é lido nem gravado se o RLS
--    estiver ligado e não houver policy. Estas policies são de SANDBOX/piloto:
--    leitura pública das vagas ativas e inserção liberada para anônimos.
--    Antes de ir a produção, troque o insert por uma policy baseada em
--    auth.uid() (Supabase Auth) — hoje qualquer visitante pode publicar vaga.
-- -----------------------------------------------------------------------------
alter table public.vagas enable row level security;

drop policy if exists "vagas: leitura publica"  on public.vagas;
create policy "vagas: leitura publica"
  on public.vagas for select
  to anon, authenticated
  using (true);

drop policy if exists "vagas: insert sandbox" on public.vagas;
create policy "vagas: insert sandbox"
  on public.vagas for insert
  to anon, authenticated
  with check (true);

-- -----------------------------------------------------------------------------
-- 3. (Opcional) Vagas de exemplo no banco, para validar a leitura real.
--    Só insere se a tabela estiver vazia.
-- -----------------------------------------------------------------------------
insert into public.vagas
  (titulo, empresa_nome, categoria, bairro, cidade, regime, modalidade,
   carga_horaria, salario, descricao, requisitos, trilha_requerida_id,
   aceita_capacitacao, status)
select * from (values
  ('Recepcionista de Hotel', 'Hotel Marazul', 'Hotelaria', 'Centro',
   'Balneário Camboriú', 'Temporário', 'Presencial', '44h/semana',
   'R$ 1.850,00 + gorjetas',
   'Recepção e check-in/check-out de hóspedes durante a alta temporada, com foco em atendimento cordial e resolução rápida de solicitações.',
   E'Boa comunicação e simpatia no atendimento\nDisponibilidade para trabalhar em escala, incluindo finais de semana\nNoções básicas de inglês ou espanhol são um diferencial',
   'trilha-turismo-hospitalidade', true, 'ativa'),
  ('Garçom / Garçonete', 'Restaurante Sabor & Mar', 'Restaurante', 'Praia Central',
   'Balneário Camboriú', 'Temporário', 'Presencial', '40h/semana',
   'R$ 1.600,00 + gorjetas',
   'Atendimento em salão, anotação de pedidos e suporte ao cliente em restaurante à beira-mar durante a temporada de verão.',
   E'Experiência prévia em salão é desejável, mas não obrigatória\nBoa comunicação e trabalho em equipe\nDisponibilidade para turnos noturnos e fins de semana',
   'trilha-garcom-salao', true, 'ativa'),
  ('Vendedor(a) de Loja', 'Boutique Balneário', 'Comércio', 'Barra Sul',
   'Balneário Camboriú', 'Meio período', 'Presencial', '30h/semana',
   'R$ 1.412,00 + comissão',
   'Atendimento ao cliente, operação de caixa (PDV) e organização de vitrine em loja de roupas e acessórios de praia.',
   E'Facilidade de comunicação e interesse em moda/varejo\nDisponibilidade de horário flexível\nNão é necessária experiência prévia',
   'trilha-comercio-vendas', true, 'ativa'),
  ('Camareira(o)', 'Hotel Vista Praia', 'Hotelaria', 'Praia dos Amores',
   'Balneário Camboriú', 'Temporário', 'Presencial', '40h/semana',
   'R$ 1.550,00',
   'Organização e limpeza de quartos e áreas comuns, seguindo os padrões de qualidade do hotel durante a alta temporada.',
   E'Atenção a detalhes e organização\nDisponibilidade para trabalhar em escala, incluindo finais de semana\nExperiência prévia é um diferencial, mas não obrigatória',
   'trilha-turismo-hospitalidade', false, 'ativa')
) as seed
where not exists (select 1 from public.vagas);

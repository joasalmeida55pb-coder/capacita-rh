-- Capacita RH — empresas de demonstração.
-- Alternativa recomendada ao seed pelo browser: corra uma vez no SQL Editor.
-- Idempotente graças à constraint UNIQUE em empresas.email.

insert into public.empresas (nome, email, telefone, setor) values
  ('Hotel Marambaia Cabeçudas', 'rh@marambaia.demo.capacita.local', '(47) 3000-0001', 'Hotelaria'),
  ('Restaurante Beira-Mar',     'rh@beiramar.demo.capacita.local',  '(47) 3000-0002', 'Restaurantes'),
  ('Supermercado Centro BC',    'rh@centrobc.demo.capacita.local',  '(47) 3000-0003', 'Comércio')
on conflict (email) do nothing;

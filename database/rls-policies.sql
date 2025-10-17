-- 🧱 SQL – Políticas RLS para a tabela boletos_inadimplentes

-- Ativar Row Level Security (RLS)
alter table public.boletos_inadimplentes enable row level security;

-- Remover políticas antigas (caso existam)
drop policy if exists "Permitir leitura autenticados" on public.boletos_inadimplentes;
drop policy if exists "Permitir escrita autenticados" on public.boletos_inadimplentes;
drop policy if exists "Permitir atualização autenticados" on public.boletos_inadimplentes;
drop policy if exists "Permitir leitura pública (opcional)" on public.boletos_inadimplentes;

-- Política 1: permitir leitura apenas a usuários autenticados
create policy "Permitir leitura autenticados"
on public.boletos_inadimplentes
for select
to authenticated
using (true);

-- Política 2: permitir inserção apenas a usuários autenticados
create policy "Permitir escrita autenticados"
on public.boletos_inadimplentes
for insert
to authenticated
with check (true);

-- Política 3: permitir atualização apenas a usuários autenticados
create policy "Permitir atualização autenticados"
on public.boletos_inadimplentes
for update
to authenticated
using (true)
with check (true);

-- (Opcional) Política 4: permitir leitura pública (se quiser exibir relatórios sem login)
-- ⚠️ Use com cuidado — só habilite se quiser um painel público read-only.
-- create policy "Permitir leitura pública (opcional)"
-- on public.boletos_inadimplentes
-- for select
-- to anon
-- using (true);

-- Confirmar ativação
comment on table public.boletos_inadimplentes is
'Controle de boletos em aberto e inadimplência condominial — acesso restrito a usuários autenticados via Supabase Auth.';


-- 🧱 SQL – Políticas RLS para a tabela import_batches

-- Ativar RLS
alter table if exists public.import_batches enable row level security;

-- Remover políticas antigas (se houver)
drop policy if exists "Permitir leitura autenticados (batches)" on public.import_batches;
drop policy if exists "Permitir escrita autenticados (batches)" on public.import_batches;
drop policy if exists "Permitir atualização autenticados (batches)" on public.import_batches;

-- Leitura para autenticados
create policy "Permitir leitura autenticados (batches)"
on public.import_batches
for select
to authenticated
using (true);

-- Inserção para autenticados
create policy "Permitir escrita autenticados (batches)"
on public.import_batches
for insert
to authenticated
with check (true);

-- Atualização para autenticados
create policy "Permitir atualização autenticados (batches)"
on public.import_batches
for update
to authenticated
using (true)
with check (true);






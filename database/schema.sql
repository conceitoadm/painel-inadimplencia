-- 🏢 Sistema de Cobrança de Inadimplentes
-- Script de criação das tabelas no Supabase

-- Criar extensão UUID se não existir
create extension if not exists "uuid-ossp";

-- Tabela principal: boletos_inadimplentes
create table if not exists public.boletos_inadimplentes (
  id uuid primary key default uuid_generate_v4(),
  referencia int4 not null,
  condominio text not null,
  cnpj text,
  nome_pagador text,
  unidade text,
  doc text not null unique,
  complemento text,
  vencimento date,
  vlr_original numeric,
  multa numeric,
  juros numeric,
  vlr_total numeric,
  status text,
  data_importacao date not null default now(),
  updated_at timestamptz not null default now(),
  quitado boolean not null default false,
  -- Histórico por lote
  batch_id uuid,
  imported_at timestamptz not null default now(),
  ativo boolean not null default true
);

-- Índices para otimização de performance
create index if not exists idx_boletos_ref on public.boletos_inadimplentes (referencia);
create index if not exists idx_boletos_venc on public.boletos_inadimplentes (vencimento);
create index if not exists idx_boletos_doc on public.boletos_inadimplentes (doc);
create index if not exists idx_boletos_quitado on public.boletos_inadimplentes (quitado);
create index if not exists idx_boletos_referencia_unidade on public.boletos_inadimplentes (referencia, unidade);
create index if not exists idx_boletos_batch on public.boletos_inadimplentes (batch_id);
create index if not exists idx_boletos_ativo on public.boletos_inadimplentes (ativo);

-- Função para atualizar o campo updated_at automaticamente
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
drop trigger if exists update_boletos_updated_at on public.boletos_inadimplentes;
create trigger update_boletos_updated_at
  before update on public.boletos_inadimplentes
  for each row
  execute function update_updated_at_column();

-- Comentários na tabela
comment on table public.boletos_inadimplentes is
'Controle de boletos em aberto e inadimplência condominial — acesso restrito a usuários autenticados via Supabase Auth.';

comment on column public.boletos_inadimplentes.id is 'Identificador único do registro';
comment on column public.boletos_inadimplentes.referencia is 'Código numérico do condomínio';
comment on column public.boletos_inadimplentes.condominio is 'Razão social do condomínio';
comment on column public.boletos_inadimplentes.doc is 'Identificador único do boleto (chave única)';
comment on column public.boletos_inadimplentes.quitado is 'Indica se o boleto foi quitado (não aparece mais nas importações)';
comment on column public.boletos_inadimplentes.data_importacao is 'Data da última importação do boleto';

-- Tabela de metadados de importações (lotes)
create table if not exists public.import_batches (
  id uuid primary key default uuid_generate_v4(),
  tipo text not null check (tipo in ('reset','incremental')),
  total_registros int4,
  criado_em timestamptz not null default now()
);

comment on table public.import_batches is 'Metadados de importações em lote (histórico)';






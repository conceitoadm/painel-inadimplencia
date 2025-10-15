import { createClient } from '@supabase/supabase-js'
import { checkEnvironmentVariables, getEnvironmentInfo } from './env'

// Verificar variáveis de ambiente
if (typeof window !== 'undefined') {
  console.log('🔍 Verificando configuração do Supabase...')
  console.log('📊 Info do ambiente:', getEnvironmentInfo())
  
  if (!checkEnvironmentVariables()) {
    console.error('❌ Configuração do Supabase incompleta!')
  }
}

// Verificar se as variáveis de ambiente estão definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL não está definida. Configure no Vercel.')
}

if (!supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY não está definida. Configure no Vercel.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client para operações server-side (com service role)
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceRoleKey) {
  console.warn('SUPABASE_SERVICE_ROLE_KEY não está definida - funcionalidades admin podem não funcionar')
}

export const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

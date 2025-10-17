import { NextResponse } from 'next/server'

export async function GET() {
  // Verificar variáveis de ambiente (apenas para debug)
  const envCheck = {
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV
  }

  console.log('🔍 Verificação de variáveis de ambiente:', envCheck)

  return NextResponse.json({
    status: 'ok',
    environment: envCheck,
    message: 'Verificação de variáveis de ambiente'
  })
}






// Verificação das variáveis de ambiente
export function checkEnvironmentVariables() {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]

  const missingVars = requiredVars.filter(varName => !process.env[varName])

  if (missingVars.length > 0) {
    console.error('❌ Variáveis de ambiente ausentes:', missingVars)
    console.error('🔧 Configure as variáveis no Vercel:')
    console.error('   - NEXT_PUBLIC_SUPABASE_URL')
    console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY')
    console.error('   - SUPABASE_SERVICE_ROLE_KEY (opcional)')
    return false
  }

  console.log('✅ Variáveis de ambiente configuradas corretamente')
  return true
}

// Valores das variáveis (para debug)
export function getEnvironmentInfo() {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    nodeEnv: process.env.NODE_ENV
  }
}






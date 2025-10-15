"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { LogIn, Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@painel.com')
  const [password, setPassword] = useState('admin123')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [envStatus, setEnvStatus] = useState<any>(null)
  const router = useRouter()

  // Verificar status das variáveis de ambiente
  React.useEffect(() => {
    const checkEnv = async () => {
      try {
        const response = await fetch('/api/env-check')
        const data = await response.json()
        setEnvStatus(data.environment)
        console.log('🔍 Status das variáveis:', data.environment)
      } catch (error) {
        console.error('❌ Erro ao verificar variáveis:', error)
      }
    }
    checkEnv()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      setError('Preencha todos os campos')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('🔐 Tentando fazer login...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.log('❌ Erro no login:', error.message)
        
        // Se usuário não existe, tentar criar
        if (error.message.includes('Invalid login credentials') || error.message.includes('User not found')) {
          console.log('👤 Usuário não existe, tentando criar...')
          await handleCreateUser()
          return
        }
        
        setError(error.message || 'Erro ao fazer login')
        return
      }

      console.log('✅ Login realizado com sucesso!')
      toast.success('Login realizado com sucesso!')
      router.push('/dashboard')
    } catch (error) {
      console.error('❌ Erro no login:', error)
      setError('Erro inesperado ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUser = async () => {
    setIsCreatingUser(true)
    setError(null)

    try {
      console.log('👤 Criando usuário...')
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined // Não redirecionar por email
        }
      })

      if (error) {
        console.error('❌ Erro ao criar usuário:', error)
        setError(`Erro ao criar usuário: ${error.message}`)
        return
      }

      if (data.user) {
        console.log('✅ Usuário criado com sucesso!')
        toast.success('Usuário criado! Fazendo login...')
        
        // Tentar login novamente
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (loginError) {
          setError('Usuário criado, mas erro no login. Tente novamente.')
          return
        }

        router.push('/dashboard')
      }
    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error)
      setError('Erro inesperado ao criar usuário')
    } finally {
      setIsCreatingUser(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Painel de Inadimplência
          </CardTitle>
          <CardDescription className="text-gray-600">
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || isCreatingUser}
            >
              {isCreatingUser ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Criando usuário...
                </div>
              ) : isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Entrando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Entrar
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="font-medium text-blue-800">Credenciais Padrão:</p>
              <p className="text-blue-700">Email: admin@painel.com</p>
              <p className="text-blue-700">Senha: admin123</p>
              <p className="text-xs text-blue-600 mt-1">O sistema criará o usuário automaticamente</p>
            </div>
            
            {envStatus && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4 text-left">
                <p className="font-medium text-gray-800 mb-2">Status das Variáveis:</p>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${envStatus.hasSupabaseUrl ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span>NEXT_PUBLIC_SUPABASE_URL: {envStatus.hasSupabaseUrl ? '✅' : '❌'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${envStatus.hasAnonKey ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span>NEXT_PUBLIC_SUPABASE_ANON_KEY: {envStatus.hasAnonKey ? '✅' : '❌'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${envStatus.hasServiceKey ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                    <span>SUPABASE_SERVICE_ROLE_KEY: {envStatus.hasServiceKey ? '✅' : '⚠️'}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Ambiente: {envStatus.nodeEnv} | Vercel: {envStatus.vercelEnv}
                  </div>
                </div>
              </div>
            )}
            
            <p>Sistema de gestão condominial</p>
            <p className="font-medium">Conceito Administração de Condomínios</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

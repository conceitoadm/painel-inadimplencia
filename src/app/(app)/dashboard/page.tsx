"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { SummaryCards } from '@/components/SummaryCards'
import { UploadFile } from '@/components/UploadFile'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  LogOut,
  Upload,
  TrendingUp,
  Building2,
  Users,
  FileText,
  Settings
} from 'lucide-react'
import { BoletoData } from '@/lib/calc'
import type { User } from '@supabase/supabase-js'

interface MetricasInadimplencia {
  totalUnidades: number
  unidadesInadimplentes: number
  percentualInadimplencia: number
  valorTotalInadimplente: number
  quantidadeBoletosAbertos: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [metricas, setMetricas] = useState<MetricasInadimplencia | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [ultimaImportacao, setUltimaImportacao] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Verificar se estamos no cliente
    if (typeof window !== 'undefined') {
      checkUser()
      loadMetrics()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkUser = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Erro ao verificar sessão:', error)
        setError('Erro de autenticação')
        return
      }
      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)
    } catch (error) {
      console.error('Erro ao verificar usuário:', error)
      setError('Erro ao carregar dados do usuário')
    }
  }

  const loadMetrics = async () => {
    try {
      console.log('📊 Carregando métricas...')
      const response = await fetch('/api/metrics')
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Métricas carregadas:', data)
        setMetricas(data.metricas)
        setUltimaImportacao(data.ultimaImportacao)
        
        // Se não há dados, não é erro - é estado inicial
        if (data.message && data.message.includes('Tabela ainda não foi criada')) {
          console.log('📋 Sistema pronto para primeiro upload')
        }
      } else {
        console.error('❌ Erro na API de métricas:', response.status)
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Detalhes do erro:', errorData)
        setError('Erro ao carregar métricas')
      }
    } catch (error) {
      console.error('❌ Erro ao carregar métricas:', error)
      setError('Erro ao carregar dados do dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    toast.success('Logout realizado com sucesso')
  }

  const handleDataParsed = (data: BoletoData[]) => {
    console.log('Dados analisados:', data.length, 'boletos')
  }

  const handleUpload = async (data: BoletoData[]) => {
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({ data }),
      })

      if (!response.ok) {
        throw new Error('Erro no upload')
      }

      const result = await response.json()
      toast.success(result.message)
      loadMetrics() // Recarregar métricas após upload
    } catch (error) {
      toast.error('Erro ao fazer upload dos dados')
      console.error('Erro no upload:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro no Sistema</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tentar Novamente
            </button>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Ir para Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Painel de Inadimplência
                </h1>
                <p className="text-sm text-gray-500">
                  Conceito Administração de Condomínios
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                {user?.email}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload de Dados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Summary Cards */}
            <SummaryCards
              metricas={metricas}
              isLoading={false}
              ultimaImportacao={ultimaImportacao}
            />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Ações Rápidas
                </CardTitle>
                <CardDescription>
                  Acesso rápido às principais funcionalidades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2"
                    onClick={() => {
                      const uploadTab = document.querySelector('[value="upload"]') as HTMLElement
                      uploadTab?.click()
                    }}
                  >
                    <Upload className="h-6 w-6" />
                    <span>Fazer Upload</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2"
                    disabled
                  >
                    <FileText className="h-6 w-6" />
                    <span>Relatórios</span>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2"
                    disabled
                  >
                    <Users className="h-6 w-6" />
                    <span>Configurações</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
                <CardDescription>
                  Últimas ações realizadas no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ultimaImportacao ? (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-800">
                          Última importação realizada
                        </p>
                        <p className="text-xs text-green-600">
                          {ultimaImportacao}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">
                          Nenhuma importação realizada ainda
                        </p>
                        <p className="text-xs text-gray-500">
                          Faça o primeiro upload para começar
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <UploadFile
                onDataParsed={handleDataParsed}
                onUpload={handleUpload}
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign, Building, Users, FileText } from 'lucide-react'
import { formatCurrency, formatPercentage } from '@/lib/format'

interface MetricasInadimplencia {
  totalUnidades: number
  unidadesInadimplentes: number
  percentualInadimplencia: number
  valorTotalInadimplente: number
  quantidadeBoletosAbertos: number
}

interface SummaryCardsProps {
  metricas: MetricasInadimplencia | null
  isLoading?: boolean
  ultimaImportacao?: string | null
}

export function SummaryCards({ metricas, isLoading, ultimaImportacao }: SummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!metricas) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Valor Total em Aberto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 0,00</div>
            <p className="text-xs text-muted-foreground">Nenhum dado disponível</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Taxa de Inadimplência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0,0%</div>
            <p className="text-xs text-muted-foreground">Nenhum dado disponível</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building className="h-4 w-4" />
              Unidades Inadimplentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">de 0 unidades</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Boletos em Aberto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Última importação: Nunca</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const taxaVariacao = 0 // Por enquanto sem cálculo de variação

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Valor Total em Aberto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metricas.valorTotalInadimplente)}</div>
          {taxaVariacao !== 0 && (
            <div className="flex items-center gap-1 mt-1">
              {taxaVariacao > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={`text-xs ${taxaVariacao > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatPercentage(Math.abs(taxaVariacao))} vs período anterior
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Users className="h-4 w-4" />
            Taxa de Inadimplência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPercentage(metricas.percentualInadimplencia)}</div>
          <p className="text-xs text-muted-foreground">
            {metricas.unidadesInadimplentes} de {metricas.totalUnidades} unidades
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Building className="h-4 w-4" />
            Unidades Inadimplentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metricas.unidadesInadimplentes.toLocaleString('pt-BR')}</div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={metricas.unidadesInadimplentes > 0 ? "destructive" : "secondary"}>
              {metricas.unidadesInadimplentes > 0 ? 'Ativo' : 'OK'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Boletos em Aberto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metricas.quantidadeBoletosAbertos.toLocaleString('pt-BR')}</div>
          <p className="text-xs text-muted-foreground">
            Última importação: {ultimaImportacao || 'Nunca'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}






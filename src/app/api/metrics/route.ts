import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { calcularMetricasInadimplencia, BoletoRecord } from '@/lib/calc'
import { formatDate } from '@/lib/format'

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const referencias = searchParams.get('refs')?.split(',').filter(Boolean) || []

    // Construir query base
    let query = supabase
      .from('boletos_inadimplentes')
      .select('*')
      .eq('quitado', false)

    // Filtrar por referências específicas se fornecidas
    if (referencias.length > 0) {
      query = query.in('referencia', referencias.map(Number))
    }

    const { data: boletos, error } = await query

    if (error) {
      console.error('Erro ao buscar boletos:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    if (!boletos || boletos.length === 0) {
      return NextResponse.json({
        metricas: {
          totalUnidades: 0,
          unidadesInadimplentes: 0,
          percentualInadimplencia: 0,
          valorTotalInadimplente: 0,
          quantidadeBoletosAbertos: 0
        },
        ultimaImportacao: null
      })
    }

    // Calcular métricas
    const boletosRecord: BoletoRecord[] = boletos.map(b => ({
      referencia: b.referencia,
      condominio: b.condominio,
      cnpj: b.cnpj,
      nome_pagador: b.nome_pagador,
      unidade: b.unidade,
      doc: b.doc,
      complemento: b.complemento,
      vencimento: b.vencimento,
      vlr_original: Number(b.vlr_original),
      multa: b.multa ? Number(b.multa) : undefined,
      juros: b.juros ? Number(b.juros) : undefined,
      vlr_total: Number(b.vlr_total),
      status: b.status,
      data_importacao: b.data_importacao,
      updated_at: b.updated_at,
      quitado: b.quitado
    }))

    const metricas = calcularMetricasInadimplencia(boletosRecord)

    // Buscar data da última importação
    const { data: ultimaImportacao } = await supabase
      .from('boletos_inadimplentes')
      .select('data_importacao')
      .order('data_importacao', { ascending: false })
      .limit(1)
      .single()

    return NextResponse.json({
      metricas,
      ultimaImportacao: ultimaImportacao?.data_importacao ? formatDate(ultimaImportacao.data_importacao) : null
    })

  } catch (error) {
    console.error('Erro na API de métricas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

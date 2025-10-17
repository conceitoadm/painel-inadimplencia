import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'
import { BoletoData, BoletoRecord } from '@/lib/calc'

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Espera JSON no formato: { data: BoletoData[] }
    const contentType = request.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type inválido. Use application/json' },
        { status: 415 }
      )
    }

    const body = await request.json().catch(() => null) as { data?: BoletoData[] } | null
    const boletosData = body?.data

    if (!boletosData || boletosData.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum dado válido enviado' },
        { status: 400 }
      )
    }

    // Processar boletos
    const hoje = new Date().toISOString().split('T')[0]

    let inseridos = 0
    let atualizados = 0
    let marcadosQuitados = 0

    for (const boletoData of boletosData) {
      const boletoRecord: BoletoRecord = {
        ...boletoData,
        data_importacao: hoje,
        quitado: false,
        updated_at: new Date().toISOString()
      }

      // Verificar se o boleto já existe
      const { data: boletoExistente } = await supabaseAdmin
        .from('boletos_inadimplentes')
        .select('*')
        .eq('doc', boletoData.doc)
        .single()

      if (boletoExistente) {
        // Atualizar boleto existente
        const { error } = await supabaseAdmin
          .from('boletos_inadimplentes')
          .update({
            referencia: boletoRecord.referencia,
            condominio: boletoRecord.condominio,
            cnpj: boletoRecord.cnpj,
            nome_pagador: boletoRecord.nome_pagador,
            unidade: boletoRecord.unidade,
            complemento: boletoRecord.complemento,
            vencimento: boletoRecord.vencimento,
            vlr_original: boletoRecord.vlr_original,
            multa: boletoRecord.multa,
            juros: boletoRecord.juros,
            vlr_total: boletoRecord.vlr_total,
            status: boletoRecord.status,
            data_importacao: hoje,
            quitado: false,
            updated_at: new Date().toISOString()
          })
          .eq('doc', boletoData.doc)

        if (error) {
          console.error(`Erro ao atualizar boleto ${boletoData.doc}:`, error)
          continue
        }

        atualizados++
      } else {
        // Inserir novo boleto
        const { error } = await supabaseAdmin
          .from('boletos_inadimplentes')
          .insert(boletoRecord)

        if (error) {
          console.error(`Erro ao inserir boleto ${boletoData.doc}:`, error)
          continue
        }

        inseridos++
      }
    }

    // Marcar como quitados boletos que não estão na nova importação
    // Buscar todos os boletos existentes
    const { data: boletosExistentes } = await supabaseAdmin
      .from('boletos_inadimplentes')
      .select('doc, quitado')
      .eq('quitado', false)

    if (boletosExistentes) {
      const docsNovos = new Set(boletosData.map(b => b.doc))
      const boletosParaMarcarQuitados = boletosExistentes.filter(
        boleto => !boleto.quitado && !docsNovos.has(boleto.doc)
      )

      for (const boleto of boletosParaMarcarQuitados) {
        await supabaseAdmin
          .from('boletos_inadimplentes')
          .update({ quitado: true, status: 'Quitado', updated_at: new Date().toISOString() })
          .eq('doc', boleto.doc)

        marcadosQuitados++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Importação concluída: ${inseridos} inseridos, ${atualizados} atualizados, ${marcadosQuitados} marcados como quitados`,
      stats: {
        inseridos,
        atualizados,
        marcadosQuitados,
        total: boletosData.length
      }
    })

  } catch (error) {
    console.error('Erro no upload:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

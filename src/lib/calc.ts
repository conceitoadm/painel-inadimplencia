/**
 * Regras de negócio e cálculos para inadimplência
 */

export interface BoletoData {
  referencia: number
  condominio: string
  cnpj?: string
  nome_pagador: string
  unidade: string
  doc: string
  complemento?: string
  vencimento: string
  vlr_original: number
  multa?: number
  juros?: number
  vlr_total: number
  status?: string
}

export interface BoletoRecord extends BoletoData {
  id?: string
  data_importacao: string
  updated_at?: string
  quitado: boolean
}

/**
 * Calcula multa (2% sobre o valor original)
 */
export function calcularMulta(vlrOriginal: number): number {
  return vlrOriginal * 0.02
}

/**
 * Calcula juros (1% ao mês = 0,033% ao dia)
 */
export function calcularJuros(vlrOriginal: number, diasAtraso: number): number {
  const taxaMensal = 0.01 // 1% ao mês
  const taxaDiaria = taxaMensal / 30 // Aproximadamente 0,033% ao dia
  return vlrOriginal * taxaDiaria * diasAtraso
}

/**
 * Calcula valor total considerando multa e juros
 */
export function calcularValorTotal(
  vlrOriginal: number,
  multa?: number,
  juros?: number
): number {
  const multaCalculada = multa ?? calcularMulta(vlrOriginal)
  const jurosCalculado = juros ?? 0
  return vlrOriginal + multaCalculada + jurosCalculado
}

/**
 * Calcula dias de atraso baseado na data de vencimento
 */
export function calcularDiasAtraso(dataVencimento: string): number {
  const hoje = new Date()
  const vencimento = new Date(dataVencimento)
  const diffTime = hoje.getTime() - vencimento.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Verifica se o boleto está em atraso (> 30 dias)
 */
export function isAtrasadoMaisDe30Dias(dataVencimento: string): boolean {
  const diasAtraso = calcularDiasAtraso(dataVencimento)
  return diasAtraso > 30
}

/**
 * Calcula métricas de inadimplência para um conjunto de boletos
 */
export interface MetricasInadimplencia {
  totalUnidades: number
  unidadesInadimplentes: number
  percentualInadimplencia: number
  valorTotalInadimplente: number
  quantidadeBoletosAbertos: number
}

export function calcularMetricasInadimplencia(boletos: BoletoRecord[]): MetricasInadimplencia {
  // Filtrar apenas boletos em aberto (> 30 dias de atraso)
  const boletosAbertos = boletos.filter(boleto =>
    !boleto.quitado && isAtrasadoMaisDe30Dias(boleto.vencimento)
  )

  // Calcular unidades únicas inadimplentes
  const unidadesInadimplentes = new Set(
    boletosAbertos.map(b => `${b.referencia}-${b.unidade}`)
  ).size

  // Calcular total de unidades (deduplicado)
  const todasUnidades = new Set(
    boletos.map(b => `${b.referencia}-${b.unidade}`)
  ).size

  const valorTotalInadimplente = boletosAbertos.reduce(
    (sum, boleto) => sum + boleto.vlr_total,
    0
  )

  return {
    totalUnidades: todasUnidades,
    unidadesInadimplentes,
    percentualInadimplencia: todasUnidades > 0 ? (unidadesInadimplentes / todasUnidades) * 100 : 0,
    valorTotalInadimplente,
    quantidadeBoletosAbertos: boletosAbertos.length
  }
}

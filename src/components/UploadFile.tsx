"use client"

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import * as XLSX from 'xlsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface BoletoData {
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

interface UploadFileProps {
  onDataParsed: (data: BoletoData[]) => void
  onUpload: (data: BoletoData[]) => Promise<void>
}

const REQUIRED_COLUMNS = [
  'Referência',
  'Condomínio',
  'CNPJ',
  'Nome do Pagador',
  'Unidade',
  'Doc',
  'Complemento',
  'Venc',
  'Vlr Original',
  'Multa',
  'Juros',
  'Vlr Total',
  'Status'
]

export function UploadFile({ onDataParsed, onUpload }: UploadFileProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewData, setPreviewData] = useState<BoletoData[]>([])
  const [fullData, setFullData] = useState<BoletoData[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    try {
      setIsUploading(true)
      setErrors([])

      // Ler arquivo Excel
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: 'buffer' })

      // Pegar primeira planilha
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]

      // Converter para JSON
      const rawData: unknown[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

      if (rawData.length < 2) {
        throw new Error('Arquivo deve conter cabeçalho e pelo menos uma linha de dados')
      }

      // Encontrar índices das colunas obrigatórias
      const headers = (rawData[0] as unknown[]) as string[]
      const columnIndexes: Record<string, number> = {}

      REQUIRED_COLUMNS.forEach(col => {
        const index = headers.findIndex(header =>
          header?.toLowerCase().includes(col.toLowerCase()) ||
          header?.toLowerCase().includes(col.toLowerCase().replace(' do ', ' '))
        )
        if (index !== -1) {
          columnIndexes[col] = index
        }
      })

      // Verificar se todas as colunas obrigatórias foram encontradas
      const missingColumns = REQUIRED_COLUMNS.filter(col => !(col in columnIndexes))

      if (missingColumns.length > 0) {
        setErrors([`Colunas obrigatórias não encontradas: ${missingColumns.join(', ')}`])
        return
      }

      // Converter dados para formato estruturado (todas as linhas)
      const boletos: BoletoData[] = rawData.slice(1).map((row) => {
        const rowData = row as Record<string, unknown>
        return {
          referencia: Number(rowData[columnIndexes['Referência']]) || 0,
          condominio: String(rowData[columnIndexes['Condomínio']] || ''),
          cnpj: String(rowData[columnIndexes['CNPJ']] || ''),
          nome_pagador: String(rowData[columnIndexes['Nome do Pagador']] || ''),
          unidade: String(rowData[columnIndexes['Unidade']] || ''),
          doc: String(rowData[columnIndexes['Doc']] || ''),
          complemento: String(rowData[columnIndexes['Complemento']] || ''),
          vencimento: String(rowData[columnIndexes['Venc']] || ''),
          vlr_original: Number(rowData[columnIndexes['Vlr Original']]) || 0,
          multa: Number(rowData[columnIndexes['Multa']]) || undefined,
          juros: Number(rowData[columnIndexes['Juros']]) || undefined,
          vlr_total: Number(rowData[columnIndexes['Vlr Total']]) || 0,
          status: String(rowData[columnIndexes['Status']] || '')
        }
      }).filter(boleto => boleto.doc && boleto.doc.trim())

      if (boletos.length === 0) {
        throw new Error('Nenhum boleto válido encontrado no arquivo')
      }

      // Guardar o dataset completo para envio e limitar a prévia para renderização
      setFullData(boletos)
      setPreviewData(boletos.slice(0, 100))
      onDataParsed(boletos)

      toast.success(`Arquivo processado com sucesso! ${boletos.length} boletos encontrados.`)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar arquivo'
      setErrors([errorMessage])
      toast.error(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }, [onDataParsed])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  })

  const handleUpload = async () => {
    if (fullData.length === 0) return

    try {
      setIsUploading(true)
      await onUpload(fullData)
      setPreviewData([])
      setFullData([])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer upload'
      toast.error(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload de Planilha de Inadimplência
        </CardTitle>
        <CardDescription>
          Faça upload de uma planilha .xlsx com os boletos em aberto
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
          `}
        >
          <input {...getInputProps()} />
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-lg">Solte o arquivo aqui...</p>
          ) : (
            <div>
              <p className="text-lg mb-2">
                Arraste e solte um arquivo .xlsx aqui, ou clique para selecionar
              </p>
              <p className="text-sm text-muted-foreground">
                Apenas arquivos .xlsx são aceitos
              </p>
            </div>
          )}
        </div>

        {errors.length > 0 && (
          <div className="space-y-2">
            {errors.map((error, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">{error}</span>
              </div>
            ))}
          </div>
        )}

        {previewData.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">
                Pré-visualização ({previewData.length} de {fullData.length} boletos)
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left">Referência</th>
                    <th className="px-3 py-2 text-left">Condomínio</th>
                    <th className="px-3 py-2 text-left">Unidade</th>
                    <th className="px-3 py-2 text-right">Valor Total</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((boleto, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-3 py-2">{boleto.referencia}</td>
                      <td className="px-3 py-2 truncate max-w-48" title={boleto.condominio}>
                        {boleto.condominio}
                      </td>
                      <td className="px-3 py-2">{boleto.unidade}</td>
                      <td className="px-3 py-2 text-right">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(boleto.vlr_total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-1"
              >
                {isUploading ? 'Processando...' : `Importar ${fullData.length} Boletos`}
              </Button>
              <Button
                variant="outline"
                onClick={() => setPreviewData([])}
                disabled={isUploading}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

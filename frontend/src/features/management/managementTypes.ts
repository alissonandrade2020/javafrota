export type ResourceKey = 'funcionarios' | 'proprietarios' | 'pecas' | 'manutencoes' | 'vendas'
export type ManagementRecord = Record<string, unknown> & { id: number }
export type ResourceRequest = { resource: ResourceKey; record?: Partial<ManagementRecord> & Record<string, unknown> }
export type ReportSummary = {
  periodo: { de: string; ate: string }
  totalVeiculos: number
  veiculosPorStatus: Record<string, number>
  veiculosPorCombustivel: Record<string, number>
  totalProprietarios: number
  funcionariosAtivos: number
  funcionariosPorPerfil: Record<string, number>
  estoqueBaixo: number
  itensEstoque: number
  ordensAbertas: number
  ordensPorStatus: Record<string, number>
  servicosNoPeriodo: number
  totalCobrancaOficina: number
  vendasNoPeriodo: number
  vendasFechadas: number
  receitaNoPeriodo: number
  vendasPorStatus: Record<string, number>
  vendas: ManagementRecord[]
}

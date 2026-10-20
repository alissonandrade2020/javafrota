export type VehicleStatus = 'ATIVO' | 'MANUTENCAO' | 'INATIVO'

export type Vehicle = {
  id: number
  marca: string
  modelo: string
  ano: number
  placa: string
  status: VehicleStatus
  cor?: string
  combustivel?: string
  categoria?: string
  imagemUrl?: string | null
  fonteImagem?: string | null
  problemaAtual?: string | null
  proprietario?: { id: number; nome: string; documento: string } | null
  recargaExterna?: boolean
  autonomiaEletricaKm?: number | null
  criadoEm?: string
}

export type FleetDashboard = {
  total: number
  ativos: number
  manutencao: number
  inativos: number
}

export type VehiclePayload = Omit<Vehicle, 'id' | 'criadoEm'> & { proprietarioId?: number | null }

export type FleetData = { vehicles: Vehicle[]; dashboard: FleetDashboard }

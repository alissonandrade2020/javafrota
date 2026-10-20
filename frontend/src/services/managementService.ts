import { apiRequest } from './apiClient'
import type { ManagementRecord, ReportSummary, ResourceKey } from '../features/management/managementTypes'

export const managementService = {
  list: (resource: ResourceKey) => apiRequest<ManagementRecord[]>(`/api/${resource}`),
  create: (resource: ResourceKey, record: Record<string, unknown>) => apiRequest<ManagementRecord>(`/api/${resource}`, { method: 'POST', body: JSON.stringify(record) }),
  update: (resource: ResourceKey, id: number, record: Record<string, unknown>) => apiRequest<ManagementRecord>(`/api/${resource}/${id}`, { method: 'PUT', body: JSON.stringify(record) }),
  remove: (resource: ResourceKey, id: number) => apiRequest<void>(`/api/${resource}/${id}`, { method: 'DELETE' }),
  report: (from?: string, to?: string) => {
    const params = new URLSearchParams()
    if (from) params.set('de', from)
    if (to) params.set('ate', to)
    return apiRequest<ReportSummary>(`/api/relatorios/resumo${params.size ? `?${params}` : ''}`)
  },
}

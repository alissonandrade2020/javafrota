import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { managementService } from '../../services/managementService'
import type { ManagementRecord, ReportSummary, ResourceKey } from './managementTypes'

type ManagementState = {
  records: Partial<Record<ResourceKey, ManagementRecord[]>>
  reports: ReportSummary | null
  loading: boolean
  error: string | null
}
const initialState: ManagementState = { records: {}, reports: null, loading: false, error: null }

export const fetchResource = createAsyncThunk('management/fetchResource', (resource: ResourceKey) => managementService.list(resource))
export const fetchReports = createAsyncThunk('management/fetchReports', ({ from, to }: { from?: string; to?: string } = {}) => managementService.report(from, to))
export const saveResource = createAsyncThunk('management/saveResource', async ({ resource, id, record }: { resource: ResourceKey; id?: number; record: Record<string, unknown> }) => id === undefined ? managementService.create(resource, record) : managementService.update(resource, id, record))
export const deleteResource = createAsyncThunk('management/deleteResource', ({ resource, id }: { resource: ResourceKey; id: number }) => managementService.remove(resource, id).then(() => ({ resource, id })))

const managementSlice = createSlice({
  name: 'management', initialState, reducers: {},
  extraReducers: builder => builder
    .addCase(fetchResource.pending, state => { state.loading = true; state.error = null })
    .addCase(fetchResource.fulfilled, (state, action) => { state.records[action.meta.arg] = action.payload; state.loading = false })
    .addCase(fetchResource.rejected, (state, action) => { state.loading = false; state.error = action.error.message ?? 'Falha ao carregar o módulo.' })
    .addCase(saveResource.pending, state => { state.loading = true; state.error = null })
    .addCase(saveResource.fulfilled, (state, action) => { state.loading = false; const rows = state.records[action.meta.arg.resource] ?? []; const index = rows.findIndex(row => row.id === action.payload.id); if(index < 0) rows.unshift(action.payload); else rows[index] = action.payload; state.records[action.meta.arg.resource] = rows })
    .addCase(saveResource.rejected, (state, action) => { state.loading = false; state.error = action.error.message ?? 'Falha ao salvar os dados.' })
    .addCase(deleteResource.pending, state => { state.loading = true; state.error = null })
    .addCase(deleteResource.fulfilled, (state, action) => { state.loading = false; state.records[action.payload.resource] = (state.records[action.payload.resource] ?? []).filter(row => row.id !== action.payload.id) })
    .addCase(deleteResource.rejected, (state, action) => { state.loading = false; state.error = action.error.message ?? 'Falha ao excluir o registro.' })
    .addCase(fetchReports.pending, state => { state.loading = true; state.error = null })
    .addCase(fetchReports.fulfilled, (state, action) => { state.reports = action.payload; state.loading = false })
    .addCase(fetchReports.rejected, (state, action) => { state.loading = false; state.error = action.error.message ?? 'Falha ao carregar os relatórios.' }),
})

export default managementSlice.reducer

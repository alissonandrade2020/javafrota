import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { fleetService } from '../../services/fleetService'
import type { FleetData, FleetDashboard, Vehicle } from './fleetTypes'

type FleetState = FleetData & { loading: boolean; error: string | null; lastUpdated: string | null }
const initialState: FleetState = {
  vehicles: [], dashboard: { total: 0, ativos: 0, manutencao: 0, inativos: 0 },
  loading: true, error: null, lastUpdated: null,
}

export const fetchFleet = createAsyncThunk('fleet/fetch', () => fleetService.getFleet())

const fleetSlice = createSlice({
  name: 'fleet',
  initialState,
  reducers: {
    vehicleUpserted(state, action: { payload: Vehicle }) {
      const index = state.vehicles.findIndex(vehicle => vehicle.id === action.payload.id)
      if (index === -1) state.vehicles.unshift(action.payload)
      else state.vehicles[index] = action.payload
      recalculateDashboard(state)
      state.lastUpdated = new Date().toISOString()
    },
    vehicleRemoved(state, action: { payload: number }) {
      state.vehicles = state.vehicles.filter(vehicle => vehicle.id !== action.payload)
      recalculateDashboard(state)
      state.lastUpdated = new Date().toISOString()
    },
  },
  extraReducers: builder => builder
    .addCase(fetchFleet.pending, state => { state.loading = true; state.error = null })
    .addCase(fetchFleet.fulfilled, (state, action) => {
      state.vehicles = action.payload.vehicles
      state.dashboard = action.payload.dashboard
      state.loading = false
      state.error = null
      state.lastUpdated = new Date().toISOString()
    })
    .addCase(fetchFleet.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message ?? 'Não foi possível conectar à API.'
    }),
})

function recalculateDashboard(state: FleetState) {
  state.dashboard = state.vehicles.reduce<FleetDashboard>((dashboard, vehicle) => {
    dashboard.total += 1
    if (vehicle.status === 'ATIVO') dashboard.ativos += 1
    if (vehicle.status === 'MANUTENCAO') dashboard.manutencao += 1
    if (vehicle.status === 'INATIVO') dashboard.inativos += 1
    return dashboard
  }, { total: 0, ativos: 0, manutencao: 0, inativos: 0 })
}

export const { vehicleUpserted, vehicleRemoved } = fleetSlice.actions
export default fleetSlice.reducer

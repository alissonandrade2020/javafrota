import { apiRequest } from './apiClient'
import type { FleetDashboard, FleetData, Vehicle, VehiclePayload } from '../features/fleet/fleetTypes'

export const fleetService = {
  async getFleet(): Promise<FleetData> {
    const [vehicles, dashboard] = await Promise.all([
      apiRequest<Vehicle[]>('/api/veiculos'),
      apiRequest<FleetDashboard>('/api/dashboard'),
    ])
    return { vehicles, dashboard }
  },
  createVehicle: (payload: VehiclePayload) => apiRequest<Vehicle>('/api/veiculos', { method: 'POST', body: JSON.stringify(payload) }),
  updateVehicle: (id: number, payload: VehiclePayload) => apiRequest<Vehicle>(`/api/veiculos/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteVehicle: (id: number) => apiRequest<void>(`/api/veiculos/${id}`, { method: 'DELETE' }),
}

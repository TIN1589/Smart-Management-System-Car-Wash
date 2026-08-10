import { authorizeAxios } from '@/shared/lib/api-client'

export interface VehicleRequest {
  licensePlate: string
  vehicleType: string
  brand?: string
  color?: string
  primary?: boolean
}

export interface VehicleResponse {
  id: string
  licensePlate: string
  vehicleType: string
  brand?: string
  color?: string
  primary: boolean
  lastWashDate?: string
  lastWashService?: string
}

export const vehicleService = {
  async getVehicles(): Promise<VehicleResponse[]> {
    const { data } = await authorizeAxios.get<VehicleResponse[]>('/vehicles')
    return data
  },

  async addVehicle(payload: VehicleRequest): Promise<VehicleResponse> {
    const { data } = await authorizeAxios.post<VehicleResponse>('/vehicles', payload)
    return data
  },

  async updateVehicle(vehicleId: string, payload: VehicleRequest): Promise<VehicleResponse> {
    const { data } = await authorizeAxios.put<VehicleResponse>(`/vehicles/${vehicleId}`, payload)
    return data
  },

  async setPrimaryVehicle(vehicleId: string): Promise<VehicleResponse> {
    const { data } = await authorizeAxios.patch<VehicleResponse>(`/vehicles/${vehicleId}/primary`)
    return data
  },

  async deleteVehicle(vehicleId: string): Promise<void> {
    await authorizeAxios.delete(`/vehicles/${vehicleId}`)
  },
}

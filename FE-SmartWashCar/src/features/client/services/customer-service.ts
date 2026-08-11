import { authorizeAxios } from '@/shared/lib/api-client'

export interface CustomerResponse {
  id: string
  fullName: string
  name?: string
  phone: string
  email: string
  tier?: string
  points?: number
}

export interface CustomerUpdateRequest {
  fullName: string
  phone: string
  email: string
}

export const customerService = {
  async getCustomer(id: string): Promise<CustomerResponse> {
    const { data } = await authorizeAxios.get<CustomerResponse>(`/customers/${id}`)
    return data
  },

  async updateCustomer(id: string, payload: CustomerUpdateRequest): Promise<CustomerResponse> {
    const { data } = await authorizeAxios.put<CustomerResponse>(`/customers/${id}`, payload)
    return data
  },

  async changePassword(id: string | number, payload: { oldPassword?: string; newPassword?: string }): Promise<any> {
    const { data } = await authorizeAxios.patch(`/customers/${id}/password`, payload)
    return data
  },
}

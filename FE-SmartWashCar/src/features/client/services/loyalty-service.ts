import { authorizeAxios } from '@/shared/lib/api-client'

export interface PointBalanceResponse {
  customerId: string
  balance?: number
  currentPoints?: number
  pointsExpiring?: number
  expiringAt?: string
  tier?: string // e.g. "Silver", "Gold", "Platinum"
  nextTierPoints?: number // points needed to advance to next tier
  nextTier?: string // e.g. "Gold", "Platinum"
  totalVisits?: number
  remainingVisits?: number
  silverThreshold?: number
  goldThreshold?: number
  platinumThreshold?: number
}

export interface PointHistoryResponse {
  id: string
  customerId: string
  points: number
  transactionType: 'EARN' | 'REDEEM'
  type: 'EARN' | 'REDEEM'
  amountPaid?: number
  description?: string
  createdAt: string
}

export interface Page<T> {
  content: T[]
}

export interface RedeemPointsRequest {
  customerId: string
  points: number
  referenceId: string
}

export interface RedeemPointsResponse {
  customerId: string
  pointsUsed: number
  remainingBalance: number
  message?: string
}

export const loyaltyService = {
  async getLoyaltyBalance(customerId: string): Promise<PointBalanceResponse> {
    const { data } = await authorizeAxios.get<PointBalanceResponse>(`/loyalty/balance/${customerId}`)
    return data
  },

  async getPointHistory(
    customerId: string,
    params?: { page?: number; size?: number; sort?: string }
  ): Promise<Page<PointHistoryResponse>> {
    const { data } = await authorizeAxios.get<Page<PointHistoryResponse>>(`/customers/${customerId}/points`, {
      params,
    })
    return data
  },

  async redeemPoints(payload: RedeemPointsRequest): Promise<RedeemPointsResponse> {
    const { data } = await authorizeAxios.post<RedeemPointsResponse>('/loyalty/redeem', payload)
    return data
  },
}

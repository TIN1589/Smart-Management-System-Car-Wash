import { authorizeAxios } from '@/shared/lib/api-client'

export interface PromotionResponse {
  promoId: string
  name: string
  description?: string
  targetTiers: string // comma-separated e.g. "MEMBER,SILVER,GOLD,PLATINUM"
  promoType: 'DISCOUNT' | 'BONUS_POINTS' | 'FREE_WASH' | 'ADD_ON'
  value: number
  startsAt: string
  endsAt: string
  isActive: boolean
  usageLimit?: number
  usageCount: number
  maxDiscount?: number
  createdAt: string
}

export const promotionService = {
  async getActivePromotions(): Promise<PromotionResponse[]> {
    const { data } = await authorizeAxios.get<PromotionResponse[]>('/promotions')
    return data
  }
}

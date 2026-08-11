export type PromotionStatus = 'active' | 'inactive'

export type AdminPromotion = {
  actionDisabled?: boolean
  code: string
  dateRange: string
  muted?: boolean
  name: string
  status: PromotionStatus
  targetTiers: string[]
  type: 'DISCOUNT' | 'BONUS_POINTS' | 'FREE_WASH'
  usage: {
    current: number
    percent: number
    total: number
  }
  value: string
}

export const adminPromotions: AdminPromotion[] = [
  {
    code: 'PROMO-001',
    name: 'Giảm 20% Premium',
    type: 'DISCOUNT',
    targetTiers: ['GOLD'],
    value: '20%',
    dateRange: '01/01 - 31/01',
    usage: { current: 45, total: 100, percent: 45 },
    status: 'active',
  },
  {
    code: 'PROMO-002',
    name: 'Tặng 50 điểm hội viên',
    type: 'BONUS_POINTS',
    targetTiers: ['SILVER', 'MEMBER'],
    value: '50 điểm',
    dateRange: '15/01 - 15/02',
    usage: { current: 120, total: 500, percent: 24 },
    status: 'active',
  },
  {
    code: 'PROMO-003',
    name: 'Rửa xe miễn phí (Sinh nhật)',
    type: 'FREE_WASH',
    targetTiers: ['PLATINUM'],
    value: '100%',
    dateRange: '01/12 - 31/12',
    usage: { current: 50, total: 50, percent: 100 },
    status: 'inactive',
    muted: true,
    actionDisabled: true,
  },
]

export const campaignBars = [
  { label: 'T2', height: '96px', value: '450tr' },
  { label: 'T3', height: '128px', value: '620tr' },
  { label: 'T4', height: '64px', value: '310tr' },
  { label: 'T5', height: '160px', value: '850tr', active: true },
  { label: 'T6', height: '112px', value: '540tr' },
  { label: 'T7', height: '144px', value: '710tr' },
  { label: 'CN', height: '96px', value: '420tr' },
]

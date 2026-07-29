export type TierKey = 'member' | 'silver' | 'gold' | 'platinum'

export type TierRule = {
  bookingWindow: number
  className: string
  defaultCollapsed?: boolean
  label: string
  multiplier: number
  name: string
  perks: string
  threshold: number
  tier: TierKey
}

export type RewardItem = {
  minimumTier: string
  name: string
  points: string
  tierClassName: string
}

export const tierRules: TierRule[] = [
  {
    tier: 'member',
    label: 'MEMBER',
    name: 'Cấu hình mặc định',
    threshold: 0,
    bookingWindow: 3,
    multiplier: 100,
    perks: 'Thành viên mới đăng ký. Tích điểm cơ bản cho mỗi dịch vụ.',
    className: 'bg-tier-member',
    defaultCollapsed: true,
  },
  {
    tier: 'silver',
    label: 'SILVER',
    name: 'Hạng Bạc',
    threshold: 5,
    bookingWindow: 7,
    multiplier: 110,
    perks: 'Giảm giá 5% cho các dịch vụ rửa xe cao cấp. Ưu tiên đặt lịch trước 7 ngày.',
    className: 'bg-tier-silver',
  },
  {
    tier: 'gold',
    label: 'GOLD',
    name: 'Hạng Vàng',
    threshold: 15,
    bookingWindow: 14,
    multiplier: 125,
    perks: 'Miễn phí dịch vụ hút bụi. Giảm giá 10% các gói Detail. Ưu tiên hàng chờ cao.',
    className: 'bg-tier-gold',
    defaultCollapsed: true,
  },
  {
    tier: 'platinum',
    label: 'PLATINUM',
    name: 'Hạng Bạch Kim',
    threshold: 30,
    bookingWindow: 30,
    multiplier: 150,
    perks: 'Chăm sóc đặc biệt. Miễn phí nâng cấp gói rửa. Quà tặng sinh nhật trị giá 500k.',
    className: 'bg-tier-platinum',
    defaultCollapsed: true,
  },
]

export const rewardItems: RewardItem[] = [
  {
    name: 'Voucher Rửa xe 0đ',
    points: '500',
    minimumTier: 'SILVER',
    tierClassName: 'bg-tier-silver',
  },
  {
    name: 'Nước hoa xe hơi cao cấp',
    points: '1.200',
    minimumTier: 'GOLD',
    tierClassName: 'bg-tier-gold',
  },
  {
    name: 'Gói Phủ Ceramic 3M',
    points: '5.000',
    minimumTier: 'PLATINUM',
    tierClassName: 'bg-tier-platinum',
  },
]

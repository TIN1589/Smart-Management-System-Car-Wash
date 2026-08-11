import {
  CalendarDays,
  Gauge,
  Gift,
  ReceiptText,
  ShieldCheck,
  Star,
  Tag,
  type LucideIcon,
} from 'lucide-react'

export type MarketingFeature = {
  description: string
  icon: LucideIcon
  title: string
}

export const marketingFeatures: MarketingFeature[] = [
  {
    icon: CalendarDays,
    title: 'Đặt lịch nhanh',
    description: 'Tiết kiệm thời gian với quy trình đặt chỗ tự động chỉ trong 30 giây.',
  },
  {
    icon: Star,
    title: 'Dịch vụ VIP',
    description: 'Quyền lợi đặc biệt và khu vực chờ hạng sang dành cho thành viên.',
  },
  {
    icon: ReceiptText,
    title: 'Minh bạch',
    description: 'Hóa đơn điện tử và lịch sử bảo dưỡng luôn sẵn sàng để tra cứu.',
  },
  {
    icon: Gift,
    title: 'Tích điểm đổi quà',
    description: 'Tích lũy điểm thưởng qua mỗi lần sử dụng để đổi các phần quà giá trị.',
  },
]

export const authBenefits: MarketingFeature[] = [
  {
    icon: ShieldCheck,
    title: 'Bảo mật cao',
    description: 'Xác thực OTP 2 lớp',
  },
  {
    icon: Gauge,
    title: 'Nhanh chóng',
    description: 'Đăng ký chỉ mất 30s',
  },
  {
    icon: Tag,
    title: 'Ưu đãi lớn',
    description: 'Tặng voucher khi đăng ký',
  },
]

export const loyaltyTiers = [
  { name: 'Member', className: 'bg-tier-member' },
  { name: 'Silver', className: 'bg-tier-silver' },
  { name: 'Gold', className: 'bg-tier-gold' },
  { name: 'Platinum', className: 'bg-tier-platinum' },
]

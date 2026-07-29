import {
  Award,
  CalendarClock,
  CalendarPlus,
  Car,
  CarFront,
  ClipboardList,
  Gift,
  History,
  Home,
  LogOut,
  Tag,
  UserCircle,
  BookOpen,
  type LucideIcon,
} from 'lucide-react'
import { routes, type AppPath } from '@/app/routes'
import promoCeramic from '@/shared/assets/promo-ceramic.png'
import promoDetail from '@/shared/assets/promo-detail.png'
import promoInterior from '@/shared/assets/promo-interior.png'

export type DashboardNavItem = {
  activePath?: AppPath
  icon: LucideIcon
  label: string
  path: AppPath
}

export type QuickAction = {
  icon: LucideIcon
  label: string
}

export type Promotion = {
  action: string
  badge?: {
    tone: 'danger' | 'primary'
    value: string
  }
  description: string
  image: string
  title: string
}

export const dashboardNavItems: DashboardNavItem[] = [
  { activePath: routes.dashboard, icon: Home, label: 'Trang chủ', path: routes.dashboard },
  { activePath: routes.booking, icon: CalendarClock, label: 'Đặt lịch', path: routes.booking },
  { activePath: routes.loyalty, icon: Gift, label: 'Điểm thưởng', path: routes.loyalty },
  { activePath: routes.history, icon: History, label: 'Lịch sử', path: routes.history },
  { activePath: routes.promotions, icon: Tag, label: 'Khuyến mãi', path: routes.promotions },
  { activePath: routes.articles, icon: BookOpen, label: 'Cẩm nang', path: routes.articles },
  { activePath: routes.vehicles, icon: Car, label: 'Xe của tôi', path: routes.vehicles },
  { activePath: routes.profile, icon: UserCircle, label: 'Hồ sơ', path: routes.profile },
]

export const dashboardLogoutItem = {
  icon: LogOut,
  label: 'Đăng xuất',
}

export const quickActions = [
  { icon: CalendarPlus, label: 'Đặt lịch', path: routes.booking },
  { icon: Award, label: 'Điểm thưởng', path: routes.loyalty },
  { icon: ClipboardList, label: 'Lịch sử', path: routes.history },
  { icon: CarFront, label: 'Xe của tôi', path: routes.vehicles },
]

export const promotions: Promotion[] = [
  {
    image: promoDetail,
    badge: { tone: 'danger', value: 'HOT DEAL' },
    title: 'Giảm 20% Combo Rửa & Wax',
    description: 'Áp dụng cho khách hàng hạng Vàng vào các ngày trong tuần.',
    action: 'Sử dụng ngay',
  },
  {
    image: promoCeramic,
    badge: { tone: 'primary', value: 'NEW' },
    title: 'Gói Phủ Ceramic Pro',
    description: 'Bảo vệ sơn xe lên đến 12 tháng với công nghệ Nano mới nhất.',
    action: 'Tìm hiểu thêm',
  },
  {
    image: promoInterior,
    title: 'Dọn Nội Thất Chuyên Sâu',
    description: 'Tặng kèm dịch vụ khử mùi Ozone cho đơn hàng trên 500k.',
    action: 'Đặt ngay',
  },
]

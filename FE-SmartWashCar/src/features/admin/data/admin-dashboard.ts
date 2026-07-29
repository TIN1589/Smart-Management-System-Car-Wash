import {
  Banknote,
  BarChart3,
  CalendarDays,
  Car,
  LayoutDashboard,
  Package,
  Settings,
  Star,
  Tag,
  UserPlus,
  Users,
  BookOpen,
  type LucideIcon,
} from 'lucide-react'

export type AdminNavKey = 'dashboard' | 'booking' | 'customers' | 'promotion' | 'configuration' | 'reports' | 'lpr' | 'articles' | 'services'

export type AdminNavItem = {
  active?: boolean
  icon: LucideIcon
  key: AdminNavKey
  label: string
}

export type AdminMetric = {
  detail?: string
  icon: LucideIcon
  label: string
  tone: 'primary' | 'info' | 'warning' | 'platinum'
  trend?: string
  value: string
}

export type QueueItem = {
  plate: string
  service: string
  status: string
  tone: 'warning' | 'info' | 'success'
  time: string
}

export const adminNavItems: AdminNavItem[] = [
  { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', active: true },
  { key: 'booking', icon: CalendarDays, label: 'Booking' },
  { key: 'customers', icon: Users, label: 'Khách hàng' },
  { key: 'services', icon: Package, label: 'Dịch vụ & Combo' },
  { key: 'promotion', icon: Tag, label: 'Promotion' },
  { key: 'articles', icon: BookOpen, label: 'Bài viết' },
  { key: 'configuration', icon: Settings, label: 'Configuration' },
  { key: 'reports', icon: BarChart3, label: 'Reports' }
]

export const adminMetrics: AdminMetric[] = [
  {
    icon: Banknote,
    label: 'Doanh thu hôm nay',
    value: '15.200.000đ',
    trend: '+12%',
    tone: 'primary',
  },
  {
    icon: Car,
    label: 'Lượt rửa',
    value: '48',
    detail: '32 xe máy, 16 ô tô',
    tone: 'info',
  },
  {
    icon: UserPlus,
    label: 'Khách hàng mới',
    value: '12',
    tone: 'warning',
  },
  {
    icon: Star,
    label: 'Điểm đã phát',
    value: '2,450 điểm',
    tone: 'platinum',
  },
]

export const revenueBars = [
  { day: '01/01', height: '40%', value: '8M' },
  { day: '02/01', height: '65%', value: '12M' },
  { day: '03/01', height: '55%', value: '10M' },
  { day: '04/01', height: '90%', value: '18M' },
  { day: '05/01', height: '45%', value: '9M' },
  { day: '06/01', height: '75%', value: '14M' },
  { day: 'Hôm nay', height: '82%', value: '15.2M', active: true },
]

export const queueItems: QueueItem[] = [
  { time: '09:30', plate: '51G-123.45', service: 'Rửa tiêu chuẩn - Xe máy', status: 'Chờ rửa', tone: 'warning' },
  { time: '10:15', plate: '30A-999.88', service: 'Phủ Ceramic - Ô tô', status: 'Đang rửa', tone: 'info' },
  { time: '08:45', plate: '51H-555.21', service: 'Dọn nội thất - Ô tô', status: 'Hoàn tất', tone: 'success' },
]

export const inventoryAlert = {
  icon: Package,
  title: '3 loại hóa chất',
  subtitle: 'Đang ở mức thấp',
}

export const tierDistribution = [
  { label: 'Member', percent: '40%', colorClass: 'bg-tier-member' },
  { label: 'Silver', percent: '25%', colorClass: 'bg-tier-silver' },
  { label: 'Gold', percent: '20%', colorClass: 'bg-tier-gold' },
  { label: 'Platinum', percent: '15%', colorClass: 'bg-tier-platinum' },
]

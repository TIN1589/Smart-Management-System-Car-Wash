import { Clock, Sparkles } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { cn } from '@/shared/lib/utils'

const statusClasses: Record<string, string> = {
  warning: 'bg-warning/10 text-warning',
  info: 'bg-info/10 text-info',
  success: 'bg-success/10 text-success',
}

// =========================================================================
// 🌟 1. PANEL HÀNG ĐỢI ĐỘNG: Đồng bộ khớp nối dữ liệu thực tế từ table Bookings
// =========================================================================
export function QueuePanel({ items }: { items: any[] }) {
  const safeItems = Array.isArray(items) ? items : []

  return (
    <Card className="shadow-sm bg-white border border-slate-100 rounded-2xl">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-tight text-primary">Queue hôm nay</h3>
          <span className="rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] font-bold">
            {safeItems.length} Total
          </span>
        </div>

        <div className="custom-scrollbar max-h-100 space-y-4 overflow-y-auto pr-1">
          {safeItems.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center font-medium">Hiện chưa có xe nào trong hàng chờ hôm nay.</p>
          ) : (
            safeItems.map((item, index) => {
              const rawStatus = item?.status ? String(item.status).toUpperCase() : ""
              // Hỗ trợ bắt cả trạng thái tiếng Anh lẫn tiếng Việt đổ về từ JPA
              const isCompleted = rawStatus === 'COMPLETED' || rawStatus === 'DONE' || rawStatus === 'FINISHED' || rawStatus.includes("HOÀN")
              
              // 🌟 SỬA ĐỒNG BỘ: Kiểm tra linh hoạt cả 2 trường serviceType và service của DTO Backend
              const rawService = item?.serviceType ? String(item.serviceType).toUpperCase() : (item?.service ? String(item.service).toUpperCase() : "")
              
              // Khớp nối an toàn các trường dữ liệu Enum thực tế của Spring Boot
              const serviceLabel = rawService.includes("PREMIUM") ? "Rửa xe cao cấp" : 
                                   (rawService.includes("DETAIL") || rawService.includes("FULL")) ? "Chăm sóc toàn diện" : "Rửa xe tiêu chuẩn"

              return (
                <div
                  className={cn(
                    'flex items-center gap-4 rounded-xl border border-slate-100 p-3 transition-all hover:border-primary hover:shadow-xs bg-white',
                    index === 0 && 'bg-slate-50/50 border-indigo-100/50',
                  )}
                  key={index}
                >
                  <div className="grid size-12 shrink-0 place-items-center rounded-xl border border-slate-100 bg-slate-50">
                    <span className="text-[10px] font-bold tracking-tight text-slate-700">{item.time || '00:00'}</span>
                    <Clock className="text-slate-400 -mt-1" size={12} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-black uppercase tracking-tight text-slate-800">
                      {String(item.licensePlate || item.plate || 'N/A').toUpperCase()}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                      {serviceLabel}
                    </p>
                  </div>
                  <span className={cn('whitespace-nowrap rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight', isCompleted ? statusClasses.success : statusClasses.warning)}>
                    {isCompleted ? 'Hoàn tất' : 'Chờ rửa'}
                  </span>
                </div>
              )
            })
          )}
        </div>

        <Button className="mt-4 w-full text-slate-500 hover:text-slate-700 font-bold text-xs" type="button" variant="outline">
          Xem tất cả booking
        </Button>
      </CardContent>
    </Card>
  )
}

// =========================================================================
// 🌟 2. PANEL BIỂU ĐỒ TRÒN SVG PHÂN HẠNG: Mapping dữ liệu động an toàn
// =========================================================================
export function TierDistributionPanel({ stats }: { stats: any }) {
  const member = stats?.memberCount ?? 0
  const silver = stats?.silverCount ?? 0
  const gold = stats?.goldCount ?? 0
  const platinum = stats?.platinumCount ?? 0
  const totalVehicles = member + silver + gold + platinum

  const tiers = [
    { label: 'Member', count: member, percent: totalVehicles > 0 ? (member / totalVehicles) * 100 : 0, colorClass: 'bg-slate-400', color: '#94A3B8' },
    { label: 'Silver', count: silver, percent: totalVehicles > 0 ? (silver / totalVehicles) * 100 : 0, colorClass: 'bg-blue-500', color: '#3B82F6' },
    { label: 'Gold', count: gold, percent: totalVehicles > 0 ? (gold / totalVehicles) * 100 : 0, colorClass: 'bg-amber-500', color: '#F59E0B' },
    { label: 'Platinum', count: platinum, percent: totalVehicles > 0 ? (platinum / totalVehicles) * 100 : 0, colorClass: 'bg-purple-500', color: '#A855F7' },
  ]

  let accumulatedPercent = 0

  return (
    <Card className="shadow-sm bg-white border border-slate-100 rounded-2xl">
      <CardContent className="p-6">
        <h3 className="mb-6 text-sm font-bold uppercase tracking-tight text-primary">Phân hạng khách hàng</h3>

        <div className="relative mb-6 flex items-center justify-center">
          <svg className="-rotate-90" height="140" viewBox="0 0 42 42" width="140">
            {tiers.map((tier) => {
              const percentValue = tier.percent
              if (percentValue === 0) return null

              const strokeDashArray = `${percentValue} ${100 - percentValue}`
              const strokeDashOffset = -accumulatedPercent
              accumulatedPercent += percentValue

              return (
                <circle 
                  cx="21" 
                  cy="21" 
                  fill="transparent" 
                  r="15.915" 
                  stroke={tier.color} 
                  strokeDasharray={strokeDashArray} 
                  strokeDashoffset={strokeDashOffset} 
                  strokeWidth="5" 
                  strokeLinecap="round"
                  key={tier.label}
                  className="transition-all duration-500"
                />
              )
            })}
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black tracking-tight text-slate-800">
              {totalVehicles.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 -mt-0.5">Khách</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-2">
          {tiers.map((tier) => (
            <div className="flex items-center gap-2" key={tier.label}>
              <span className={cn('size-2.5 rounded-full shrink-0', tier.colorClass)} />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-slate-700 truncate">{tier.label} ({tier.count} xe)</p>
                <p className="text-[10px] font-medium text-slate-400 mt-0.5">{Math.round(tier.percent)}% tỷ lệ</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function AdminActionCards() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground shadow-sm">
      <div className="relative z-10">
        <h4 className="mb-2 text-base font-bold tracking-tight">Nâng cấp gói Diamond</h4>
        <p className="mb-6 text-xs leading-relaxed text-white/80 font-medium">
          Ưu đãi 15% cho khách hàng Silver nâng cấp lên Platinum trong tuần này.
        </p>
        <Button className="bg-white px-5 rounded-xl text-primary hover:bg-slate-50 text-xs font-bold shadow-md" type="button">
          Gửi thông báo
        </Button>
      </div>
      <Sparkles className="absolute -bottom-8 -right-8 text-white/10" size={120} />
    </div>
  )
}
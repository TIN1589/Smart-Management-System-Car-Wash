import { CircleDollarSign, ShieldCheck } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { cn } from '@/shared/lib/utils'

interface PromotionStatsProps {
  promotions: any[]
}

export function PromotionStats({ promotions }: PromotionStatsProps) {
  
  // 1. TÍNH TOÁN ĐỘNG: Tổng số lượt đã sử dụng thực tế từ DB
  const totalUsageCount = promotions.reduce((sum, item) => sum + (item.usageCount || 0), 0)

  // 2. TÍNH TOÁN ĐỘNG: Tỷ lệ sử dụng trung bình trên tổng giới hạn
  const totalLimit = promotions.reduce((sum, item) => sum + (item.usageLimit || 100), 0)
  const conversionRate = totalLimit > 0 ? ((totalUsageCount / totalLimit) * 100).toFixed(1) : "0.0"

  const maxUsage = Math.max(...promotions.map(p => p.usageCount || 1), 1)
  
  const campaignBars = promotions.map((promo, idx) => {
    const usage = promo.usageCount || 0
    const calculatedHeight = `${Math.min(Math.max((usage / maxUsage) * 100, 5), 100)}%` 
    
    // Tạo nhãn phân biệt nếu trùng tên bằng cách đính kèm số thứ tự hoặc ID rút gọn
    const shortId = promo.id ? ` (#${promo.id.substring(0, 4)})` : ''
    const baseName = promo.name || `Promo ${idx + 1}`
    
    return {
      label: baseName.length > 10 ? `${baseName.substring(0, 10)}...` : baseName,
      fullName: baseName + shortId,
      value: `${usage} lượt`,
      height: calculatedHeight,
      active: promo.isActive === true || String(promo.isActive) === 'true' || promo.status === 'ACTIVE'
    }
  })

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* KHU VỰC 1: BIỂU ĐỒ HIỆU QUẢ CHI TIẾT THEO DATABASE */}
      <Card className="col-span-12 lg:col-span-8">
        <CardContent className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium leading-4 text-on-surface">Hiệu quả chiến dịch</h3>
            <span className="text-xs leading-4 text-on-surface-variant">Dữ liệu thời gian thực</span>
          </div>
          
          <div className="flex h-48 items-end justify-start gap-4 px-4 overflow-x-auto pb-4 scrollbar-thin">
            {campaignBars.length === 0 ? (
              <div className="w-full text-center text-xs text-on-surface-variant/60 pb-16">
                Chưa có dữ liệu thống kê chiến dịch
              </div>
            ) : (
              campaignBars.map((bar, idx) => (
                <div 
                  className="flex w-[64px] shrink-0 flex-col justify-end gap-2 group relative cursor-pointer" 
                  key={idx}
                  style={{ height: bar.height }} 
                  title={bar.fullName}
                >
                  <div
                    className={cn(
                      'w-full flex-1 rounded-t transition-all duration-300 bg-blue-500 hover:bg-blue-600', 
                      bar.active && 'bg-primary hover:bg-primary-dark'
                    )}
                  >
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-on-background px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap z-10 shadow-md">
                      {bar.value}
                    </span>
                  </div>
                  <span className="text-[10px] leading-4 text-on-surface-variant text-center block truncate w-full absolute -bottom-6 left-0" title={bar.fullName}>
                    {bar.label}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* KHU VỰC 2: HAI Ô THỐNG KÊ SỐ LIỆU ĐỘNG */}
      <div className="col-span-12 grid gap-4 lg:col-span-4">
        <Card>
          <CardContent className="flex min-h-36 flex-col items-center justify-center text-center">
            <ShieldCheck className="mb-2 text-primary" size={38} />
            <h4 className="text-xl font-medium leading-7 text-on-surface">{totalUsageCount.toLocaleString()}</h4>
            <p className="text-xs font-medium leading-4 text-on-surface-variant">Tổng lượt đã sử dụng</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex min-h-36 flex-col items-center justify-center text-center">
            <CircleDollarSign className="mb-2 text-success" size={38} />
            <h4 className="text-xl font-medium leading-7 text-on-surface">{conversionRate}%</h4>
            <p className="text-xs font-medium leading-4 text-on-surface-variant">Tỷ lệ sử dụng chiến dịch</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
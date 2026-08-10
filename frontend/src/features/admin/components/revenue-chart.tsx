import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { cn } from '@/shared/lib/utils'

// 🌟 ĐÃ THÊM: Cổng nhận dữ liệu mảng doanh thu từ trang cha truyền xuống
interface RevenueChartProps {
  data: Array<{ label: string; revenue: number }>
}

export function RevenueChart({ data = [] }: RevenueChartProps) {
  // Tìm doanh thu lớn nhất để tính toán tỷ lệ % chiều cao cột CSS
  const maxRevenue = data.length > 0 ? Math.max(...data.map(d => d.revenue)) : 0

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-medium leading-7 text-on-surface">Doanh thu 7 ngày qua</h3>
          <Button aria-label="Tùy chọn biểu đồ" size="icon" type="button" variant="ghost">
            <MoreHorizontal size={22} />
          </Button>
        </div>

        {/* Khung chứa cột biểu đồ */}
        <div className="relative flex h-64 items-end justify-between gap-4 pt-8">
          <div className="absolute inset-0 flex flex-col justify-between opacity-10 pointer-events-none">
            <div className="border-b border-on-surface-variant" />
            <div className="border-b border-on-surface-variant" />
            <div className="border-b border-on-surface-variant" />
            <div className="border-b border-on-surface-variant" />
          </div>

          {data.map((bar, index) => {
            const revValue = bar.revenue ?? 0
            // Tính toán chiều cao linh hoạt từ 15% đến 100% dựa vào doanh số thực tế
            const calculatedHeight = maxRevenue > 0 ? `${(revValue / maxRevenue) * 80 + 20}%` : '20%'
            const isToday = index === data.length - 1

            return (
              <div
                className={cn(
                  'group relative flex-1 cursor-pointer rounded-t-lg bg-primary/20 transition-colors hover:bg-primary',
                  isToday && 'bg-primary hover:bg-primary',
                )}
                key={bar.label || index}
                style={{ height: calculatedHeight }}
              >
                {/* Tooltip hiển thị số tiền khi hover chuột vào cột */}
                <span
                  className={cn(
                    'absolute -top-8 left-1/2 -translate-x-1/2 rounded px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap z-20',
                    isToday ? 'bg-primary opacity-100' : 'bg-on-background',
                  )}
                >
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(revValue)}
                </span>
                
                {/* Nhãn ngày hiển thị dưới chân cột */}
                <span
                  className={cn(
                    'absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium leading-4 text-on-surface-variant',
                    isToday && 'text-primary',
                  )}
                >
                  {bar.label}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
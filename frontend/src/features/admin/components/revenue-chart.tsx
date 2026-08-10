import { MoreHorizontal, BarChart2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { cn } from '@/shared/lib/utils'

interface RevenueChartProps {
  data: Array<{ label: string; revenue: number }>
}

function formatShortVND(val: number): string {
  if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}B`
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k`
  return `${val}đ`
}

export function RevenueChart({ data = [] }: RevenueChartProps) {
  const maxRevenue = data.length > 0 ? Math.max(...data.map(d => d.revenue)) : 0

  const yTicks = [
    maxRevenue,
    Math.round(maxRevenue * 0.75),
    Math.round(maxRevenue * 0.5),
    Math.round(maxRevenue * 0.25),
    0
  ]

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <BarChart2 size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold leading-6 text-on-surface">Doanh thu 7 ngày qua</h3>
              <p className="text-xs text-on-surface-variant">Thống kê doanh số thực tế từng ngày</p>
            </div>
          </div>
          <Button aria-label="Tùy chọn biểu đồ" size="icon" type="button" variant="ghost">
            <MoreHorizontal size={20} />
          </Button>
        </div>

        {data.length === 0 ? (
          <div className="flex h-56 items-center justify-center rounded-xl bg-slate-50 text-xs text-slate-400 font-medium">
            Chưa có dữ liệu doanh thu 7 ngày qua
          </div>
        ) : (
          <div className="flex h-64 items-stretch gap-4 pt-4">
            {/* Trục Y hiển thị mốc giá trị */}
            <div className="flex flex-col justify-between text-[10px] font-medium text-slate-400 pb-6 pr-1 text-right select-none w-10 shrink-0">
              {yTicks.map((tick, i) => (
                <span key={i}>{formatShortVND(tick)}</span>
              ))}
            </div>

            {/* Khung chứa các cột */}
            <div className="relative flex flex-1 items-end justify-between gap-3 border-l border-slate-200/60 pl-2 pb-6">
              {/* Các đường kẻ ngang làm mốc */}
              <div className="absolute inset-0 pb-6 flex flex-col justify-between pointer-events-none opacity-30">
                <div className="border-b border-dashed border-slate-300" />
                <div className="border-b border-dashed border-slate-300" />
                <div className="border-b border-dashed border-slate-300" />
                <div className="border-b border-dashed border-slate-300" />
                <div className="border-b border-slate-300" />
              </div>

              {data.map((bar, index) => {
                const revValue = bar.revenue ?? 0
                const calculatedHeight = maxRevenue > 0 ? `${Math.max((revValue / maxRevenue) * 100, 4)}%` : '4%'
                const isToday = index === data.length - 1

                return (
                  <div
                    className={cn(
                      'group relative flex-1 cursor-pointer rounded-t-lg bg-primary/25 transition-all duration-500 ease-out hover:bg-primary hover:shadow-md',
                      isToday && 'bg-primary shadow-sm hover:bg-primary/90'
                    )}
                    key={bar.label || index}
                    style={{ height: calculatedHeight }}
                  >
                    {/* Tooltip hiển thị số tiền khi hover chuột vào cột */}
                    <div
                      className={cn(
                        'absolute -top-9 left-1/2 -translate-x-1/2 rounded-md px-2 py-1 text-[10px] font-bold text-white shadow-md opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap pointer-events-none z-30',
                        isToday ? 'bg-primary opacity-100' : 'bg-slate-800'
                      )}
                    >
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(revValue)}
                    </div>

                    {/* Nhãn ngày hiển thị dưới chân cột */}
                    <span
                      className={cn(
                        'absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-semibold leading-4 text-slate-500',
                        isToday && 'text-primary font-bold'
                      )}
                    >
                      {bar.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
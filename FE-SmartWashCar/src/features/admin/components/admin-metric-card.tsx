import { TrendingUp } from 'lucide-react'
import type { AdminMetric } from '@/features/admin/data/admin-dashboard'
import { Card, CardContent } from '@/shared/components/ui/card'
import { cn } from '@/shared/lib/utils'

const toneClasses: Record<AdminMetric['tone'], string> = {
  primary: 'bg-primary/5 text-primary',
  info: 'bg-info/5 text-info',
  warning: 'bg-warning/5 text-warning',
  platinum: 'bg-tier-platinum/20 text-[#703800]',
}

export function AdminMetricCard({ detail, icon: Icon, label, tone, trend, value }: AdminMetric) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <span className={cn('grid size-12 place-items-center rounded-lg', toneClasses[tone])}>
            <Icon aria-hidden="true" size={22} />
          </span>
          {trend && (
            <span className="flex items-center gap-1 text-xs font-medium leading-4 text-success">
              <TrendingUp size={14} />
              {trend}
            </span>
          )}
        </div>
        <p className="text-sm font-medium leading-4 text-on-surface-variant">{label}</p>
        <p className="mt-2 text-2xl font-medium leading-8 text-on-surface">{value}</p>
        {detail && <p className="mt-2 text-xs font-medium leading-4 text-on-surface-variant">{detail}</p>}
      </CardContent>
    </Card>
  )
}

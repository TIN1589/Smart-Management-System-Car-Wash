import type { MarketingFeature } from '@/features/marketing/data/marketing'
import { Card, CardContent } from '@/shared/components/ui/card'

export function BenefitCard({ description, icon: Icon, title }: MarketingFeature) {
  return (
    <Card>
      <CardContent className="flex min-h-24 items-center gap-4">
        <Icon aria-hidden="true" className="shrink-0 text-primary" size={24} />
        <div>
          <h3 className="text-lg font-medium leading-7 text-on-surface">{title}</h3>
          <p className="text-sm leading-5 text-on-surface-variant">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

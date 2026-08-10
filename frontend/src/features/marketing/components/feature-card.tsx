import type { MarketingFeature } from '@/features/marketing/data/marketing'
import { Card, CardContent } from '@/shared/components/ui/card'

export function FeatureCard({ description, icon: Icon, title }: MarketingFeature) {
  return (
    <Card className="min-h-48">
      <CardContent className="flex h-full flex-col gap-3">
        <span className="mb-2 grid size-12 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Icon aria-hidden="true" size={22} />
        </span>
        <h3 className="text-lg font-medium leading-7 text-on-surface">{title}</h3>
        <p className="text-sm leading-5 text-on-surface-variant">{description}</p>
      </CardContent>
    </Card>
  )
}

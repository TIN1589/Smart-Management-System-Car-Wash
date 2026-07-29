import { ChevronLeft, ChevronRight } from 'lucide-react'
import { promotions } from '@/features/client/data/client-dashboard'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { cn } from '@/shared/lib/utils'

export function PromotionsSection() {
  return (
    <section className="col-span-12" data-tour="promotions-section">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-medium leading-7 text-on-surface">Ưu đãi dành cho bạn</h3>
        <div className="flex gap-2">
          <Button aria-label="Ưu đãi trước" size="icon" type="button" variant="outline">
            <ChevronLeft size={18} />
          </Button>
          <Button aria-label="Ưu đãi sau" size="icon" type="button" variant="outline">
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>

      <div className="hide-scrollbar -mx-1 flex gap-4 overflow-x-auto px-1 pb-4">
        {promotions.map((promotion) => (
          <Card
            className="group w-[min(503px,calc(100vw-3rem))] shrink-0 overflow-hidden transition-colors hover:border-primary"
            key={promotion.title}
          >
            <div className="relative h-40 overflow-hidden bg-surface-container">
              <img
                alt={promotion.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                src={promotion.image}
              />
              {promotion.badge && (
                <span
                  className={cn(
                    'absolute left-3 top-3 rounded px-2 py-1 text-xs font-medium uppercase leading-4 text-white',
                    promotion.badge.tone === 'danger' ? 'bg-danger' : 'bg-primary',
                  )}
                >
                  {promotion.badge.value}
                </span>
              )}
            </div>
            <div className="p-4">
              <h4 className="mb-1 text-xl font-medium leading-7 text-on-surface">{promotion.title}</h4>
              <p className="mb-4 text-sm leading-5 text-on-surface-variant">{promotion.description}</p>
              <Button className="w-full bg-surface-container-low text-primary hover:bg-primary hover:text-white" type="button">
                {promotion.action}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}

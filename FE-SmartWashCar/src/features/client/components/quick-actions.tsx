import { quickActions } from '@/features/client/data/client-dashboard'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Link } from '@/app/router'

export function QuickActions() {
  return (
    <section className="col-span-12 lg:col-span-4" data-tour="quick-actions">
      <div className="grid h-full grid-cols-2 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon

          return (
            <Link 
              to={action.path as any} 
              key={action.label} 
              className="block cursor-pointer focus:outline-none"
            >
              <Card className="group transition-colors hover:border-primary h-full">
                <CardContent className="flex min-h-[134px] flex-col items-center justify-center gap-3 p-4 text-center h-full">
                  <span className="grid size-12 place-items-center rounded-full bg-surface-container-low text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Icon aria-hidden="true" size={24} />
                  </span>
                  <span className="text-sm font-medium leading-4 text-on-surface">{action.label}</span>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

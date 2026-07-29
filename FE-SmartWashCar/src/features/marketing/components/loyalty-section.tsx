import { Medal } from 'lucide-react'
import { loyaltyTiers } from '@/features/marketing/data/marketing'
import { Card, CardContent } from '@/shared/components/ui/card'
import { cn } from '@/shared/lib/utils'

export function LoyaltySection() {
  return (
    <section className="mb-24 grid items-center gap-6 rounded-xl border border-outline-variant bg-surface-container p-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,400px)]">
      <div className="grid gap-6">
        <div>
          <h2 className="text-xl font-medium leading-7 text-on-background">
            Chương trình Khách hàng Thân thiết
          </h2>
          <p className="mt-4 text-base leading-6 text-on-surface-variant">
            Nâng cấp hạng thành viên để tận hưởng những đặc quyền cao cấp nhất tại AutoWash Pro.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Các hạng thành viên">
          {loyaltyTiers.map((tier) => (
            <div className="grid justify-items-center gap-2" key={tier.name}>
              <span className={cn('h-10 w-16 rounded-full', tier.className)} />
              <strong className="text-sm font-medium leading-5">{tier.name}</strong>
            </div>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="grid min-h-28 place-items-center text-center">
          <Medal aria-hidden="true" className="text-warning" size={30} />
          <strong className="text-base font-medium leading-6 text-on-surface">Ưu đãi lên đến 20%</strong>
          <span className="text-xs leading-4 text-on-surface-variant">Dành cho hạng Platinum</span>
        </CardContent>
      </Card>
    </section>
  )
}

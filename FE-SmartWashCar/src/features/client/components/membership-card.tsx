import { CarFront } from 'lucide-react'
import { useSelector } from 'react-redux'
import { Button } from '@/shared/components/ui/button'
import type { RootState } from '@/app/store'
import { routes } from '@/app/routes'
import { useRouter } from '@/app/router'

export function MembershipCard() {
  const { navigate } = useRouter()
  const {
    balance,
    tier,
    totalVisits,
    remainingVisits,
    silverThreshold,
    goldThreshold,
    platinumThreshold,
    isLoading
  } = useSelector((state: RootState) => state.client.loyalty)

  const formattedBalance = new Intl.NumberFormat('vi-VN').format(balance)
  
  // Tier calculation logic based on visits from system config
  const sThresh = silverThreshold !== undefined ? silverThreshold : 10
  const gThresh = goldThreshold !== undefined ? goldThreshold : 25
  const pThresh = platinumThreshold !== undefined ? platinumThreshold : 50

  let nextTierName = 'Silver'
  let currentTierThreshold = 0
  let nextTierThreshold = sThresh
  const tierLower = (tier || 'Regular').toLowerCase()

  if (tierLower === 'regular' || tierLower === 'member') {
    nextTierName = 'Silver'
    currentTierThreshold = 0
    nextTierThreshold = sThresh
  } else if (tierLower === 'silver') {
    nextTierName = 'Gold'
    currentTierThreshold = sThresh
    nextTierThreshold = gThresh
  } else if (tierLower === 'gold') {
    nextTierName = 'Platinum'
    currentTierThreshold = gThresh
    nextTierThreshold = pThresh
  } else {
    nextTierName = ''
  }

  // Calculate progress based on visits (lượt rửa xe)
  const remainingVisitsCount = remainingVisits !== undefined ? remainingVisits : Math.max(0, nextTierThreshold - totalVisits)
  const range = nextTierThreshold - currentTierThreshold
  const currentProgressInTier = totalVisits - currentTierThreshold
  const progressPercent = nextTierName
    ? Math.min(100, Math.max(0, (currentProgressInTier / range) * 100))
    : 100

  return (
    <section className="col-span-12 lg:col-span-8" data-tour="membership-card">
      <div className="relative flex h-full min-h-[292px] flex-col justify-between overflow-hidden rounded-xl bg-primary p-6 text-primary-foreground">
        <div className="absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-3xl" />
        <CarFront className="absolute bottom-6 right-6 opacity-20" size={120} />

        <div className="relative">
          <div className="mb-6 flex items-start justify-between gap-6">
            <div>
              <span className="mb-3 inline-block rounded-lg bg-tier-gold px-3 py-1 text-xs font-medium uppercase tracking-wide text-[#2f1400]">
                Hạng {tier}
              </span>
              <h2 className="text-[32px] font-medium leading-10">Tình trạng thành viên</h2>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium leading-4 text-white/80">Điểm hiện tại</p>
              <p className="text-2xl font-medium leading-8">{isLoading ? '...' : `${formattedBalance} điểm`}</p>
            </div>
          </div>

          {nextTierName && (
            <div className="mt-8">
              <div className="mb-2 flex items-center justify-between gap-4">
                <span className="text-sm font-medium leading-4">Tiến trình thăng hạng (theo số lần rửa xe)</span>
                <span className="text-sm font-medium leading-4 text-tier-gold">
                  còn {remainingVisitsCount} lượt rửa → {nextTierName}
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-white/20">
                <div className="h-3 rounded-full bg-tier-gold" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className="relative mt-8 flex flex-wrap gap-4">
          <Button 
            onClick={() => navigate(routes.loyalty)}
            className="bg-white px-6 text-primary hover:bg-surface-container-low cursor-pointer" 
            type="button"
          >
            Xem quyền lợi & lịch sử điểm
          </Button>
          <Button
            onClick={() => navigate(routes.booking)}
            className="border-white/40 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white cursor-pointer"
            type="button"
            variant="outline"
          >
            Đặt lịch & Dùng điểm
          </Button>
        </div>
      </div>
    </section>
  )
}

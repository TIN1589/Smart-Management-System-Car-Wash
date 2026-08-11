import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ClientSidebar } from '@/features/client/components/client-sidebar'
import { ClientTopbar } from '@/features/client/components/client-topbar'
import { MembershipCard } from '@/features/client/components/membership-card'
import { QuickActions } from '@/features/client/components/quick-actions'
import { UpcomingAppointment } from '@/features/client/components/upcoming-appointment'
import type { AppDispatch, RootState } from '@/app/store'
import { fetchBookings, fetchLoyaltyBalance, fetchVehicles } from '@/features/client/store/client-slice'

export function ClientDashboardPage() {
  const dispatch = useDispatch<AppDispatch>()
  const user = useSelector((state: RootState) => state.auth.user)

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchLoyaltyBalance(user.id))
    }
    dispatch(fetchVehicles())
    dispatch(fetchBookings())
  }, [dispatch, user?.id])

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <ClientSidebar />
      <ClientTopbar />

      <main className="min-h-screen px-6 pb-8 pt-24 lg:pl-[calc(16rem+24px)]">
        <div className="mx-auto grid max-w-[1280px] grid-cols-12 gap-6">
          <MembershipCard />
          <QuickActions />
          <UpcomingAppointment />
        </div>
      </main>
    </div>
  )
}

import { CalendarClock, MoreVertical } from 'lucide-react'
import { useSelector } from 'react-redux'
import { Card, CardContent } from '@/shared/components/ui/card'
import type { RootState } from '@/app/store'
import { routes } from '@/app/routes'
import { Link } from '@/app/router'

export function UpcomingAppointment() {
  const { items, isLoading } = useSelector((state: RootState) => state.client.bookings)

  // Filter for upcoming bookings (PENDING, CONFIRMED or IN_PROGRESS)
  const upcomingBookings = items
    .filter((booking) => booking.status === 'PENDING' || booking.status === 'CONFIRMED' || booking.status === 'IN_PROGRESS')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())

  const latestBooking = upcomingBookings[0]

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date)
    } catch {
      return dateString
    }
  }

  return (
    <section className="col-span-12" data-tour="upcoming-appointment">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-medium leading-7 text-on-surface">Lịch hẹn sắp tới</h3>
        <Link className="text-sm font-medium leading-4 text-primary hover:underline" to={routes.history}>
          Xem tất cả
        </Link>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-8 text-center text-on-surface-variant">
            Đang tải thông tin lịch hẹn...
          </CardContent>
        </Card>
      ) : latestBooking ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-between gap-6 p-6 md:flex-row">
            <div className="flex w-full items-center gap-6 md:w-auto">
              <span className="grid size-16 place-items-center rounded-xl bg-surface-container text-primary">
                <CalendarClock aria-hidden="true" size={32} />
              </span>
              <div>
                <p className="text-xl font-medium leading-7 text-on-surface">
                  {latestBooking.vehicleDetails?.licensePlate || latestBooking.licensePlate || 'Chưa rõ xe'}
                </p>
                <p className="text-base leading-6 text-on-surface-variant">
                  {((latestBooking as any).selectedServices && (latestBooking as any).selectedServices.length > 0
                    ? (latestBooking as any).selectedServices.map((s: any) => s.name || s.serviceName).join(', ')
                    : (latestBooking.serviceType || 'Chưa chọn'))} {latestBooking.notes ? `• ${latestBooking.notes}` : ''}
                </p>
              </div>
            </div>

            <div className="w-full md:w-auto md:text-right">
              <p className="text-lg font-medium leading-7 text-on-surface">
                {formatDate(latestBooking.scheduledAt)}
              </p>
              <p className="text-sm leading-5 text-on-surface-variant">
                {latestBooking.branchName || 'Chi nhánh Autowash Pro'}
              </p>
            </div>

            <div className="flex w-full items-center gap-4 border-t border-outline-variant pt-4 md:w-auto md:border-l md:border-t-0 md:pl-6 md:pt-0">
              <span className="rounded-lg border border-success/20 bg-success/10 px-4 py-2 text-sm font-medium uppercase leading-4 text-success">
                {latestBooking.status}
              </span>
              <button className="text-on-surface-variant hover:text-primary" type="button" aria-label="Tùy chọn">
                <MoreVertical size={22} />
              </button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed bg-surface-container-lowest">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center gap-4">
            <CalendarClock className="size-12 text-outline-variant" strokeWidth={1.5} />
            <div>
              <p className="text-base font-medium text-on-surface">Bạn chưa có lịch hẹn sắp tới</p>
              <p className="text-sm text-on-surface-variant">Đăng ký lịch rửa xe để nhận dịch vụ chăm sóc tốt nhất</p>
            </div>
            <Link to={routes.booking} className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white transition-shadow hover:shadow-md">
              Đặt lịch ngay
            </Link>
          </CardContent>
        </Card>
      )}
    </section>
  )
}

import { Bell, CalendarCheck, Gift, Info, ShieldCheck } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { ClientSidebar } from '@/features/client/components/client-sidebar'
import { ClientTopbar } from '@/features/client/components/client-topbar'
import { cn } from '@/shared/lib/utils'

type NotificationItem = {
  id: number
  icon: typeof Bell
  isUnread: boolean
  message: string
  time: string
  title: string
  tone: 'primary' | 'success' | 'warning' | 'info'
}

const notifications: NotificationItem[] = [
  {
    id: 1,
    icon: CalendarCheck,
    isUnread: true,
    message: 'Lịch rửa xe của bạn lúc 09:30 ngày mai đã được xác nhận.',
    time: '5 phút trước',
    title: 'Xác nhận đặt lịch',
    tone: 'success',
  },
  {
    id: 2,
    icon: Gift,
    isUnread: true,
    message: 'Bạn vừa nhận thêm 120 điểm thưởng sau đơn hàng gần nhất.',
    time: '1 giờ trước',
    title: 'Cộng điểm thành công',
    tone: 'primary',
  },
  {
    id: 3,
    icon: Info,
    isUnread: false,
    message: 'Gói phủ Ceramic Pro đang giảm 15% cho hội viên trong tuần này.',
    time: 'Hôm qua',
    title: 'Ưu đãi mới',
    tone: 'info',
  },
  {
    id: 4,
    icon: ShieldCheck,
    isUnread: false,
    message: 'Thông tin hồ sơ của bạn đã được cập nhật an toàn.',
    time: '2 ngày trước',
    title: 'Cập nhật tài khoản',
    tone: 'warning',
  },
]

const toneClasses = {
  info: 'bg-info/10 text-info',
  primary: 'bg-primary-fixed text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
}

export function ClientNotificationsPage() {
  const unreadCount = notifications.filter((item) => item.isUnread).length

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <ClientSidebar />
      <ClientTopbar title="Thông báo" />

      <main className="min-h-screen px-6 pb-8 pt-24 lg:pl-[calc(16rem+24px)]">
        <div className="mx-auto max-w-[1280px]">
          <section className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-medium leading-8 text-primary">Trung tâm thông báo</h2>
              <p className="text-sm leading-5 text-on-surface-variant">
                Theo dõi lịch hẹn, điểm thưởng và ưu đãi dành riêng cho bạn.
              </p>
            </div>

            <Button className="h-10 px-4" type="button" variant="outline">
              Đánh dấu đã đọc
            </Button>
          </section>

          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <section className="space-y-3">
              {notifications.map((notification) => {
                const Icon = notification.icon

                return (
                  <Card
                    className={cn(
                      'flex gap-4 p-5 transition-all hover:shadow-md',
                      notification.isUnread && 'border-primary/40 bg-primary/5'
                    )}
                    key={notification.id}
                  >
                    <div
                      className={cn(
                        'grid size-12 shrink-0 place-items-center rounded-xl',
                        toneClasses[notification.tone]
                      )}
                    >
                      <Icon size={22} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold leading-6 text-on-surface">
                          {notification.title}
                        </h3>
                        {notification.isUnread ? <Badge variant="confirmed">Mới</Badge> : null}
                      </div>
                      <p className="text-sm leading-5 text-on-surface-variant">
                        {notification.message}
                      </p>
                      <p className="mt-3 text-xs font-medium text-outline">{notification.time}</p>
                    </div>
                  </Card>
                )
              })}
            </section>

            <aside className="space-y-4">
              <Card className="p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-primary-fixed text-primary">
                    <Bell size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-on-surface">Thông báo chưa đọc</p>
                    <p className="text-2xl font-semibold text-primary">{unreadCount}</p>
                  </div>
                </div>
                <p className="text-sm leading-5 text-on-surface-variant">
                  Bạn có {unreadCount} thông báo mới cần xem trong hôm nay.
                </p>
              </Card>

              <Card className="p-5">
                <h3 className="mb-3 text-base font-semibold text-on-surface">Loại thông báo</h3>
                <div className="space-y-3 text-sm text-on-surface-variant">
                  <div className="flex items-center justify-between">
                    <span>Lịch hẹn</span>
                    <span className="font-medium text-on-surface">1</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Điểm thưởng</span>
                    <span className="font-medium text-on-surface">1</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Ưu đãi</span>
                    <span className="font-medium text-on-surface">1</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tài khoản</span>
                    <span className="font-medium text-on-surface">1</span>
                  </div>
                </div>
              </Card>
            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}

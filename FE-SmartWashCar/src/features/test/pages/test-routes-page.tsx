import { ArrowRight } from 'lucide-react'
import { Link } from '@/app/router'
import { routes, type AppPath } from '@/app/routes'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'

const testRoutes: Array<{
  description: string
  label: string
  path: AppPath
}> = [
  {
    label: 'Landing',
    path: routes.home,
    description: 'Trang giới thiệu trước đăng nhập.',
  },
  {
    label: 'Đăng nhập',
    path: routes.login,
    description: 'Form đăng nhập bằng số điện thoại.',
  },
  {
    label: 'Đăng ký',
    path: routes.register,
    description: 'Form tạo tài khoản khách hàng.',
  },
  {
    label: 'OTP',
    path: routes.otp,
    description: 'Màn xác thực mã OTP.',
  },
  {
    label: 'Client Dashboard',
    path: routes.dashboard,
    description: 'Trang home dashboard sau đăng nhập.',
  },
  {
    label: 'Admin Dashboard',
    path: routes.admin,
    description: 'Trang tổng quan hệ thống dành cho role admin.',
  },
  {
    label: 'Admin Promotions',
    path: routes.adminPromotions,
    description: 'Trang quản lý chương trình khuyến mãi dành cho admin.',
  },
  {
    label: 'Admin Configuration',
    path: routes.adminConfiguration,
    description: 'Trang cấu hình tier, điểm thưởng và danh mục đổi thưởng.',
  },
  {
    label: 'Admin Bookings',
    path: routes.adminBookings,
    description: 'Trang quản lý booking của Admin.',
  },
  {
    label: 'Admin Customers',
    path: routes.customer,
    description: 'Trang quản lý khách hàng của Admin.',
  },
  {
    label: 'Admin Rewards',
    path: routes.rewards,
    description: 'Trang quản lý/đổi thưởng của Admin.',
  },
  {
    label: 'Client Booking',
    path: routes.booking,
    description: 'Trang đặt lịch dịch vụ của khách hàng.',
  },
  {
    label: 'Client Loyalty',
    path: routes.loyalty,
    description: 'Trang điểm thưởng và lịch sử ưu đãi.',
  },
]

export function TestRoutesPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[960px] px-6 pb-12 pt-28">
      <div className="mb-6">
        <p className="text-sm font-medium leading-4 text-primary">Dev navigation</p>
        <h1 className="mt-2 text-3xl font-medium leading-10 text-on-background">Test routes</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {testRoutes.map((route) => (
          <Card className="transition-colors hover:border-primary" key={route.path}>
            <CardContent className="grid gap-4">
              <div>
                <h2 className="text-xl font-medium leading-7 text-on-surface">{route.label}</h2>
                <p className="mt-2 text-sm leading-5 text-on-surface-variant">{route.description}</p>
                <code className="mt-3 inline-block rounded bg-surface-container-low px-2 py-1 text-sm text-primary">
                  {route.path}
                </code>
              </div>
              <Button asChild className="justify-between">
                <Link to={route.path}>
                  Mở trang
                  <ArrowRight size={18} />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}

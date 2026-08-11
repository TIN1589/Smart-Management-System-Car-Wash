import { adminNavItems, type AdminNavKey } from '@/features/admin/data/admin-dashboard'
import { Link } from '@/app/router'
import { routes, type AppPath } from '@/app/routes'
import { cn } from '@/shared/lib/utils'
import { LogOut } from 'lucide-react'
import { authStore } from '@/features/auth/store/auth-store'

type AdminSidebarProps = {
  activeItem?: AdminNavKey
}

const navRouteMap: Partial<Record<AdminNavKey, AppPath>> = {
  dashboard: routes.admin,
  booking: routes.adminBookings,
  customers: routes.customer,
  promotion: routes.adminPromotions,
  articles: routes.adminArticles,
  configuration: routes.adminConfiguration,
  reports: routes.adminReports,
  services: routes.adminServices
}

export function AdminSidebar({ activeItem = 'dashboard' }: AdminSidebarProps) {
  return (
    <aside className='fixed left-0 top-0 z-50 hidden h-full w-64 flex-col border-r border-border bg-surface px-4 py-6 lg:flex'>
      <div className='mb-10 px-3'>
        <h1 className='text-xl font-medium leading-7 text-primary'>
          AutoWash Pro
        </h1>
        <p className='text-sm font-medium leading-4 text-on-surface-variant'>
          Admin Dashboard
        </p>
      </div>

      <nav className='flex-1 space-y-2'>
        {adminNavItems.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.key
          const itemRoute = navRouteMap[item.key]

          const targetPath = itemRoute || routes.admin

          return (
            /*  Sửa từ thẻ <button> thành thẻ <Link> và truyền targetPath vào */
            <Link
              to={targetPath}
              className={cn(
                'flex w-full items-center gap-4 rounded-lg p-3 text-left text-sm font-medium leading-4 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary',
                isActive &&
                  'border-l-4 border-primary bg-surface-container-low text-primary'
              )}
              key={item.label}
            >
              <Icon aria-hidden='true' size={22} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className='mt-auto flex items-center justify-between border-t border-border px-3 pt-4'>
        <div className='flex items-center gap-3 min-w-0'>
          <span className='grid size-8 shrink-0 place-items-center rounded-full bg-[linear-gradient(145deg,#1b2838,#6c859b)] text-xs text-white'>
            AU
          </span>
          <div className='min-w-0'>
            <p className='truncate text-sm font-medium leading-4 text-on-surface'>
              Admin User
            </p>
            <p className='text-[10px] leading-4 text-on-surface-variant'>
              System Root
            </p>
          </div>
        </div>
        <button
          onClick={() => authStore.logout()}
          className='rounded-md p-1.5 text-outline hover:bg-surface-container hover:text-red-500 transition-colors cursor-pointer'
          title='Đăng xuất'
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  )
}

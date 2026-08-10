import { adminNavItems, type AdminNavKey } from '@/features/admin/data/admin-dashboard'
import { Link, useRouter } from '@/app/router'
import { routes, type AppPath } from '@/app/routes'
import { cn } from '@/shared/lib/utils'
import { LogOut, X } from 'lucide-react'
import { authStore } from '@/features/auth/store/auth-store'

type AdminSidebarProps = {
  activeItem?: AdminNavKey
  mobileOpen?: boolean
  onMobileClose?: () => void
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

export function AdminSidebar({ activeItem, mobileOpen = false, onMobileClose }: AdminSidebarProps) {
  const { path } = useRouter()

  // Tự động xác định menu item active dựa trên path hiện tại nếu activeItem không được truyền vào
  const detectedActive = (Object.keys(navRouteMap) as AdminNavKey[]).find(
    (key) => navRouteMap[key] === path
  )
  const currentActive = activeItem || detectedActive || 'dashboard'

  const renderNavContent = () => (
    <>
      <div className='mb-8 px-3 flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-medium leading-7 text-primary'>
            AutoWash Pro
          </h1>
          <p className='text-sm font-medium leading-4 text-on-surface-variant'>
            Admin Dashboard
          </p>
        </div>
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className='rounded-lg p-2 text-on-surface-variant hover:bg-slate-100 lg:hidden cursor-pointer'
            aria-label="Đóng menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav className='flex-1 space-y-1.5 overflow-y-auto'>
        {adminNavItems.map((item) => {
          const Icon = item.icon
          const isActive = currentActive === item.key
          const itemRoute = navRouteMap[item.key]
          const targetPath = itemRoute || routes.admin

          return (
            <Link
              to={targetPath}
              onClick={() => onMobileClose?.()}
              className={cn(
                'flex w-full items-center gap-4 rounded-lg p-3 text-left text-sm font-medium leading-4 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary',
                isActive &&
                  'border-l-4 border-primary bg-surface-container-low text-primary font-semibold'
              )}
              key={item.label}
            >
              <Icon aria-hidden='true' size={20} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className='mt-auto flex items-center justify-between border-t border-border px-3 pt-4'>
        <div className='flex items-center gap-3 min-w-0'>
          <span className='grid size-8 shrink-0 place-items-center rounded-full bg-[linear-gradient(145deg,#1b2838,#6c859b)] text-xs text-white font-bold'>
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
    </>
  )

  return (
    <>
      {/* Desktop Sidebar cố định */}
      <aside className='fixed left-0 top-0 z-50 hidden h-full w-64 flex-col border-r border-border bg-surface px-4 py-6 lg:flex'>
        {renderNavContent()}
      </aside>

      {/* Mobile Drawer Navigation Overlay */}
      {mobileOpen && (
        <div className='fixed inset-0 z-50 flex lg:hidden'>
          <div
            className='fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity'
            onClick={onMobileClose}
          />
          <aside className='relative z-10 flex h-full w-72 max-w-[80vw] flex-col border-r border-border bg-surface px-4 py-6 shadow-2xl animate-in slide-in-from-left duration-200'>
            {renderNavContent()}
          </aside>
        </div>
      )}
    </>
  )
}

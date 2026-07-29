import { Bell, HelpCircle, Settings, Smartphone, Menu, X, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { Link, useRouter } from '@/app/router'
import { routes } from '@/app/routes'
import { Button } from '@/shared/components/ui/button'
import type { RootState } from '@/app/store'
import { logout } from '@/features/auth/store/auth-slice'
import { clearClientState } from '@/features/client/store/client-slice'
import { dashboardLogoutItem, dashboardNavItems } from '@/features/client/data/client-dashboard'
import { cn } from '@/shared/lib/utils'

type ClientTopbarProps = {
  title?: string
  utility?: 'help' | 'settings'
}

export function ClientTopbar({ title, utility = 'help' }: ClientTopbarProps) {
  const dispatch = useDispatch()
  const { path, navigate } = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const user = useSelector((state: RootState) => state.auth.user)
  const displayName = user?.name || user?.fullName || user?.phone || 'Khách hàng'
  const displayTitle = title || `Xin chào, ${displayName}`
  const UtilityIcon = utility === 'settings' ? Settings : HelpCircle
  const utilityLabel = utility === 'settings' ? 'Cài đặt' : 'Trợ giúp'

  return (
    <>
      <header className="fixed right-0 top-0 z-30 flex h-16 w-full items-center justify-between border-b border-outline-variant bg-surface px-6 lg:w-[calc(100%-16rem)]">
        <div className="flex items-center gap-3">
          <Button 
            aria-label="Menu" 
            size="icon" 
            variant="ghost" 
            className="lg:hidden text-on-surface-variant shrink-0" 
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
          <h2 className="text-lg md:text-xl font-medium leading-7 text-on-surface line-clamp-1">{displayTitle}</h2>
        </div>

        <div className="flex items-center gap-4">
          <Button aria-label="Thông báo" asChild size="icon" variant="ghost">
            <Link to={routes.notifications}>
              <Bell className="size-5 text-on-surface-variant" />
            </Link>
          </Button>
          <Button aria-label={utilityLabel} size="icon" type="button" variant="ghost">
            <UtilityIcon className="size-5 text-on-surface-variant" />
          </Button>
          <div className="h-8 w-px bg-outline-variant" />
          <button
            aria-label="Hồ sơ"
            className="grid size-10 place-items-center rounded-full border border-outline-variant bg-surface-container-low text-on-surface-variant"
            type="button"
          >
            <Smartphone size={22} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-slate-950/20 backdrop-blur-xs transition-opacity" 
            onClick={() => setMenuOpen(false)}
          />

          {/* Drawer content panel */}
          <div className="relative flex w-64 max-w-xs flex-1 flex-col bg-surface py-6 shadow-xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between mb-8 px-6">
              <div>
                <h1 className="text-xl font-bold text-primary">AutoWash Pro</h1>
                <p className="text-[10px] font-medium uppercase tracking-wide text-on-surface-variant">Customer Portal</p>
              </div>
              <Button size="icon" variant="ghost" className="text-on-surface-variant" onClick={() => setMenuOpen(false)}>
                <X className="size-5" />
              </Button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto">
              {dashboardNavItems.map((item) => {
                const Icon = item.icon
                const isActive = (item.activePath || item.path) === path

                return (
                  <Link
                    to={item.path}
                    className={cn(
                      'flex w-full items-center gap-3 px-5 py-3 text-left text-sm font-medium leading-4 text-on-surface-variant transition-colors hover:bg-surface-container-low',
                      isActive && 'border-l-4 border-primary bg-surface-container-low pl-4 text-primary'
                    )}
                    key={item.label}
                    onClick={() => setMenuOpen(false)}
                  >
                    <Icon aria-hidden="true" size={20} />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <div className="border-t border-outline-variant px-6 pt-6 mt-auto">
              <Button
                onClick={() => {
                  setMenuOpen(false)
                  dispatch(logout())
                  dispatch(clearClientState())
                  toast.success('Đăng xuất thành công!')
                  navigate(routes.login)
                }}
                className="w-full justify-start gap-3 px-0 text-on-surface-variant hover:text-danger"
                variant="ghost"
              >
                <LogOut aria-hidden="true" size={20} />
                {dashboardLogoutItem.label}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

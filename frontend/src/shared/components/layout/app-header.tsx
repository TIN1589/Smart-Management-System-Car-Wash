import { useState } from 'react'
import { Link, useRouter } from '@/app/router'
import { routes } from '@/app/routes'
import { Button } from '@/shared/components/ui/button'
import { Phone, Menu, X, Bell, HelpCircle } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import logo from '@/shared/assets/logo.png'
import { authStore } from '@/features/auth/store/auth-store'
export function AppHeader() {
  const { path } = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const links = [
    { to: routes.home, label: 'Trang chủ' },
    { to: routes.booking, label: 'Dịch vụ' },
    { to: routes.contact, label: 'Liên hệ' }
  ]

  // Decide if we should show the marketing navbar mode
  // The user says: "Đối với navbar ở trang marketing sẽ có hotline với nút đăng nhập chứ chưa hiện phần user"
  // So if we are on the homepage (routes.home), we show the hotline and login button, and hide the user section.
  const isMarketingPage = path === routes.home || path === routes.contact

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-16 w-full items-center border-b bg-surface/95 backdrop-blur-md px-6 justify-between">
      <div className="flex items-center">
        <Link to={routes.home} className="flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-wider text-primary font-display flex items-center gap-2">
            <img 
              src={logo}
              alt="Logo"
              className="w-10 h-10"
            />
          </span>
        </Link>
      </div>

      {isMarketingPage && (
        <nav className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={cn(
                'text-sm font-semibold transition-colors hover:text-primary font-display',
                path === link.to ? 'text-primary' : 'text-on-surface-variant'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}

      <div className="flex items-center gap-4">
        {isMarketingPage ? (
          <>
            <div className="flex flex-col text-right hidden lg:flex">
              <span className="text-[10px] text-on-surface-variant font-medium">Hotline hỗ trợ</span>
              <a href="tel:19001234" className="text-xs font-bold text-primary flex items-center gap-1 font-display">
                <Phone className="h-3 w-3" />
                1900 1234
              </a>
            </div>
            {authStore.isAuthenticated() ? (
              <Link to={authStore.getUser()?.role === 'ADMIN' ? routes.admin : routes.dashboard}>
                <Button size="sm" className="rounded-full font-bold px-5 shadow-sm">
                  Bảng điều khiển
                </Button>
              </Link>
            ) : (
              <Link to={routes.login}>
                <Button size="sm" className="rounded-full font-bold px-5 shadow-sm">
                  Đăng nhập
                </Button>
              </Link>
            )}
          </>
        ) : (
          <div className="flex items-center gap-4" aria-label="Tác vụ tài khoản">
            <Button aria-label="Trợ giúp" size="icon" type="button" variant="ghost">
              <HelpCircle className="size-5 text-on-surface-variant" />
            </Button>
            <Button aria-label="Thông báo" asChild size="icon" variant="ghost">
              <Link to={routes.notifications}>
                <Bell className="size-5 text-on-surface-variant" />
              </Link>
            </Button>
          </div>
        )}

        {isMarketingPage && (
          <button
            className="md:hidden p-2 text-on-surface"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        )}
      </div>

      {/* Mobile Menu */}
      {isMarketingPage && mobileMenuOpen && (
        <div className="md:hidden border-t bg-surface px-6 py-4 space-y-4 shadow-lg absolute top-16 left-0 w-full animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-3">
            {links.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={cn(
                  'text-sm font-semibold transition-colors py-2 font-display block',
                  path === link.to ? 'text-primary' : 'text-on-surface'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="pt-4 border-t flex flex-col gap-4">
            <a href="tel:19001234" className="flex items-center gap-2 text-primary font-bold text-sm">
              <Phone className="h-4 w-4" />
              1900 1234
            </a>
            {authStore.isAuthenticated() ? (
              <Link to={authStore.getUser()?.role === 'ADMIN' ? routes.admin : routes.dashboard} onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full rounded-full font-bold" size="sm">
                  Bảng điều khiển
                </Button>
              </Link>
            ) : (
              <Link to={routes.login} onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full rounded-full font-bold" size="sm">
                  Đăng nhập
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

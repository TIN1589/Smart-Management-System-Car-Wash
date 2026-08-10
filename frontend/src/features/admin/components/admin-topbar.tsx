import { Bell, CircleHelp, Menu, Plus, Search } from 'lucide-react'
import { Link } from '@/app/router'
import { routes } from '@/app/routes'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import type { ReactNode } from 'react'

type AdminTopbarProps = {
  title?: string
  showSearch?: boolean
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (val: string) => void
  actions?: ReactNode
  onMobileMenuToggle?: () => void
}

export function AdminTopbar({
  title,
  showSearch = true,
  searchPlaceholder = 'Tìm kiếm giao dịch, khách hàng...',
  searchValue = '',
  onSearchChange,
  actions,
  onMobileMenuToggle
}: AdminTopbarProps) {
  return (
    <header className="fixed left-0 right-0 top-0 z-40 h-16 border-b border-outline-variant bg-surface lg:left-64">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          {onMobileMenuToggle && (
            <button
              type="button"
              onClick={onMobileMenuToggle}
              className="rounded-lg p-2 text-on-surface-variant hover:bg-slate-100 lg:hidden cursor-pointer"
              aria-label="Mở menu điều hướng"
            >
              <Menu size={22} />
            </button>
          )}

          {title ? (
            <h1 className="text-lg font-semibold leading-7 text-primary md:text-xl">{title}</h1>
          ) : showSearch ? (
            <label className="relative hidden w-80 md:block lg:w-96">
              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-outline" />
              <Input
                className="h-10 bg-surface-container-low pl-12 text-xs md:h-12 md:text-sm"
                placeholder={searchPlaceholder}
                type="search"
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
              />
            </label>
          ) : null}
        </div>

        <div className="ml-auto flex items-center gap-3 md:gap-6">
          <div className="flex items-center gap-2 md:gap-4 text-on-surface-variant">
            <Button aria-label="Thông báo" asChild size="icon" variant="ghost" className="relative">
              <Link to={routes.notifications}>
                <Bell size={20} />
                <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-error" />
              </Link>
            </Button>
            <Button aria-label="Trợ giúp" size="icon" type="button" variant="ghost" className="hidden sm:inline-flex">
              <CircleHelp size={20} />
            </Button>
          </div>
          <div className="h-6 w-px bg-outline-variant hidden sm:block" />
          
          {actions !== undefined ? (
            actions
          ) : (
            <Button asChild className="h-9 gap-1.5 px-3 text-xs md:h-10 md:gap-2 md:px-4 md:text-sm">
              <Link to={routes.adminBookings}>
                <Plus size={16} />
                <span className="hidden sm:inline">Booking Mới</span>
                <span className="sm:hidden">Mới</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

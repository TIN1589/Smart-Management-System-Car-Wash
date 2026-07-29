import { Bell, CircleHelp, Plus, Search } from 'lucide-react'
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
}

export function AdminTopbar({
  title,
  showSearch = true,
  searchPlaceholder = 'Tìm kiếm giao dịch, khách hàng...',
  searchValue = '',
  onSearchChange,
  actions
}: AdminTopbarProps) {
  return (
    <header className="fixed left-0 right-0 top-0 z-40 h-16 border-b border-outline-variant bg-surface lg:left-64">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        {title ? (
          <h1 className="text-xl font-medium leading-7 text-primary">{title}</h1>
        ) : showSearch ? (
          <label className="relative hidden w-96 md:block">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-outline" />
            <Input
              className="h-12 bg-surface-container-low pl-12"
              placeholder={searchPlaceholder}
              type="search"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
          </label>
        ) : (
          <div />
        )}

        <div className="ml-auto flex items-center gap-6">
          <div className="flex items-center gap-4 text-on-surface-variant">
            <Button aria-label="Thông báo" asChild size="icon" variant="ghost" className="relative">
              <Link to={routes.notifications}>
                <Bell size={20} />
                <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-error" />
              </Link>
            </Button>
            <Button aria-label="Trợ giúp" size="icon" type="button" variant="ghost">
              <CircleHelp size={20} />
            </Button>
          </div>
          <div className="h-6 w-px bg-outline-variant" />
          
          {actions !== undefined ? (
            actions
          ) : (
            <Button className="h-10 gap-2 px-4" type="button">
              <Plus size={16} />
              Booking Mới
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

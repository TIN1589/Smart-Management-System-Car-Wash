import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { Link, useRouter } from '@/app/router'
import { routes } from '@/app/routes'
import { Button } from '@/shared/components/ui/button'
import { logout } from '@/features/auth/store/auth-slice'
import { clearClientState } from '@/features/client/store/client-slice'
import { dashboardLogoutItem, dashboardNavItems } from '@/features/client/data/client-dashboard'
import { cn } from '@/shared/lib/utils'

export function ClientSidebar() {
  const dispatch = useDispatch()
  const { path, navigate } = useRouter()
  const LogoutIcon = dashboardLogoutItem.icon

  return (
    <aside className='fixed left-0 top-0 z-40 hidden h-full w-64 flex-col border-r border-outline-variant bg-surface py-6 lg:flex'>
      <div className='mb-8 px-6'>
        <h1 className='text-2xl font-medium leading-8 text-primary'>
          AutoWash Pro
        </h1>
        <p className='text-xs font-medium uppercase leading-4 tracking-wide text-on-surface-variant'>
          Customer Portal
        </p>
      </div>

      <nav className='flex-1 space-y-1'>
        {dashboardNavItems.map((item) => {
          const Icon = item.icon
          const isActive = (item.activePath || item.path) === path

          const targetPath = item.path

          return (
            <Link
              to={targetPath}
              className={cn(
                'flex w-full items-center gap-3 px-5 py-3 text-left text-sm font-medium leading-4 text-on-surface-variant transition-colors hover:bg-surface-container-low',
                isActive &&
                  'border-l-4 border-primary bg-surface-container-low pl-4 text-primary'
              )}
              key={item.label}
            >
              <Icon aria-hidden='true' size={20} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className='border-t border-outline-variant px-6 pt-6'>
        <Button
          onClick={() => {
            dispatch(logout())
            dispatch(clearClientState())
            toast.success('Đăng xuất thành công!')
            navigate(routes.login)
          }}
          className='w-full justify-start gap-3 px-0 text-on-surface-variant hover:text-danger'
          variant='ghost'
        >
          <LogoutIcon aria-hidden='true' size={20} />
          {dashboardLogoutItem.label}
        </Button>
      </div>
    </aside>
  )
}

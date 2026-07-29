import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode
} from 'react'
import { AdminCustomerPage } from '@/features/admin/pages/admin-customer-page'
import { AdminRewardsPage } from '@/features/admin/pages/admin-rewards-page'
import { AdminServicesPage } from '@/features/admin/pages/admin-services-page'
import { MainLayout } from '@/shared/components/layout/main-layout'
import { AdminConfigurationPage } from '@/features/admin/pages/admin-configuration-page'
import { AdminDashboardPage } from '@/features/admin/pages/admin-dashboard-page'
import { AdminBookingsPage } from '@/features/admin/pages/admin-bookings-page'
import { AdminPromotionsPage } from '@/features/admin/pages/admin-promotions-page'
import { AdminReportsPage } from '@/features/admin/pages/admin-reports-page'
import { AuthPage } from '@/features/auth/pages/auth-page'
import { BookingPage } from '@/features/booking/pages/booking-page'
import { ClientDashboardPage } from '@/features/client/pages/client-dashboard-page'
import { ClientProfilePage } from '@/features/client/pages/client-profile-page'
import { ClientVehiclesPage } from '@/features/client/pages/client-vehicles-page'
import { ClientHistoryPage } from '@/features/client/pages/client-history-page'
import { ClientArticlesPage } from '@/features/client/pages/client-articles-page'
import { ClientNotificationsPage } from '@/features/client/pages/client-notifications-page'
import { AdminArticlesPage } from '@/features/admin/pages/admin-articles-page'
import { HomePage } from '@/features/marketing/pages/home-page'
import { ContactPage } from '@/features/marketing/pages/contact-page'
import { LoyaltyPage } from '@/features/client/pages/loyalty-page'
import ClientPromotionsPage from '@/features/client/pages/client-promotions-page'
import { OtpPage } from '@/features/auth/pages/otp-page'
import { TestRoutesPage } from '@/features/test/pages/test-routes-page'
import { isAppPath, routes, type AppPath } from './routes'
import { authStore } from '@/features/auth/store/auth-store'

const protectedRoutes: AppPath[] = [
  routes.dashboard,
  routes.profile,
  routes.vehicles,
  routes.booking,
  routes.history,
  routes.loyalty,
  routes.promotions,
  routes.notifications,
  routes.articles,
  routes.adminArticles,
  routes.admin,
  routes.adminBookings,
  routes.customer,
  routes.rewards,
  routes.adminPromotions,
  routes.adminReports,
  routes.adminConfiguration,
  routes.adminServices,
]

const adminRoutes: AppPath[] = [
  routes.admin,
  routes.adminBookings,
  routes.customer,
  routes.rewards,
  routes.adminConfiguration,
  routes.adminPromotions,
  routes.adminReports,
  routes.adminArticles,
  routes.adminServices,
]

function Navigate({ to }: { to: AppPath }) {
  const { navigate } = useRouter()
  useEffect(() => {
    navigate(to)
  }, [navigate, to])
  return null
}


type RouterContextValue = {
  path: AppPath
  navigate: (to: AppPath) => void
}

const RouterContext = createContext<RouterContextValue | null>(null)

function getCurrentPath(): AppPath {
  const pathname = window.location.pathname
  return isAppPath(pathname) ? pathname : routes.home
}

export function AppRouter() {
  const [path, setPath] = useState<AppPath>(getCurrentPath)

  useEffect(() => {
    const onPopState = () => setPath(getCurrentPath())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const value = useMemo<RouterContextValue>(
    () => ({
      path,
      navigate: (to) => {
        if (to === path) {
          return
        }

        window.history.pushState(null, '', to)
        setPath(to)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }),
    [path]
  )

  const user = authStore.getUser()
  const isAdmin = user?.role === 'ADMIN'

  // Block client users from accessing admin pages
  const isAuthorized = !adminRoutes.includes(path) || isAdmin

  return (
    <RouterContext.Provider value={value}>
      {!isAuthorized ? (
        <Navigate to={routes.dashboard} />
      ) : path === routes.dashboard ||
      path === routes.profile ||
      path === routes.vehicles ||
      path === routes.booking ||
      path === routes.history ||
      path === routes.loyalty ||
      path === routes.promotions ||
      path === routes.notifications ||
      path === routes.articles ||
      path === routes.adminArticles ||
      path === routes.admin ||
      path === routes.adminBookings ||
      path === routes.customer ||
      path === routes.rewards ||
      path === routes.adminPromotions ||
      path === routes.adminReports ||
      path === routes.adminConfiguration ||
      path === routes.adminServices ? (
        renderRoute(path)
      ) : (
        <MainLayout>{renderRoute(path)}</MainLayout>
      )}
    </RouterContext.Provider>
  )
}

function renderRoute(path: AppPath) {
  const user = authStore.getUser()
  const isAdmin = user?.role === 'ADMIN'

  if (protectedRoutes.includes(path) && !authStore.isAuthenticated()) {
    return <Navigate to={routes.login} />
  }

  // Redirect clients to dashboard, admins to admin dashboard
  if (adminRoutes.includes(path) && !isAdmin) {
    return <Navigate to={routes.dashboard} />
  }

  if ((path === routes.login || path === routes.register) && authStore.isAuthenticated()) {
    return <Navigate to={isAdmin ? routes.admin : routes.dashboard} />
  }

  switch (path) {
    case routes.adminConfiguration:
      return <AdminConfigurationPage />
    case routes.adminServices:
      return <AdminServicesPage />
    case routes.adminPromotions:
      return <AdminPromotionsPage />
    case routes.adminReports:
      return <AdminReportsPage />
    case routes.adminBookings:
      return <AdminBookingsPage />
    case routes.admin:
      return <AdminDashboardPage />
    case routes.customer:
      return <AdminCustomerPage />
    case routes.rewards:
      return <AdminRewardsPage />
    case routes.booking:
      return <BookingPage onBookingSuccess={() => {}} />
    case routes.loyalty:
      return <LoyaltyPage />
    case routes.articles:
      return <ClientArticlesPage />
    case routes.adminArticles:
      return <AdminArticlesPage />
    case routes.promotions:
      return <ClientPromotionsPage />
    case routes.notifications:
      return <ClientNotificationsPage />
    case routes.dashboard:
      return <ClientDashboardPage />
    case routes.history:
      return <ClientHistoryPage />
    case routes.profile:
      return <ClientProfilePage />
    case routes.vehicles:
      return <ClientVehiclesPage />
    case routes.test:
      return <TestRoutesPage />
    case routes.login:
      return <AuthPage mode='login' />
    case routes.register:
      return <AuthPage mode='register' />
    case routes.otp:
      return <OtpPage />
    case routes.contact:
      return <ContactPage />
    case routes.home:
    default:
      return <HomePage />
  }
}

export function useRouter() {
  const context = useContext(RouterContext)

  if (!context) {
    throw new Error('useRouter must be used inside AppRouter')
  }

  return context
}

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  children: ReactNode
  className?: string
  to: AppPath
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { children, className, onClick, to, ...props },
  ref
) {
  const { navigate } = useRouter()

  return (
    <a
      className={className}
      href={to}
      ref={ref}
      {...props}
      onClick={(event) => {
        onClick?.(event as MouseEvent<HTMLAnchorElement>)
        if (event.defaultPrevented) {
          return
        }

        event.preventDefault()
        navigate(to)
      }}
    >
      {children}
    </a>
  )
})

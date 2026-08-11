export const routes = {
  home: '/',
  admin: '/admin',
  adminBookings: '/admin/bookings',
  customer: '/admin/customer',
  rewards: '/admin/rewards',
  adminConfiguration: '/admin/configuration',
  adminPromotions: '/admin/promotions',
  adminReports: '/admin/reports',
  adminServices: '/admin/services',
  dashboard: '/dashboard',
  profile: '/profile',
  vehicles: '/vehicles',
  booking: '/booking',
  history: '/history',
  loyalty: '/loyalty',
  promotions: '/promotions',
  notifications: '/notifications',
  articles: '/articles',
  adminArticles: '/admin/articles',
  test: '/test',
  login: '/login',
  register: '/register',
  otp: '/otp',
  contact: '/lien-he',
} as const

export type AppPath = (typeof routes)[keyof typeof routes]

export function isAppPath(pathname: string): pathname is AppPath {
  return Object.values(routes).includes(pathname as AppPath)
}

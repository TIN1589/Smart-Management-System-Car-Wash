import type { ReactNode } from 'react'
import { AppHeader } from '@/shared/components/layout/app-header'
import { UserTour } from '@/shared/components/ui/user-tour'

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      {children}
      <UserTour />
    </div>
  )
}


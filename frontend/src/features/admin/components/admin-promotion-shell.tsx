import type { ReactNode } from 'react'
import { AdminSidebar } from '@/features/admin/components/admin-sidebar'
import { AdminTopbar } from '@/features/admin/components/admin-topbar'

export function AdminPromotionShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <AdminSidebar activeItem="promotion" />
      <AdminTopbar searchPlaceholder="Tìm kiếm chương trình..." />

      <main className="min-h-screen px-6 pb-8 pt-24 lg:pl-[calc(16rem+24px)]">
        {children}
      </main>
    </div>
  )
}

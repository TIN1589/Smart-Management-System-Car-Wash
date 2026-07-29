import { useState, useEffect } from 'react'
import { CalendarDays, RefreshCw } from 'lucide-react'
import { AdminMetricCard } from '@/features/admin/components/admin-metric-card'
import { AdminSidebar } from '@/features/admin/components/admin-sidebar'
import { AdminTopbar } from '@/features/admin/components/admin-topbar'
import { AdminActionCards, QueuePanel, TierDistributionPanel } from '@/features/admin/components/admin-side-panels'
import { RevenueChart } from '@/features/admin/components/revenue-chart'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { cn } from '@/shared/lib/utils'
import { authorizeAxios } from '@/shared/lib/api-client'

// Kế thừa icon và các thuộc tính style tĩnh gốc từ dữ liệu mockup của bạn
import { adminMetrics } from '@/features/admin/data/admin-dashboard'

export function AdminDashboardPage() {
  const [loading, setLoading] = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  
  // State quản lý toàn bộ cục JSON động từ Spring Boot
  const [dashboardStats, setDashboardStats] = useState<any>(null)

  const fetchDashboardStats = async (isManualClick = false) => {
    if (isManualClick) setIsRefreshing(true)
    try {
      const res = await authorizeAxios.get('/admin/dashboard/stats')
      setDashboardStats(res.data)
    } catch (error) {
      console.error('Lỗi khi tải số liệu tổng quan Dashboard:', error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()
    const interval = setInterval(() => fetchDashboardStats(false), 30000)
    return () => clearInterval(interval)
  }, [])

  const getTodayString = () => {
    const today = new Date()
    return today.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-xs font-semibold text-slate-400 animate-pulse">
         Đang tổng hợp số liệu kinh doanh thời gian thực từ hệ thống AutoWash...
      </div>
    )
  }

  // TÍNH TOÁN DỮ LIỆU ĐỘNG CHO 4 THẺ CHỈ SỐ CHÍNH[cite: 1]
  const dynamicMetrics = adminMetrics && adminMetrics.length >= 4 ? [
    {
      ...adminMetrics[0],
      value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(dashboardStats?.todayRevenue || 0),
    },
    {
      ...adminMetrics[1],
      value: `${dashboardStats?.totalWashCount || 0} lượt`,
      change: `${dashboardStats?.motorbikeCount || 0} xe máy, ${dashboardStats?.carCount || 0} ô tô`,
    },
    {
      ...adminMetrics[2],
      label: "Tổng khách hàng", // Đồng bộ CRM[cite: 1]
      value: `${dashboardStats?.newCustomerCount || 0} khách`,
    },
    {
      ...adminMetrics[3],
      label: "Điểm hệ thống phát", // Đồng bộ Loyalty[cite: 1]
      value: `${(dashboardStats?.issuedPoints || 0).toLocaleString()} điểm`,
    },
  ] : []

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <AdminSidebar />
      <AdminTopbar />

      <main className="min-h-screen px-6 pb-8 pt-24 lg:pl-70">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-medium leading-8 text-primary">Tổng quan hệ thống</h2>
              <p className="text-sm leading-5 text-on-surface-variant">
                Theo dõi hoạt động kinh doanh thời gian thực
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Card className="flex h-10 items-center gap-2 px-4 shadow-sm bg-white border border-slate-100">
                <CalendarDays className="text-outline" size={16} />
                <span className="text-sm font-medium leading-4 text-on-surface-variant">
                  {getTodayString()}
                </span>
              </Card>
              
              <Button 
                className="h-10 px-4 cursor-pointer flex items-center gap-2 select-none" 
                type="button" 
                onClick={() => fetchDashboardStats(true)}
                disabled={isRefreshing}
              >
                <RefreshCw className={cn("size-4", isRefreshing && "animate-spin")} />
                {isRefreshing ? "Đang tải..." : "Tải lại dữ liệu"}
              </Button>
            </div>
          </section>

          <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {dynamicMetrics.map((metric) => (
              <AdminMetricCard {...metric} key={metric.label} />
            ))}
          </section>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <RevenueChart data={dashboardStats?.revenue7Days || []} />
              <AdminActionCards />
            </div>
            <div className="space-y-6">
              <QueuePanel items={dashboardStats?.todayQueue || []} />
              <TierDistributionPanel stats={dashboardStats} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
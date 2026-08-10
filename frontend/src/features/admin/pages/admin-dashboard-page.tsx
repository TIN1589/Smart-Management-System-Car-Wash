import { useState, useEffect } from 'react'
import { AlertTriangle, CalendarDays, RefreshCw } from 'lucide-react'
import { AdminMetricCard } from '@/features/admin/components/admin-metric-card'
import { AdminSidebar } from '@/features/admin/components/admin-sidebar'
import { AdminTopbar } from '@/features/admin/components/admin-topbar'
import { AdminActionCards, QueuePanel, TierDistributionPanel } from '@/features/admin/components/admin-side-panels'
import { RevenueChart } from '@/features/admin/components/revenue-chart'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { cn } from '@/shared/lib/utils'
import { authorizeAxios } from '@/shared/lib/api-client'
import { adminMetrics } from '@/features/admin/data/admin-dashboard'

export function AdminDashboardPage() {
  const [loading, setLoading] = useState<boolean>(true)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false)
  
  // State quản lý toàn bộ dữ liệu JSON từ Spring Boot
  const [dashboardStats, setDashboardStats] = useState<any>(null)

  const fetchDashboardStats = async (isManualClick = false) => {
    if (isManualClick) setIsRefreshing(true)
    setError(null)
    try {
      const res = await authorizeAxios.get('/admin/dashboard/stats')
      setDashboardStats(res.data)
    } catch (err: any) {
      console.error('Lỗi khi tải số liệu tổng quan Dashboard:', err)
      setError('Không thể lấy số liệu tổng quan từ máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.')
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

  // TÍNH TOÁN DỮ LIỆU ĐỘNG CHO 4 THẺ CHỈ SỐ CHÍNH
  const dynamicMetrics = adminMetrics && adminMetrics.length >= 4 ? [
    {
      ...adminMetrics[0],
      value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(dashboardStats?.todayRevenue || 0),
    },
    {
      ...adminMetrics[1],
      value: `${dashboardStats?.totalWashCount || 0} lượt`,
      detail: `${dashboardStats?.motorbikeCount || 0} xe máy, ${dashboardStats?.carCount || 0} ô tô`,
    },
    {
      ...adminMetrics[2],
      label: "Tổng khách hàng",
      value: `${dashboardStats?.newCustomerCount || 0} khách`,
    },
    {
      ...adminMetrics[3],
      label: "Điểm hệ thống phát",
      value: `${(dashboardStats?.issuedPoints || 0).toLocaleString()} điểm`,
    },
  ] : []

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <AdminSidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />
      <AdminTopbar onMobileMenuToggle={() => setMobileNavOpen(true)} />

      <main className="min-h-screen px-4 pb-8 pt-20 md:px-6 lg:pl-70 lg:pt-24">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-bold leading-7 text-primary md:text-2xl">Tổng quan hệ thống</h2>
              <p className="text-xs text-on-surface-variant md:text-sm">
                Theo dõi hoạt động kinh doanh thời gian thực
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Card className="flex h-10 items-center gap-2 px-3 shadow-xs bg-white border border-slate-100 md:px-4">
                <CalendarDays className="text-outline" size={16} />
                <span className="text-xs font-semibold leading-4 text-on-surface-variant md:text-sm">
                  {getTodayString()}
                </span>
              </Card>
              
              <Button 
                className="h-10 px-3 cursor-pointer flex items-center gap-2 select-none text-xs md:px-4 md:text-sm font-semibold" 
                type="button" 
                onClick={() => fetchDashboardStats(true)}
                disabled={isRefreshing}
              >
                <RefreshCw className={cn("size-4", isRefreshing && "animate-spin")} />
                {isRefreshing ? "Đang tải..." : "Tải lại số liệu"}
              </Button>
            </div>
          </section>

          {/* BANNER THÔNG BÁO LỖI UI */}
          {error && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs md:text-sm text-red-700 shadow-sm animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <AlertTriangle className="size-5 shrink-0 text-red-500" />
                <div>
                  <p className="font-bold text-red-800">Không thể tải số liệu Dashboard</p>
                  <p className="text-red-600 mt-0.5">{error}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-red-300 bg-white text-red-700 hover:bg-red-100 font-semibold cursor-pointer shrink-0"
                onClick={() => fetchDashboardStats(true)}
              >
                <RefreshCw className="mr-1.5 size-3.5" />
                Thử lại ngay
              </Button>
            </div>
          )}

          {/* SKELETON LOADING STATE UI */}
          {loading ? (
            <DashboardSkeleton />
          ) : (
            <>
              {/* 4 CARD CHỈ SỐ KPI */}
              <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {dynamicMetrics.map((metric) => (
                  <AdminMetricCard {...metric} key={metric.label} />
                ))}
              </section>

              {/* BIỂU ĐỒ DOANH THU & SIDE PANELS */}
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
            </>
          )}
        </div>
      </main>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-slate-200/70" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="h-80 rounded-2xl bg-slate-200/70" />
          <div className="h-36 rounded-2xl bg-slate-200/70" />
        </div>
        <div className="space-y-6">
          <div className="h-72 rounded-2xl bg-slate-200/70" />
          <div className="h-64 rounded-2xl bg-slate-200/70" />
        </div>
      </div>
    </div>
  )
}
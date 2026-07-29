import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Save, RefreshCw, AlertTriangle } from 'lucide-react'
import { AdminSidebar } from '@/features/admin/components/admin-sidebar'
import { AdminTopbar } from '@/features/admin/components/admin-topbar'
import { TierRuleCard } from '@/features/admin/components/tier-rule-card'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { 
  tierRules as defaultTierRules
} from '@/features/admin/data/admin-configuration'
import type {
  TierRule
} from '@/features/admin/data/admin-configuration'
import { authorizeAxios } from '@/shared/lib/api-client'
import { adminService } from '@/features/admin/services/admin-service'

export function AdminConfigurationPage() {
  const [reviewing, setReviewing] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [tierRules, setTierRules] = useState<TierRule[]>([])
  const [pointRate, setPointRate] = useState<string>('10.000')

  useEffect(() => {
    async function loadConfigAndRewards() {
      try {
        const config = await adminService.getSystemConfig()
        if (config.tierRules && config.tierRules.length > 0) {
          setTierRules(config.tierRules)
        } else {
          setTierRules(defaultTierRules)
        }
        setPointRate(config.pointRate || '10.000')
      } catch (err) {
        setTierRules(defaultTierRules)
        setPointRate('10.000')
      }
    }

    loadConfigAndRewards()
  }, [])

  const handleTierReview = async () => {
    setReviewing(true)
    try {
      const { data } = await authorizeAxios.post('/loyalty/tier-review')
      toast.success(data?.message || 'Rà soát hạng hội viên hoàn thành!')
    } catch (error: any) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Lỗi khi yêu cầu rà soát hạng hội viên.')
    } finally {
      setReviewing(false)
    }
  }

  const handleUpdateRule = (index: number, updatedRule: TierRule) => {
    const updated = [...tierRules]
    updated[index] = updatedRule
    setTierRules(updated)
  }

  const handleSaveChanges = async () => {
    setSaving(true)
    try {
      await adminService.saveSystemConfig({
        pointRate,
        tierRules
      })
      toast.success('Đã lưu cấu hình hệ thống thành công!')
    } catch (e) {
      toast.error('Lỗi khi lưu cấu hình!')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <AdminSidebar activeItem="configuration" />
      <AdminTopbar title="Cấu hình hệ thống" showSearch={false} actions={null} />

      <main className="min-h-screen px-6 pb-28 pt-24 lg:pl-[calc(16rem+24px)]">
        <div className="mx-auto grid max-w-7xl grid-cols-12 gap-6">
          <section className="col-span-12 space-y-4 lg:col-span-7">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xl font-medium leading-7 text-on-surface">Quy tắc phân hạng</h2>
              <span className="text-xs leading-4 text-on-surface-variant">Cập nhật lần cuối: Hôm nay</span>
            </div>

            {tierRules.map((rule, idx) => (
              <TierRuleCard 
                key={rule.tier} 
                rule={rule} 
                onChange={(updatedRule) => handleUpdateRule(idx, updatedRule)}
              />
            ))}
          </section>

          <section className="col-span-12 space-y-6 lg:col-span-5">
            {/* System Actions card */}
            <Card className="p-6 shadow-sm border border-slate-100">
              <h3 className="mb-2 text-xl font-medium leading-7 text-on-surface flex items-center gap-2">
                <AlertTriangle className="text-amber-500 w-5 h-5" />
                Hành động hệ thống
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Hệ thống tự động đồng bộ và tính toán lại phân hạng thành viên cho toàn bộ khách hàng dựa trên lịch sử chi tiêu tích lũy. Bạn có thể kích hoạt tiến trình này thủ công ngay lập tức.
              </p>
              <Button 
                onClick={handleTierReview}
                disabled={reviewing}
                className="w-full gap-2 text-xs h-10 bg-slate-105 hover:bg-slate-200 border text-slate-750 font-bold select-none cursor-pointer"
              >
                <RefreshCw size={14} className={reviewing ? "animate-spin" : ""} />
                {reviewing ? "Đang rà soát..." : "Chạy rà soát hạng hội viên"}
              </Button>
            </Card>
          </section>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-end border-t border-border bg-surface/80 px-6 py-4 backdrop-blur-md lg:left-64">
          <div className="flex items-center gap-4">
            <Button className="px-6 text-on-surface-variant" type="button" variant="ghost" disabled={saving}>
              Hủy
            </Button>
            <Button className="gap-2 px-6 cursor-pointer" type="button" onClick={handleSaveChanges} disabled={saving}>
              <Save size={18} />
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

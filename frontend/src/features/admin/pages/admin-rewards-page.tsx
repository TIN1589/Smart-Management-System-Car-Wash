import { useState } from 'react'
import { AdminSidebar } from '@/features/admin/components/admin-sidebar'
import { AdminTopbar } from '@/features/admin/components/admin-topbar'
import { Search, Loader2 } from 'lucide-react'
import { loyaltyService } from '@/features/client/services/loyalty-service'
import { adminService } from '@/features/admin/services/admin-service'

export function AdminRewardsPage() {
  const [phoneSearch, setPhoneSearch] = useState('')
  const [searching, setSearching] = useState(false)
  const [customer, setCustomer] = useState<any | null>(null)
  const [currentPoints, setCurrentPoints] = useState<number>(0)
  const [selectedReward, setSelectedReward] = useState<any | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const rewardsData = [
    { id: 1, title: 'Giảm 10.000đ', cost: 50, icon: '🎫', type: 'DISCOUNT' },
    { id: 2, title: 'Rửa Basic miễn phí', cost: 200, icon: '🚗', type: 'FREE_WASH' },
    { id: 3, title: 'Rửa Premium miễn phí', cost: 400, icon: '⭐', badge: 'HẠNG GOLD+', type: 'FREE_WASH' },
    { id: 4, title: 'Dịch vụ xịt bóng', cost: 100, icon: '✨', type: 'ADDON_SHINE' },
    { id: 5, title: 'Làm thơm nội thất', cost: 100, icon: '💨', type: 'ADDON_FRAGRANCE' },
    { id: 6, title: 'Phủ Ceramic', cost: 2000, icon: '🛡️', locked: true, type: 'CERAMIC' },
  ]

  const handleSearchCustomer = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!phoneSearch.trim()) return

    setSearching(true)
    setCustomer(null)
    setCurrentPoints(0)
    try {
      const data = await adminService.checkCustomerByPhone(phoneSearch.trim())
      if (data && data.exists) {
        const custId = data.id || data.customerId
        if (custId) {
          setCustomer({
            id: custId,
            fullName: data.fullName,
            phone: phoneSearch.trim(),
            tier: data.tier || 'MEMBER'
          })
          
          // Get current points
          const balanceRes = await loyaltyService.getLoyaltyBalance(custId)
          setCurrentPoints(balanceRes.balance !== undefined ? balanceRes.balance : (balanceRes.currentPoints ?? 0))
        } else {
          alert('Không tìm thấy mã định danh khách hàng.')
        }
      } else {
        alert('Không tìm thấy khách hàng nào với số điện thoại này.')
      }
    } catch (error: any) {
      console.error(error)
      alert(error.response?.data?.message || 'Không thể kiểm tra khách hàng từ máy chủ.')
    } finally {
      setSearching(false)
    }
  }

  const handleExchange = (reward: any) => {
    if (!customer) {
      alert('Vui lòng tìm kiếm khách hàng trước khi đổi quà!')
      return
    }
    if (reward.cost > currentPoints || reward.locked) return
    setSelectedReward(reward)
  }

  const confirmExchange = async () => {
    if (!selectedReward || !customer) return
    
    setSubmitting(true)
    try {
      // Reference ID can be a random UUID
      const referenceId = crypto.randomUUID()
      await loyaltyService.redeemPoints({
        customerId: customer.id,
        points: selectedReward.cost,
        referenceId: referenceId
      })
      
      setCurrentPoints(prev => prev - selectedReward.cost)
      alert(`🎉 Đổi thành công ${selectedReward.title} cho khách hàng ${customer.fullName}!`)
      setSelectedReward(null)
    } catch (error: any) {
      console.error(error)
      alert(error.response?.data?.message || 'Lỗi khi đổi điểm trên hệ thống.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <AdminSidebar activeItem="promotion" />
      <AdminTopbar />

      <main className="min-h-screen px-6 pb-8 pt-24 lg:pl-[calc(16rem+24px)]">
        <div className="mx-auto max-w-7xl space-y-6">
          
          {/* Tìm kiếm khách hàng */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h2 className="text-base font-bold text-slate-800 uppercase tracking-tight">Tra cứu hội viên đổi quà</h2>
            <form onSubmit={handleSearchCustomer} className="flex gap-3 max-w-md">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="Nhập số điện thoại khách hàng..." 
                  value={phoneSearch}
                  onChange={(e) => setPhoneSearch(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <button 
                type="submit" 
                disabled={searching}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shrink-0 cursor-pointer disabled:opacity-50"
              >
                {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                Tìm kiếm
              </button>
            </form>

            {customer && (
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200 animate-in fade-in duration-200">
                <div>
                  <p className="text-sm font-bold text-slate-800">{customer.fullName} <span className="text-xs font-semibold text-slate-400">({customer.phone})</span></p>
                  <p className="text-xs text-slate-550 mt-0.5">Hạng thẻ: <span className="text-indigo-650 font-bold">{customer.tier}</span></p>
                </div>
                <div className="bg-indigo-900 text-white px-4 py-2 rounded-full text-sm font-bold">
                  ⭐ Điểm tích lũy: {currentPoints.toLocaleString()} điểm
                </div>
              </div>
            )}
          </div>

          {/* Grid danh sách quà tặng */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rewardsData.map((reward) => {
              const isAffordable = customer && currentPoints >= reward.cost && !reward.locked
              
              return (
                <div
                  key={reward.id}
                  onClick={() => isAffordable && handleExchange(reward)}
                  className={`flex items-center justify-between p-5 bg-white rounded-2xl border transition-all duration-200 ${
                    isAffordable 
                      ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer border-slate-100' 
                      : 'opacity-60 cursor-not-allowed bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl p-3 bg-slate-100 rounded-xl">{reward.icon}</div>
                    <div>
                      <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        {reward.title}
                        {reward.badge && <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-md font-bold">{reward.badge}</span>}
                      </h3>
                      <p className="text-sm text-indigo-600 font-semibold">{reward.cost} điểm</p>
                    </div>
                  </div>
                  {!isAffordable && <span className="text-slate-400">🔒</span>}
                </div>
              )
            })}
          </div>

          {/* Pop-up Modal xác nhận đổi quà */}
          {selectedReward && customer && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-xl">
                <h3 className="text-lg font-bold text-slate-900">Xác nhận đổi quà</h3>
                <p className="text-sm text-slate-650">
                  Xác nhận dùng <strong className="text-indigo-600">{selectedReward.cost} điểm</strong> để đổi gói <strong className="text-slate-900">{selectedReward.title}</strong> cho khách hàng <strong className="text-slate-900">{customer.fullName}</strong>?
                </p>
                <div className="flex gap-2 justify-end pt-2">
                  <button onClick={() => setSelectedReward(null)} disabled={submitting} className="px-4 py-2 border rounded-xl text-sm font-medium hover:bg-slate-50">Hủy</button>
                  <button onClick={confirmExchange} disabled={submitting} className="px-4 py-2 bg-indigo-900 text-white rounded-xl text-sm font-medium hover:bg-indigo-800 disabled:opacity-50">
                    {submitting ? 'Đang đổi...' : 'Đồng ý đổi'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      </div>
  )
}
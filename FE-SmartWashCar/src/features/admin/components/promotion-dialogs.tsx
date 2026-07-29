import { useState } from 'react'
import { Send, X, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'

type ConfirmSendModalProps = {
  onClose: () => void
  promotion: any | null // Đồng bộ kiểu any linh hoạt giống trang quản lý ngoài
}

export function ConfirmSendModal({ onClose, promotion }: ConfirmSendModalProps) {
  const [sending, setSending] = useState(false)

  if (!promotion) {
    return null
  }

  // 🌟 HÀM KẾT NỐI API BẮN THÔNG BÁO KHUYẾN MÃI DOWN BACKEND SPRING BOOT
  const handleSendPromotion = async () => {
    setSending(true)
    try {
      // Lấy chính xác accessToken đồng bộ với cơ chế xác thực hệ thống của Khang
      const token = localStorage.getItem('jwt_token')

      const res = await fetch(`http://localhost:8080/api/admin/promotions/${promotion.id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      })

      if (res.ok) {
        alert(`Đã kích hoạt gửi chiến dịch "${promotion.name}" thành công tới hệ thống! ✈️`)
        onClose()
      } else {
        const errText = await res.text()
        alert(`Lỗi khi yêu cầu gửi ưu đãi: ${errText}`)
      }
    } catch (error) {
      console.error('Lỗi kết nối API gửi khuyến mãi:', error)
      alert('Không thể kết nối đến máy chủ Backend.')
    } finally {
      setSending(false)
    }
  }

  // Chuẩn hóa hiển thị targetTiers kể cả khi là mảng hay chuỗi từ Postgres đổ lên
  const displayTiers = Array.isArray(promotion.targetTiers)
    ? promotion.targetTiers.join(', ')
    : String(promotion.targetTiers || 'MEMBER')

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-6 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-surface p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-4">
          <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
            <Send size={28} className={sending ? "animate-bounce" : ""} />
          </span>
          <div>
            <h3 className="text-xl font-medium leading-7 text-on-surface">Xác nhận gửi ưu đãi</h3>
            <p className="text-sm leading-5 text-on-surface-variant">Hệ thống sẽ gửi thông báo đến các khách hàng mục tiêu.</p>
          </div>
        </div>

        <div className="mb-6 rounded-lg bg-surface-container-low p-4">
          <div className="mb-2 flex justify-between gap-4">
            <span className="text-xs leading-4 text-on-surface-variant">Chương trình:</span>
            <span className="text-right text-xs font-medium leading-4 text-on-surface">{promotion.name}</span>
          </div>
          <div className="mb-2 flex justify-between gap-4">
            <span className="text-xs leading-4 text-on-surface-variant">Đối tượng (Tier):</span>
            <span className="text-right text-xs font-medium leading-4 text-primary">
              {displayTiers}
            </span>
          </div>
        </div>

        <div className="flex gap-4">
          <Button className="flex-1" type="button" variant="outline" onClick={onClose} disabled={sending}>
            Hủy
          </Button>
          <Button className="flex-1" type="button" onClick={handleSendPromotion} disabled={sending}>
            {sending ? "Đang gửi..." : "Gửi ngay tới khách hàng"}
          </Button>
        </div>
      </div>
    </div>
  )
}

type CreatePromotionDrawerProps = {
  onClose: () => void
  open: boolean
  onSuccess?: () => void
}

export function CreatePromotionDrawer({ onClose, open, onSuccess }: CreatePromotionDrawerProps) {
  const [submitting, setSubmitting] = useState(false)

  // 1. Quản lý State tập trung cho Form
  const [formData, setFormData] = useState({
    name: '',
    promoType: 'DISCOUNT',
    value: '',
    maxDiscount: '',
    usageLimit: '',
    targetTiers: [] as string[],
    startsAt: '',
    endsAt: ''
  })

  // Hàm xử lý khi nhấn chọn Checkbox phân khúc khách hàng
  const handleTierChange = (tier: string) => {
    setFormData(prev => ({
      ...prev,
      targetTiers: prev.targetTiers.includes(tier)
        ? prev.targetTiers.filter(t => t !== tier)
        : [...prev.targetTiers, tier]
    }))
  }

  // 2. Hàm gửi dữ liệu liên thông xuống API Spring Boot
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const hasName = formData.name && formData.name.trim() !== ''
    const hasValue = formData.value && String(formData.value).trim() !== ''
    const hasLimit = formData.usageLimit && String(formData.usageLimit).trim() !== '' 

    if (!hasName || !hasValue || !hasLimit) {
      alert('Vui lòng nhập đầy đủ các thông tin bắt buộc (*)!')
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem('jwt_token')

      // Đóng gói request chuẩn định dạng Java nhận diện yyyy-MM-dd'T'HH:mm
      const requestBody = {
        name: formData.name,
        promoType: formData.promoType,
        value: Number(formData.value),
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
        usageLimit: Number(formData.usageLimit),
        targetTiers: formData.targetTiers.length > 0 ? formData.targetTiers.join(',') : 'MEMBER',
        startsAt: formData.startsAt ? `${formData.startsAt}T00:00` : null,
        endsAt: formData.endsAt ? `${formData.endsAt}T23:59` : null
      }

      const res = await fetch('http://localhost:8080/api/admin/promotions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(requestBody)
      })

      if (res.ok) {
        alert('Tạo chiến dịch khuyến mãi thành công! 🎉')
        
        // Reset form sạch sẽ về trạng thái rỗng ban đầu
        setFormData({
          name: '',
          promoType: 'DISCOUNT',
          value: '',
          maxDiscount: '',
          usageLimit: '',
          targetTiers: [],
          startsAt: '',
          endsAt: ''
        })

        onClose() // Đóng khay điền form
        if (onSuccess) onSuccess() // Ép bảng ngoài màn hình tự động tải lại data động mới tinh!
      } else {
        const errText = await res.text()
        alert(`Lỗi hệ thống: ${errText}`)
      }
    } catch (error) {
      console.error(error)
      alert('Không thể kết nối đến server Backend.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]"
            onClick={onClose}
          />

          {/* Sliding Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[450px] flex-col border-l border-outline-variant bg-surface shadow-2xl"
          >
            <form onSubmit={handleSubmit} className="flex flex-col h-full m-0">
              
              <div className="flex items-center justify-between border-b border-outline-variant bg-surface px-6 py-6">
                <div>
                  <h3 className="text-xl font-medium leading-7 text-on-surface">Tạo Promotion Mới</h3>
                  <p className="text-sm leading-5 text-on-surface-variant">Nhập thông tin chi tiết chương trình</p>
                </div>
                <Button aria-label="Đóng" size="icon" type="button" variant="ghost" onClick={onClose} disabled={submitting}>
                  <X size={20} />
                </Button>
              </div>

              <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto p-6">
                {/* Ô NHẬP TÊN */}
                <label className="grid gap-3 text-sm font-medium leading-4 text-on-surface">
                  Tên chương trình *
                  <Input 
                    placeholder="VD: Giảm giá ngày cuối tuần" 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  />
                </label>



                {/* Ô GIÁ TRỊ VÀ GIỚI HẠN */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-3 text-sm font-medium leading-4 text-on-surface">
                    Giá trị *
                    <div className="relative">
                      <Input 
                        placeholder="20" 
                        type="number" 
                        className="pr-8" 
                        value={formData.value}
                        onChange={e => setFormData(p => ({ ...p, value: e.target.value }))}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-on-surface-variant">đ / %</span>
                    </div>
                  </label>
                  <label className="grid gap-3 text-sm font-medium leading-4 text-on-surface">
                    Giới hạn lượt *
                    <Input 
                      placeholder="100" 
                      type="number" 
                      value={formData.usageLimit}
                      onChange={e => setFormData(p => ({ ...p, usageLimit: e.target.value }))}
                    />
                  </label>
                </div>

                {formData.value && Number(formData.value) <= 100 && (
                  <label className="grid gap-3 text-sm font-medium leading-4 text-on-surface">
                    Giảm tối đa (để trống nếu không giới hạn)
                    <div className="relative">
                      <Input 
                        placeholder="50000" 
                        type="number" 
                        value={formData.maxDiscount}
                        onChange={e => setFormData(p => ({ ...p, maxDiscount: e.target.value }))}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-on-surface-variant">đ</span>
                    </div>
                  </label>
                )}

                {/* Ô CHỌN ĐỐI TƯỢNG HẠNG THÀNH VIÊN */}
                <div className="grid gap-3">
                  <span className="text-sm font-medium leading-4 text-on-surface">Target Tiers (Đối tượng)</span>
                  <div className="grid grid-cols-2 gap-3">
                    {['MEMBER', 'SILVER', 'GOLD', 'PLATINUM'].map((tier) => (
                      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-outline-variant p-3 hover:bg-surface-container" key={tier}>
                        <input 
                          className="size-4 accent-primary" 
                          type="checkbox" 
                          checked={formData.targetTiers.includes(tier)}
                          onChange={() => handleTierChange(tier)}
                        />
                        <span className="text-xs font-medium leading-4">{tier}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Ô NHẬP NGÀY THÁNG */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-3 text-sm font-medium leading-4 text-on-surface">
                    Ngày bắt đầu
                    <Input 
                      type="date" 
                      value={formData.startsAt}
                      onChange={e => setFormData(p => ({ ...p, startsAt: e.target.value }))}
                    />
                  </label>
                  <label className="grid gap-3 text-sm font-medium leading-4 text-on-surface">
                    Ngày kết thúc
                    <Input 
                      type="date" 
                      value={formData.endsAt}
                      onChange={e => setFormData(p => ({ ...p, endsAt: e.target.value }))}
                    />
                  </label>
                </div>

                <div className="flex gap-3 rounded-lg border border-info/10 bg-info/5 p-4 text-xs leading-5 text-on-surface-variant">
                  <Info className="size-4 shrink-0 text-info mt-0.5" />
                  <span>Chương trình sau khi lưu có thể được gửi notification trực tiếp tới khách hàng thuộc tier đã chọn.</span>
                </div>
              </div>

              {/* NÚT THAO TÁC SUBMIT */}
              <div className="flex gap-4 border-t border-outline-variant p-6 bg-surface">
                <Button className="flex-1" type="button" variant="outline" onClick={onClose} disabled={submitting}>
                  Hủy bỏ
                </Button>
                <Button className="flex-1" type="submit" disabled={submitting}>
                  {submitting ? "Đang lưu..." : "Lưu chương trình"}
                </Button>
              </div>

            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
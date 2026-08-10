import { useState, useEffect } from 'react'
import { Check, Send, SendHorizontal, Calendar, ArrowRight } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

const typeClasses: Record<string, string> = {
  DISCOUNT: 'bg-secondary-container text-on-surface-variant',
  BONUS_POINTS: 'bg-[#ffdcc4] text-tertiary',
  FREE_WASH: 'bg-success text-white',
}

const tierClasses: Record<string, string> = {
  MEMBER: 'bg-tier-member',
  SILVER: 'bg-tier-silver',
  GOLD: 'bg-tier-gold',
  PLATINUM: 'bg-tier-platinum',
  ALL: 'bg-blue-50 text-blue-700'
}

type PromotionTableProps = {
  onSendPromotion: (promotion: any) => void
  promotions: any[] 
  onToggleStatus?: (id: string) => void
}

// 🌟 INTERNAL COMPONENT: Nhận trực tiếp trường boolean phẳng để lật màu siêu mượt
function ToggleSwitch({ isActiveInitial, promotionId, onToggleStatus }: { isActiveInitial: boolean, promotionId: string, onToggleStatus: any }) {
  const [localActive, setLocalActive] = useState(isActiveInitial);

  // Ép đồng bộ lập tức mỗi khi dữ liệu cha (fetchPromotions) chạy lại ngầm hoặc đổi Tab lọc
  useEffect(() => {
    setLocalActive(isActiveInitial);
  }, [isActiveInitial]);

  const handleBlurToggle = () => {
    setLocalActive(!localActive); // Lật giao diện mượt mà lập tức
    if (onToggleStatus) {
      onToggleStatus(promotionId); // Bắn API PATCH cập nhật Postgres ngầm
    }
  };

  return (
    <button
      className={cn(
        'inline-flex h-5 w-10 items-center rounded-full p-0.5 transition-colors duration-200 focus:outline-none',
        localActive ? 'bg-primary' : 'bg-slate-300',
      )}
      type="button"
      onClick={handleBlurToggle}
    >
      <span
        className={cn(
          'grid size-4 place-items-center rounded-full bg-white shadow-sm transition-transform duration-200',
          localActive && 'translate-x-5',
        )}
      >
        {localActive && <Check className="text-primary" size={12} />}
      </span>
    </button>
  );
}

export function PromotionTable({ onSendPromotion, promotions, onToggleStatus }: PromotionTableProps) {
  
  const formatValue = (promo: any) => {
    if (promo.type === 'FREE_WASH') return 'Rửa xe Miễn phí'
    const numValue = Number(promo.value) || 0
    if (numValue < 100) {
      const maxText = promo.maxDiscount 
        ? ` (Tối đa ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(promo.maxDiscount)})`
        : ''
      return `${numValue}%${maxText}`
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(numValue)
  }

  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] border-collapse">
          <thead className="border-b border-outline-variant bg-surface-container-low">
            <tr>
              {['Tên chương trình', 'Loại', 'Target Tiers', 'Giá trị', 'Thời hạn', 'Usage', 'Status', 'Hành động'].map(
                (header) => (
                  <th
                    className={cn(
                      'px-4 py-4 text-left text-sm font-medium leading-4 text-on-surface-variant',
                      (header === 'Status' || header === 'Hành động') && 'text-center',
                    )}
                    key={header}
                  >
                    {header}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {promotions.length === 0 ? (
              <tr>
                <td colSpan={8} className="h-32 text-center text-sm text-on-surface-variant">
                  Không tìm thấy chương trình khuyến mãi nào phù hợp.
                </td>
              </tr>
            ) : (
              promotions.map((promotion) => {
                const current = promotion.usage?.current ?? 0
                const limit = promotion.usage?.limit ?? promotion.usage?.total ?? 100
                const percent = Math.min(Math.round((current / limit) * 100), 100)
                
                const promoId = promotion.id || promotion.code

                return (
                  <tr className={cn('transition-colors hover:bg-surface-container-low', promotion.muted && 'opacity-70')} key={promoId}>
                    {/* 1. Tên chương trình */}
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium leading-4 text-on-surface">{promotion.name}</p>
                      <p className="mt-1 text-[11px] leading-4 text-on-surface-variant">ID: {String(promoId).substring(0, 8)}...</p>
                    </td>

                    {/* 2. Loại ưu đãi */}
                    <td className="px-4 py-4">
                      <span className={cn('rounded px-2 py-1 text-[11px] font-medium leading-4', typeClasses[promotion.type] || 'bg-slate-100')}>
                        {promotion.type}
                      </span>
                    </td>

                    {/* 3. Phân khúc Target Tiers */}
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {promotion.targetTiers && Array.isArray(promotion.targetTiers) ? (
                          promotion.targetTiers.map((tier: string) => (
                            <span className={cn('rounded-lg px-3 py-1 text-xs font-medium leading-4 text-on-surface', tierClasses[tier] || 'bg-slate-100')} key={tier}>
                              {tier}
                            </span>
                          ))
                        ) : (
                          <span className="bg-slate-100 rounded-lg px-3 py-1 text-xs">ALL</span>
                        )}
                      </div>
                    </td>

                    {/* 4. Giá trị tiền tệ */}
                    <td className="px-4 py-4 text-sm font-medium leading-4 text-on-surface">
                      {formatValue(promotion)}
                    </td>

                    {/* 5. Cấu trúc thời hạn đẹp mắt */}
                    <td className="px-4 py-4 text-xs text-on-surface-variant">
                      <div className="flex items-center gap-1">
                        <Calendar size={13} className="text-slate-400" />
                        <span>{promotion.startsAt ? new Date(promotion.startsAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
                        <ArrowRight size={10} className="text-slate-400 mx-0.5" />
                        <span>{promotion.endsAt ? new Date(promotion.endsAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
                      </div>
                    </td>

                    {/* 6. Thanh tiến trình sử dụng */}
                    <td className="min-w-36 px-4 py-4">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs font-medium leading-4 text-on-surface">
                          {current}/{limit}
                        </span>
                        <span className="text-[11px] leading-4 text-on-surface-variant">{percent}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-surface-container">
                        <div
                          className={cn('h-full rounded-full', promotion.isActive ? 'bg-primary' : 'bg-slate-300')}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </td>

                    {/* 7. NÚT SWITCH GẠT ĐẢO TRẠNG THÁI LIÊN THÔNG POSTGRES */}
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <ToggleSwitch 
                          isActiveInitial={promotion.isActive} // 🌟 Gọi chuẩn trường boolean phẳng đã vá
                          promotionId={promoId}
                          onToggleStatus={onToggleStatus}
                        />
                      </div>
                    </td>

                    {/* 8. Nút hành động gửi mail */}
                    <td className="px-4 py-4 text-center">
                      <button
                        className={cn(
                          'inline-flex size-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary/10',
                          promotion.actionDisabled && 'cursor-not-allowed text-outline hover:bg-transparent',
                        )}
                        disabled={promotion.actionDisabled}
                        title="Gửi ngay"
                        type="button"
                        onClick={() => onSendPromotion(promotion)}
                      >
                        {promotion.actionDisabled ? <SendHorizontal size={20} /> : <Send size={20} />}
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
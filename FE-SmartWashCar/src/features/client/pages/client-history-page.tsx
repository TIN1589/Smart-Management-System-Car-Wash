import { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Bike, ChevronRight, CalendarX, Car, Clock, X, Receipt, Tag, Percent, Gift } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import toast from 'react-hot-toast'
import type { AppDispatch, RootState } from '@/app/store'
import { fetchBookings } from '@/features/client/store/client-slice'
import { bookingService } from '@/features/booking/services/booking-service'
import { ClientSidebar } from '@/features/client/components/client-sidebar'
import { ClientTopbar } from '@/features/client/components/client-topbar'
import { formatCurrency, cn } from '@/shared/lib/utils'

export function ClientHistoryPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { items: bookings, isLoading } = useSelector((state: RootState) => state.client.bookings)

  const [activeTab, setActiveTab] = useState('Tất cả')
  const [mounted, setMounted] = useState(false)
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<any | null>(null)

  useEffect(() => {
    setMounted(true)
    dispatch(fetchBookings())
  }, [dispatch])

  const tabs = ['Tất cả', 'Sắp tới', 'Hoàn thành', 'Đã hủy']

  // Filter bookings based on activeTab
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      if (activeTab === 'Tất cả') return true
      if (activeTab === 'Sắp tới') {
        return (
          booking.status === 'PENDING' ||
          booking.status === 'CONFIRMED' ||
          booking.status === 'IN_PROGRESS'
        )
      }
      if (activeTab === 'Hoàn thành') return booking.status === 'DONE'
      if (activeTab === 'Đã hủy') return booking.status === 'CANCELLED'
      return true
    })
  }, [bookings, activeTab])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date)
    } catch {
      return dateString
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy lịch hẹn này không?')) return
    try {
      await bookingService.cancelBooking(bookingId)
      toast.success('Hủy đặt lịch thành công')
      dispatch(fetchBookings())
    } catch {
      toast.error('Không thể hủy đặt lịch. Vui lòng thử lại.')
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <ClientSidebar />
      <ClientTopbar title="Lịch sử đặt lịch" />

      <main className="min-h-screen px-6 pb-8 pt-24 lg:pl-[calc(16rem+24px)]">
        <div className="mx-auto max-w-[1280px]">
          {/* Tab Filter Row */}
          <div className="mb-8 flex w-fit items-center gap-2 rounded-xl border border-outline-variant bg-surface-container-low p-1.5">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'rounded-lg px-6 py-2 text-sm font-medium transition-all',
                  activeTab === tab
                    ? 'bg-surface text-primary shadow-sm'
                    : 'text-secondary hover:text-primary'
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Booking List */}
          {isLoading ? (
            <div className="py-24 text-center text-on-surface-variant">
              Đang tải lịch sử đặt lịch...
            </div>
          ) : filteredBookings.length > 0 ? (
            <div className="space-y-4">
              {filteredBookings.map((booking, index) => {
                const isBike = (booking as any).vehicleType === 'BIKE'
                const VehicleIcon = isBike ? Bike : Car
                const showCancelButton = booking.status === 'PENDING' || booking.status === 'CONFIRMED'

                return (
                  <div
                    key={booking.id}
                    onClick={() => setSelectedBookingDetail(booking)}
                    className={cn(
                      'flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl border border-outline-variant bg-surface p-6 transition-all hover:shadow-md gap-4 cursor-pointer hover:border-primary/50',
                      mounted ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                    )}
                    style={{ transitionDelay: `${index * 50}ms`, transitionDuration: '400ms' }}
                  >
                    <div className="flex items-center gap-6">
                      <div className={cn(
                        'flex size-14 items-center justify-center rounded-xl shrink-0',
                        booking.status === 'CANCELLED'
                          ? 'bg-error-container text-danger'
                          : booking.status === 'DONE'
                            ? 'bg-surface-container-high text-secondary'
                            : 'bg-primary-fixed text-primary'
                      )}>
                        <VehicleIcon size={32} />
                      </div>
                      <div>
                        <div className="mb-1 flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-semibold text-on-surface">
                            {booking.vehicleDetails?.licensePlate || booking.licensePlate || 'Chưa rõ xe'}
                          </h3>
                          <span className={cn(
                            'rounded-full px-3 py-1 text-xs font-bold uppercase',
                            booking.status === 'CONFIRMED'
                              ? 'bg-success/10 text-success'
                              : booking.status === 'PENDING'
                                ? 'bg-warning/10 text-warning'
                                : booking.status === 'IN_PROGRESS'
                                  ? 'bg-info/10 text-info'
                                  : booking.status === 'DONE'
                                    ? 'bg-gray-200 text-gray-600'
                                    : 'bg-danger/10 text-danger'
                          )}>
                            {booking.status}
                          </span>
                        </div>
                        {/* Dynamic services list or legacy serviceType fallback */}
                        <p className="mb-1 text-sm font-medium text-on-surface-variant line-clamp-1">
                          {((booking as any).selectedServices && (booking as any).selectedServices.length > 0
                            ? (booking as any).selectedServices.map((s: any) => s.name || s.serviceName).join(', ')
                            : (booking.serviceType || 'Chưa chọn'))}
                        </p>
                        <div className="flex items-center gap-2 text-secondary">
                          <Clock size={18} />
                          <span className="text-sm">{formatDate(booking.scheduledAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-4 border-t border-outline-variant pt-4 sm:border-t-0 sm:pt-0">
                      {showCancelButton && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCancelBooking(booking.id)
                          }}
                          className="rounded-lg border border-danger px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/5"
                        >
                          Hủy lịch
                        </button>
                      )}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedBookingDetail(booking)
                        }}
                        className="flex size-10 items-center justify-center rounded-full text-secondary transition-colors hover:bg-surface-container-low shrink-0"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="mt-8 flex flex-col items-center justify-center py-24">
              <div className="mb-6 flex size-64 items-center justify-center rounded-full border border-outline-variant bg-surface-container-low">
                <CalendarX className="size-20 text-outline-variant" strokeWidth={1} />
              </div>
              <h4 className="mb-2 text-xl font-semibold text-on-surface">Chưa có lịch hẹn</h4>
              <p className="max-w-xs text-center text-base text-secondary">
                Không tìm thấy lịch hẹn nào tương ứng trong hệ thống của bạn.
              </p>
            </div>
          )}

          {/* Illustration for VIP tier privileges */}
          <div className="relative mt-12 overflow-hidden rounded-xl bg-gradient-to-br from-primary to-info p-8">
            <div className="relative z-10 max-w-md">
              <h3 className="mb-2 text-xl font-semibold text-white">Đặc quyền hội viên vàng</h3>
              <p className="mb-6 text-base text-white/90">
                Khách hàng hạng vàng được ưu tiên sắp xếp dịch vụ, rút ngắn thời gian chờ đợi và giảm chi phí trực tiếp trên hóa đơn.
              </p>
              <button className="rounded-lg bg-white px-6 py-2 text-sm font-medium text-primary transition-all hover:bg-opacity-90">
                Khám phá đặc quyền
              </button>
            </div>
            <div className="absolute -bottom-5 -right-10 rotate-[-12deg] opacity-20">
              <Car className="size-[240px] text-white" />
            </div>
          </div>
          {/* Details Modal */}
          <AnimatePresence>
            {selectedBookingDetail && (
              <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200/80 shadow-2xl space-y-5 text-left text-slate-800"
                >
                  {/* Modal Header */}
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-primary" />
                      <h4 className="text-sm font-bold uppercase tracking-tight text-slate-900">
                        Chi tiết lịch đặt
                      </h4>
                    </div>
                    <button
                      onClick={() => setSelectedBookingDetail(null)}
                      className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-50 rounded-lg cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Booking Summary Card */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-250/50 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Trạng thái</span>
                      <span className={cn(
                        'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                        selectedBookingDetail.status === 'CONFIRMED'
                          ? 'bg-success/10 text-success'
                          : selectedBookingDetail.status === 'PENDING'
                            ? 'bg-warning/10 text-warning'
                            : selectedBookingDetail.status === 'IN_PROGRESS'
                              ? 'bg-info/10 text-info'
                              : selectedBookingDetail.status === 'DONE'
                                ? 'bg-gray-200 text-gray-600'
                                : 'bg-danger/10 text-danger'
                      )}>
                        {selectedBookingDetail.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-2 text-xs font-semibold">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Phương tiện</p>
                        <p className="text-slate-900 font-bold">
                          {selectedBookingDetail.vehicleDetails?.licensePlate || selectedBookingDetail.licensePlate || 'Chưa rõ xe'}
                        </p>
                        {selectedBookingDetail.vehicleDetails?.brand && (
                          <p className="text-[10px] text-slate-400 mt-0.5">{selectedBookingDetail.vehicleDetails.brand} {selectedBookingDetail.vehicleDetails.color}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Thời gian thực hiện</p>
                        <p className="text-slate-900 font-bold">{formatDate(selectedBookingDetail.scheduledAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Services List */}
                  <div className="space-y-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Dịch vụ đã chọn</p>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {selectedBookingDetail.selectedServices && selectedBookingDetail.selectedServices.length > 0 ? (
                        selectedBookingDetail.selectedServices.map((service: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-xs p-2 bg-slate-50/50 border border-slate-100 rounded-lg">
                            <span className="font-semibold text-slate-800">{service.name || service.serviceName}</span>
                            <span className="font-bold text-slate-900">{formatCurrency(service.unitPrice || service.price || selectedBookingDetail.basePrice)}</span>
                          </div>
                        ))
                      ) : (
                        <div className="flex justify-between items-center text-xs p-2 bg-slate-50/50 border border-slate-100 rounded-lg">
                          <span className="font-semibold text-slate-800">{selectedBookingDetail.serviceType || 'Rửa xe thường'}</span>
                          <span className="font-bold text-slate-900">{formatCurrency(selectedBookingDetail.basePrice)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes / Special Instructions */}
                  {selectedBookingDetail.notes && (
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ghi chú</p>
                      <p className="text-xs italic bg-amber-50/50 border border-amber-100/50 text-amber-900 p-2.5 rounded-lg font-semibold leading-relaxed">
                        "{selectedBookingDetail.notes}"
                      </p>
                    </div>
                  )}

                  {/* Cost Details Breakdown */}
                  <div className="border-t border-slate-100 pt-4 space-y-2 text-xs font-semibold">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5">Chi tiết thanh toán</p>
                    
                    {/* Sum of services cost */}
                    <div className="flex justify-between text-slate-500">
                      <span>Tạm tính:</span>
                      <span>
                        {formatCurrency(
                          selectedBookingDetail.selectedServices && selectedBookingDetail.selectedServices.length > 0
                            ? selectedBookingDetail.selectedServices.reduce((acc: number, s: any) => acc + (s.unitPrice || s.price || 0), 0)
                            : selectedBookingDetail.basePrice
                        )}
                      </span>
                    </div>

                    {/* Promotion Code discount */}
                    {selectedBookingDetail.discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5" />
                          Khuyến mãi {selectedBookingDetail.promoName ? `(${selectedBookingDetail.promoName})` : ''}:
                        </span>
                        <span>-{formatCurrency(selectedBookingDetail.discountAmount)}</span>
                      </div>
                    )}

                    {/* Points discount */}
                    {selectedBookingDetail.usedPoints > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span className="flex items-center gap-1">
                          <Gift className="w-3.5 h-3.5" />
                          Khấu trừ bằng điểm ({selectedBookingDetail.usedPoints} pts):
                        </span>
                        <span>-{formatCurrency(selectedBookingDetail.pointsDiscountAmount || (selectedBookingDetail.usedPoints * 100))}</span>
                      </div>
                    )}

                    {/* Final Payment amount */}
                    <div className="flex justify-between text-slate-900 font-bold border-t border-slate-100 pt-2.5 text-sm">
                      <span>Thực tế thanh toán:</span>
                      <span className="text-primary text-base font-extrabold">
                        {formatCurrency(selectedBookingDetail.totalAmount)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedBookingDetail(null)}
                    className="w-full py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/10 cursor-pointer"
                  >
                    Đóng chi tiết
                  </button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

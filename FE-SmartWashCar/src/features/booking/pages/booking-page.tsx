import React, { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Car,
  Sparkles,
  Clock,
  Droplet,
  Gem,
  Sun,
  Moon,
  CheckCircle,
  PlusCircle,
  Notebook,
  Gift
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import toast from 'react-hot-toast'
import {
  type Vehicle
} from '@/shared/data/mockData'
import { formatCurrency, cn } from '@/shared/lib/utils'
import { ClientSidebar } from '@/features/client/components/client-sidebar'
import { ClientTopbar } from '@/features/client/components/client-topbar'
import type { AppDispatch, RootState } from '@/app/store'
import { fetchBookings, fetchVehicles, fetchLoyaltyBalance } from '@/features/client/store/client-slice'
import { vehicleService } from '@/features/client/services/vehicle-service'
import { bookingService } from '@/features/booking/services/booking-service'
import { promotionService } from '@/features/client/services/promotion-service'

interface BookingPageProps {
  onBookingSuccess: (newBooking: any) => void
}

export function BookingPage({ onBookingSuccess }: BookingPageProps) {
  const dispatch = useDispatch<AppDispatch>()
  const user = useSelector((state: RootState) => state.auth.user)
  const apiVehicles = useSelector((state: RootState) => state.client.vehicles.items)
  const clientBookings = useSelector((state: RootState) => state.client.bookings.items)
  const { tier, balance } = useSelector((state: RootState) => state.client.loyalty)

  // Generate next 7 days dynamically starting from today
  const days = useMemo(() => {
    const list = []
    const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
    for (let i = 0; i < 7; i++) {
      const d = new Date()
      d.setDate(d.getDate() + i)
      const dayOfWeek = weekDays[d.getDay()]
      const date = d.getDate()
      const month = d.getMonth() + 1
      const year = d.getFullYear()
      const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`
      list.push({
        dayOfWeek,
        date,
        label: `Tháng ${month}`,
        formattedDate,
        year
      })
    }
    return list
  }, [])

  // Map API vehicles to local Vehicle type
  const vehicles = useMemo(() => {
    if (apiVehicles.length === 0) {
      return []
    }
    return apiVehicles.map(v => ({
      id: v.id || (v as any).vehicleId,
      plate: v.licensePlate,
      model: v.brand ? `${v.brand} ${v.color || ''}` : v.vehicleType
    }))
  }, [apiVehicles])

  // Booking states
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [dbServices, setDbServices] = useState<any[]>([])
  const [selectedServicesList, setSelectedServicesList] = useState<any[]>([])
  const [selectedDateStr, setSelectedDateStr] = useState<string>(days[0].formattedDate)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('')
  const [availableSlots, setAvailableSlots] = useState<{ time: string; available: boolean }[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [isAddCarOpen, setIsAddCarOpen] = useState(false)
  const [customerNotes, setCustomerNotes] = useState('')
  const [activePromotions, setActivePromotions] = useState<any[]>([])
  const [selectedPromo, setSelectedPromo] = useState<any | null>(null)
  
  // Trạng thái sử dụng điểm tích lũy
  const [usePoints, setUsePoints] = useState(false)

  // New car fields
  const [newPlate, setNewPlate] = useState('')
  const [newModel, setNewModel] = useState('')

  // Load vehicles and bookings on mount
  useEffect(() => {
    dispatch(fetchVehicles())
    dispatch(fetchBookings())
  }, [dispatch])

  // Load db services and promotions on mount
  useEffect(() => {
    const fetchDbServices = async () => {
      try {
        const data = await bookingService.getServices()
        setDbServices(data)
        if (data.length > 0) {
          setSelectedServicesList([data[0]]) // Select first as default
        }
      } catch (err) {
        console.error('Failed to load services:', err)
      }
    }
    const fetchPromos = async () => {
      try {
        const data = await promotionService.getActivePromotions()
        setActivePromotions(data)
      } catch (err) {
        console.error('Failed to load promotions:', err)
      }
    }
    fetchDbServices()
    fetchPromos()
  }, [])

  // Phân chia danh mục Combo và Dịch vụ đơn lẻ
  const combos = useMemo(() => {
    return dbServices.filter(s => s.combo && s.active)
  }, [dbServices])

  const singleServices = useMemo(() => {
    return dbServices.filter(s => !s.combo && s.active)
  }, [dbServices])

  // Calculate dynamic fields
  const totalAmount = useMemo(() => {
    return selectedServicesList.reduce((acc, s) => acc + (s.basePrice || 0), 0)
  }, [selectedServicesList])

  const discountAmount = useMemo(() => {
    if (!selectedPromo) return 0
    const val = selectedPromo.value || 0
    if (val < 100) {
      let calc = Math.round(totalAmount * (val / 100))
      if (selectedPromo.maxDiscount && calc > selectedPromo.maxDiscount) {
        calc = selectedPromo.maxDiscount
      }
      return calc
    } else {
      return val
    }
  }, [selectedPromo, totalAmount])

  // Tính toán số tiền được khấu trừ từ điểm (1 điểm = 100đ)
  const amountAfterPromo = useMemo(() => {
    const amt = totalAmount - discountAmount
    return amt < 0 ? 0 : amt
  }, [totalAmount, discountAmount])

  const { pointsToUse, pointsDiscountAmount } = useMemo(() => {
    if (!usePoints || balance <= 0) {
      return { pointsToUse: 0, pointsDiscountAmount: 0 }
    }
    const maxPotentialDiscount = balance * 100
    if (maxPotentialDiscount >= amountAfterPromo) {
      // Khấu trừ toàn bộ hóa đơn về 0đ
      const neededPoints = Math.ceil(amountAfterPromo / 100)
      return {
        pointsToUse: neededPoints,
        pointsDiscountAmount: neededPoints * 100
      }
    } else {
      // Khấu trừ tối đa điểm đang có
      return {
        pointsToUse: balance,
        pointsDiscountAmount: balance * 100
      }
    }
  }, [usePoints, balance, amountAfterPromo])

  const finalAmount = useMemo(() => {
    const amt = amountAfterPromo - pointsDiscountAmount
    return amt < 0 ? 0 : amt
  }, [amountAfterPromo, pointsDiscountAmount])

  const totalDuration = useMemo(() => {
    return selectedServicesList.reduce((acc, s) => acc + (s.estimatedDuration || 0), 0)
  }, [selectedServicesList])

  const pointsEarned = useMemo(() => {
    return Math.floor(finalAmount / 5000)
  }, [finalAmount])

  // Lọc danh sách ID khuyến mãi khách hàng này đã sử dụng
  const usedPromoIds = useMemo(() => {
    console.log("DEBUG: clientBookings = ", clientBookings)
    const filtered = clientBookings
      .filter((b) => b.status !== 'CANCELLED' && b.promoId)
      .map((b) => b.promoId as string)
    console.log("DEBUG: usedPromoIds = ", filtered)
    return filtered
  }, [clientBookings])

  // Select default vehicle when list is loaded
  useEffect(() => {
    if (vehicles.length > 0) {
      const storedVehicleId = localStorage.getItem('booking_vehicle_id')
      if (storedVehicleId) {
        const found = vehicles.find(v => v.id === storedVehicleId)
        if (found) {
          setSelectedVehicle(found)
          localStorage.removeItem('booking_vehicle_id')
          return
        }
      }

      if (!selectedVehicle) {
        const primary = apiVehicles.find(v => v.primary)
        if (primary) {
          const primaryId = primary.id || (primary as any).vehicleId
          const foundPrimary = vehicles.find(v => v.id === primaryId)
          if (foundPrimary) {
            setSelectedVehicle(foundPrimary)
            return
          }
        }
        setSelectedVehicle(vehicles[0])
      }
    }
  }, [vehicles, selectedVehicle, apiVehicles])

  // Fetch slot availability when selected date changes
  useEffect(() => {
    let active = true
    const fetchAvailability = async () => {
      setIsLoadingSlots(true)
      try {
        const slots = await bookingService.getAvailability(selectedDateStr)
        if (active) {
          const mappedSlots = slots.map((s: any) => {
            let slotTime = s.time
            if (!slotTime && s.startsAt && typeof s.startsAt === 'string') {
              const timePart = s.startsAt.split('T')[1]
              if (timePart) {
                slotTime = timePart.substring(0, 5)
              }
            }
            return {
              ...s,
              time: slotTime || ''
            }
          })
          setAvailableSlots(mappedSlots)
          // Reset time slot when changing date so user is forced to select
          setSelectedTimeSlot('')
        }
      } catch {
        // Fallback default slots
        if (active) {
          const defaultSlots = [
            { time: '08:00', available: false },
            { time: '08:30', available: true },
            { time: '09:00', available: true },
            { time: '09:30', available: true },
            { time: '10:00', available: true },
            { time: '10:30', available: true },
            { time: '11:00', available: false },
            { time: '11:30', available: true },
            { time: '13:30', available: true },
            { time: '14:00', available: true },
            { time: '14:30', available: true },
            { time: '15:00', available: true },
            { time: '15:30', available: true },
            { time: '16:00', available: true },
            { time: '16:30', available: true },
            { time: '17:00', available: true }
          ]
          setAvailableSlots(defaultSlots)
          setSelectedTimeSlot('')
        }
      } finally {
        if (active) {
          setIsLoadingSlots(false)
        }
      }
    }
    fetchAvailability()
    return () => {
      active = false
    }
  }, [selectedDateStr])

  // Filter slots into morning and afternoon
  const morningSlots = useMemo(() => {
    return availableSlots.filter(s => {
      if (!s || typeof s.time !== 'string') return false
      const hour = parseInt(s.time.split(':')[0], 10)
      return hour < 12
    })
  }, [availableSlots])

  const afternoonSlots = useMemo(() => {
    return availableSlots.filter(s => {
      if (!s || typeof s.time !== 'string') return false
      const hour = parseInt(s.time.split(':')[0], 10)
      return hour >= 12
    })
  }, [availableSlots])

  const handleAddNewCar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPlate || !newModel) return
    try {
      const response = await vehicleService.addVehicle({
        licensePlate: newPlate.toUpperCase(),
        vehicleType: 'CAR',
        brand: newModel,
        color: 'Trắng',
        primary: false
      })
      toast.success('Thêm xe mới thành công')
      dispatch(fetchVehicles())
      setSelectedVehicle({
        id: response.id || (response as any).vehicleId,
        plate: response.licensePlate,
        model: response.brand || 'CAR'
      })
      setNewPlate('')
      setNewModel('')
      setIsAddCarOpen(false)
    } catch {
      toast.error('Không thể thêm xe mới')
    }
  }

  // Tự động bỏ chọn bên đối lập khi chọn gói dịch vụ mới
  const handleSelectService = (service: any) => {
    const isSelected = selectedServicesList.some(s => s.serviceId === service.serviceId)

    if (service.combo) {
      // Chọn Combo: Bỏ chọn toàn bộ dịch vụ đơn lẻ khác, chỉ lấy combo này
      if (isSelected) {
        if (selectedServicesList.length > 1) {
          setSelectedServicesList(selectedServicesList.filter(s => s.serviceId !== service.serviceId))
        } else {
          toast.error('Vui lòng chọn ít nhất 1 dịch vụ')
        }
      } else {
        setSelectedServicesList([service])
        toast.success(`Đã chọn gói combo: ${service.name}`)
      }
    } else {
      // Chọn dịch vụ đơn: Bỏ chọn toàn bộ combo khác, cho chọn nhiều dịch vụ đơn lẻ
      const listWithoutCombos = selectedServicesList.filter(s => !s.combo)
      const isAlreadySelected = listWithoutCombos.some(s => s.serviceId === service.serviceId)

      if (isAlreadySelected) {
        if (listWithoutCombos.length > 1) {
          setSelectedServicesList(listWithoutCombos.filter(s => s.serviceId !== service.serviceId))
        } else {
          toast.error('Vui lòng chọn ít nhất 1 dịch vụ đơn')
        }
      } else {
        setSelectedServicesList([...listWithoutCombos, service])
        if (selectedServicesList.some(s => s.combo)) {
          toast.success('Đã chuyển sang chế độ chọn dịch vụ đơn lẻ')
        }
      }
    }
  }

  const handleConfirmBooking = async () => {
    if (!selectedVehicle) {
      toast.error('Vui lòng chọn hoặc thêm phương tiện trước')
      return
    }

    if (!selectedDateStr) {
      toast.error('Vui lòng chọn ngày thực hiện')
      return
    }

    if (!selectedTimeSlot) {
      toast.error('Vui lòng chọn khung giờ thực hiện')
      return
    }

    const vId = selectedVehicle.id || (selectedVehicle as any).vehicleId
    if (!vId) {
      toast.error('Không tìm thấy thông tin xe hợp lệ')
      return
    }

    if (selectedServicesList.length === 0) {
      toast.error('Vui lòng chọn ít nhất một dịch vụ')
      return
    }

    const serviceIds = selectedServicesList.map(s => s.serviceId)
    const scheduledAt = `${selectedDateStr}T${selectedTimeSlot}:00`

    // Đính kèm ghi chú khách hàng tự nhập, nếu trống thì tự động tạo theo tên các dịch vụ
    const finalNotes = customerNotes.trim()
      ? customerNotes.trim()
      : `Đặt lịch qua ứng dụng: ${selectedServicesList.map(s => s.name).join(', ')}`

    try {
      const result = await bookingService.createBooking({
        vehicleId: vId,
        scheduledAt,
        serviceIds,
        notes: finalNotes,
        promoId: selectedPromo ? selectedPromo.promoId : undefined,
        usedPoints: pointsToUse
      })
      toast.success('Đặt lịch thành công')
      
      // Đồng bộ lại số điểm của khách hàng sau khi trừ
      if (user?.id) {
        dispatch(fetchLoyaltyBalance(user.id))
      }
      
      dispatch(fetchBookings())
      onBookingSuccess(result)
      setIsSuccessModalOpen(true)
    } catch {
      toast.error('Đặt lịch thất bại. Vui lòng thử lại sau.')
    }
  }

  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false)
    setUsePoints(false) // Reset state đổi điểm khi đóng pop up thành công
    setSelectedPromo(null)
    setCustomerNotes('')
    setSelectedTimeSlot('')
    if (dbServices.length > 0) {
      setSelectedServicesList([dbServices[0]])
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <ClientSidebar />
      <ClientTopbar title="Đặt lịch dịch vụ" />

      <main className="min-h-screen px-6 pb-8 pt-24 lg:pl-[calc(16rem+24px)]">
        <div className="mx-auto max-w-[1280px] space-y-8 pb-24 relative">
          {/* 3-Step Wizard Indicator */}
          <div className='flex items-center justify-between max-w-2xl mx-auto mb-8 relative'>
            <div className='absolute top-1/2 left-0 w-full h-[0.5px] bg-slate-200 -translate-y-1/2 -z-10'></div>

            {/* Step 1 */}
            <div className='flex flex-col items-center gap-2 bg-[#F8FAFC] px-4'>
              <div className='w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white ring-4 ring-[#F8FAFC] shadow-md shadow-indigo-100'>
                <Car className='w-5 h-5' />
              </div>
              <span className='text-xs font-bold text-indigo-600'>Chọn xe</span>
            </div>

            {/* Step 2 */}
            <div className='flex flex-col items-center gap-2 bg-[#F8FAFC] px-4'>
              <div className='w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white ring-4 ring-[#F8FAFC] shadow-md shadow-indigo-100 animate-pulse'>
                <Sparkles className='w-5 h-5' />
              </div>
              <span className='text-xs font-bold text-indigo-600'>Dịch vụ</span>
            </div>

            {/* Step 3 */}
            <div className='flex flex-col items-center gap-2 bg-[#F8FAFC] px-4'>
              <div className='w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 ring-4 ring-[#F8FAFC]'>
                <Clock className='w-5 h-5' />
              </div>
              <span className='text-xs font-semibold text-slate-405'>
                Thời gian
              </span>
            </div>
          </div>

          {/* Main Form Fields Bento-like Layout */}
          <div className='grid grid-cols-12 gap-6'>
            {/* Column Left: Chọn xe (4 cols) */}
            <div className='col-span-12 lg:col-span-4 space-y-4'>
              <div className='flex justify-between items-center'>
                <h3 className='text-sm font-bold text-slate-900 tracking-tight uppercase'>
                  1. Chọn phương tiện
                </h3>
                <button
                  onClick={() => setIsAddCarOpen(true)}
                  className='text-indigo-600 hover:text-indigo-700 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer'
                >
                  <PlusCircle className='w-4 h-4' />
                  Thêm xe mới
                </button>
              </div>

              <div className='space-y-3'>
                {vehicles.length === 0 ? (
                  <div className='p-6 text-center border border-dashed border-slate-200 bg-white rounded-2xl'>
                    <p className='text-xs text-slate-400 font-medium'>Chưa có xe nào được đăng ký</p>
                    <button
                      onClick={() => setIsAddCarOpen(true)}
                      className='mt-3 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-all'
                    >
                      Thêm xe ngay
                    </button>
                  </div>
                ) : (
                  vehicles.map((veh) => {
                    const isSelected = selectedVehicle?.id === veh.id
                    return (
                      <div
                        key={veh.id}
                        onClick={() => setSelectedVehicle(veh)}
                        className={cn(
                          'p-4 bg-white rounded-2xl border hover:border-indigo-500 transition-all flex items-center gap-4 cursor-pointer relative overflow-hidden',
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/15'
                            : 'border-slate-200'
                        )}
                      >
                        <div
                          className={cn(
                            'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
                            isSelected
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'bg-slate-50 text-slate-400 border border-slate-100'
                          )}
                        >
                          <Car className='w-6 h-6' />
                        </div>
                        <div className='flex-1'>
                          <p className='text-xs font-bold text-slate-900'>
                            {veh.plate}
                          </p>
                          <p className='text-[11px] text-slate-405 font-medium mt-0.5'>
                            {veh.model}
                          </p>
                        </div>
                        <div
                          className={cn(
                            'w-5 h-5 rounded-full border flex items-center justify-center transition-all',
                            isSelected
                              ? 'border-indigo-600 bg-indigo-600'
                              : 'border-slate-300'
                          )}
                        >
                          {isSelected && (
                            <div className='w-2 h-2 rounded-full bg-white'></div>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Column Right: Chọn gói dịch vụ (8 cols) */}
            <div className='col-span-12 lg:col-span-8 space-y-6'>
              <h3 className='text-sm font-bold text-slate-900 tracking-tight uppercase'>
                2. Chọn gói dịch vụ
              </h3>

              {/* Combo packages section */}
              {combos.length > 0 && (
                <div className='space-y-3'>
                  <div className='flex items-center gap-1.5'>
                    <span className='w-1.5 h-3.5 bg-purple-650 rounded-full'></span>
                    <h4 className='text-xs font-bold text-purple-800 uppercase tracking-wider'>Gói Combo Tiết Kiệm & Đa Dịch Vụ</h4>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {combos.map((service) => {
                      const isSelected = selectedServicesList.some(s => s.serviceId === service.serviceId)
                      return (
                        <div
                          key={service.serviceId}
                          onClick={() => handleSelectService(service)}
                          className={cn(
                            'p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group relative min-h-[190px]',
                            isSelected
                              ? 'bg-purple-950 text-white border-purple-950 shadow-md scale-[1.01]'
                              : 'bg-white text-slate-800 border-slate-200 hover:border-purple-500 shadow-xs'
                          )}
                        >
                          <div>
                            <div className='flex justify-between items-start mb-3'>
                              <span
                                className={cn(
                                  'p-2 rounded-xl shrink-0 border flex items-center justify-center',
                                  isSelected
                                    ? 'bg-white/10 border-white/20 text-amber-400'
                                    : 'bg-purple-50 border-purple-100 text-purple-700'
                                )}
                              >
                                <Gem className='w-5 h-5' />
                              </span>
                              {isSelected ? (
                                <CheckCircle className='w-5 h-5 text-amber-400' />
                              ) : (
                                <div className='w-5 h-5 rounded-full border border-slate-200 group-hover:border-purple-500 transition-colors' />
                              )}
                            </div>

                            <h4 className='text-xs font-bold mb-1 uppercase tracking-tight'>{service.name}</h4>
                            <p className={cn(
                              'text-[10px] leading-relaxed font-semibold',
                              isSelected ? 'text-purple-200' : 'text-slate-500'
                            )}>
                              {service.description}
                            </p>
                          </div>

                          <div className='mt-4 flex justify-between items-end border-t border-slate-100/10 pt-3'>
                            <div>
                              <p className={cn('text-base font-bold tracking-tight', isSelected ? 'text-amber-400' : 'text-purple-700')}>
                                {formatCurrency(service.basePrice)}
                              </p>
                              <p className='text-[8px] font-bold text-emerald-600 mt-0.5 uppercase tracking-wide'>
                                +{service.points || Math.floor(service.basePrice / 5000)} pts
                              </p>
                            </div>
                            <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider', isSelected ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-800')}>
                              {service.estimatedDuration} phút
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Single services section */}
              {singleServices.length > 0 && (
                <div className='space-y-3 pt-2'>
                  <div className='flex items-center gap-1.5'>
                    <span className='w-1.5 h-3.5 bg-indigo-650 rounded-full'></span>
                    <h4 className='text-xs font-bold text-indigo-800 uppercase tracking-wider'>Dịch vụ Đơn Lẻ Tùy Chọn</h4>
                  </div>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    {singleServices.map((service) => {
                      const isSelected = selectedServicesList.some(s => s.serviceId === service.serviceId)
                      return (
                        <div
                          key={service.serviceId}
                          onClick={() => handleSelectService(service)}
                          className={cn(
                            'p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group relative min-h-[200px]',
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.01]'
                              : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-500 shadow-xs'
                          )}
                        >
                          <div>
                            <div className='flex justify-between items-start mb-3'>
                              <span
                                className={cn(
                                  'p-2 rounded-xl shrink-0 border flex items-center justify-center',
                                  isSelected
                                    ? 'bg-white/10 border-white/20 text-amber-400'
                                    : 'bg-slate-50 border-slate-200/50 text-[#4F46E5]'
                                )}
                              >
                                {service.name.includes('cao cấp') || service.name.includes('Cao cấp') ? (
                                  <Sparkles className='w-5 h-5' />
                                ) : (
                                  <Droplet className='w-5 h-5' />
                                )}
                              </span>
                              {isSelected ? (
                                <CheckCircle className='w-5 h-5 text-amber-400' />
                              ) : (
                                <div className='w-5 h-5 rounded-full border border-slate-200 group-hover:border-indigo-500 transition-colors' />
                              )}
                            </div>

                            <h4 className='text-xs font-bold mb-1 uppercase tracking-tight'>{service.name}</h4>
                            <p className={cn(
                              'text-[10px] leading-relaxed font-semibold',
                              isSelected ? 'text-slate-300' : 'text-slate-500'
                            )}>
                              {service.description}
                            </p>
                          </div>

                          <div className='mt-4 flex justify-between items-end border-t border-slate-100/10 pt-3'>
                            <div>
                              <p className={cn('text-base font-bold tracking-tight', isSelected ? 'text-amber-400' : 'text-indigo-650')}>
                                {formatCurrency(service.basePrice)}
                              </p>
                              <p className='text-[8px] font-bold text-emerald-600 mt-0.5 uppercase tracking-wide'>
                                +{service.points || Math.floor(service.basePrice / 5000)} pts
                              </p>
                            </div>
                            <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider', isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-800')}>
                              {service.estimatedDuration}m
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Full width: Thời gian thực hiện (12 cols) */}
            <div className='col-span-12 space-y-4'>
              <h3 className='text-sm font-bold text-slate-900 tracking-tight uppercase'>
                3. Thời gian thực hiện & Ghi chú
              </h3>

              <div className='bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6'>
                {/* Days view list */}
                <div>
                  <p className='text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-3'>
                    Chọn ngày thực hiện
                  </p>
                  <div className='flex gap-3 overflow-x-auto no-scrollbar pb-1'>
                    {days.map((day) => {
                      const isDaySelected = selectedDateStr === day.formattedDate
                      return (
                        <button
                          key={day.formattedDate}
                          onClick={() => setSelectedDateStr(day.formattedDate)}
                          className={cn(
                            'flex-shrink-0 w-24 p-3 rounded-xl border flex flex-col items-center transition-all cursor-pointer',
                            isDaySelected
                              ? 'border-indigo-600 bg-indigo-50/20 text-indigo-700 font-bold'
                              : 'border-slate-200 bg-white text-slate-455 hover:border-slate-350 font-semibold'
                          )}
                        >
                          <span className='text-[10px] uppercase font-bold tracking-tight opacity-75'>
                            {day.dayOfWeek}
                          </span>
                          <span
                            className={cn(
                              'text-base my-0.5 tracking-tight font-bold',
                              isDaySelected ? 'text-indigo-700' : 'text-slate-800'
                            )}
                          >
                            {day.date}
                          </span>
                          <span className='text-[9px] uppercase tracking-wider opacity-70 font-bold'>
                            {day.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Time Slot Grid (Morning / Afternoon) */}
                <div className='space-y-5'>
                  {isLoadingSlots ? (
                    <div className='py-6 text-center text-xs text-slate-400 font-medium'>
                      Đang tải khung giờ trống...
                    </div>
                  ) : (
                    <>
                      {/* Morning slots */}
                      {morningSlots.length > 0 && (
                        <div>
                          <div className='flex items-center gap-1.5 text-xs text-slate-405 font-bold uppercase tracking-wider mb-3'>
                            <Sun className='w-4 h-4 text-amber-500' />
                            <span>Buổi sáng</span>
                          </div>
                          <div className='grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5'>
                            {morningSlots.map((slot) => {
                              const isSelected = selectedTimeSlot === slot.time
                              return (
                                <button
                                  key={slot.time}
                                  disabled={!slot.available}
                                  onClick={() => setSelectedTimeSlot(slot.time)}
                                  className={cn(
                                    'py-2.5 px-2 rounded-lg text-xs transition-all border text-center font-semibold cursor-pointer',
                                    !slot.available
                                      ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed font-medium opacity-60'
                                      : isSelected
                                        ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-md shadow-indigo-150'
                                        : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-501'
                                  )}
                                >
                                  {slot.time}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Afternoon slots */}
                      {afternoonSlots.length > 0 && (
                        <div>
                          <div className='flex items-center gap-1.5 text-xs text-slate-405 font-bold uppercase tracking-wider mb-3'>
                            <Moon className='w-4 h-4 text-sky-800' />
                            <span>Buổi chiều</span>
                          </div>
                          <div className='grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5'>
                            {afternoonSlots.map((slot) => {
                              const isSelected = selectedTimeSlot === slot.time
                              return (
                                <button
                                  key={slot.time}
                                  disabled={!slot.available}
                                  onClick={() => setSelectedTimeSlot(slot.time)}
                                  className={cn(
                                    'py-2.5 px-2 rounded-lg text-xs transition-all border text-center font-semibold cursor-pointer',
                                    !slot.available
                                      ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed font-medium opacity-60'
                                      : isSelected
                                        ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-md shadow-indigo-150'
                                        : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-501'
                                  )}
                                >
                                  {slot.time}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {availableSlots.length === 0 && (
                        <div className='py-6 text-center text-xs text-slate-400 font-medium'>
                          Không có khung giờ nào khả dụng cho ngày này.
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Promotion Section */}
                <div className='border-t border-slate-100 pt-5 space-y-3'>
                  <div className='flex items-center gap-1.5 text-xs text-slate-800 font-bold uppercase tracking-wider'>
                    <Sparkles className='w-4 h-4 text-indigo-500' />
                    <span>Chọn chương trình khuyến mãi</span>
                  </div>
                  <p className='text-[10px] text-slate-400 font-semibold'>Chọn một mã ưu đãi khả dụng cho hạng thành viên của bạn để được giảm giá.</p>
                  
                  {activePromotions.length === 0 ? (
                    <div className='p-3 text-center border border-slate-100 rounded-xl bg-slate-50 text-[10px] text-slate-400 font-medium'>
                      Không có chương trình khuyến mãi nào đang diễn ra
                    </div>
                  ) : (
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                      {activePromotions.map((promo) => {
                        const getTierRank = (t: string) => {
                          const name = (t || '').toLowerCase()
                          if (name === 'platinum') return 4
                          if (name === 'gold') return 3
                          if (name === 'silver') return 2
                          return 1
                        }
                        const targetTiersList = (promo.targetTiers || '')
                          .toUpperCase()
                          .split(',')
                          .map((t: string) => t.trim())
                        
                        let minRequiredRank = 4
                        if (targetTiersList.length > 0) {
                          targetTiersList.forEach((t: string) => {
                            const r = getTierRank(t)
                            if (r < minRequiredRank) {
                              minRequiredRank = r
                            }
                          })
                        } else {
                          minRequiredRank = 1
                        }

                        const userRank = getTierRank(tier)
                        const isEligible = userRank >= minRequiredRank

                        const isSelected = selectedPromo?.promoId === promo.promoId
                        const isAlreadyUsed = usedPromoIds.includes(promo.promoId)

                        return (
                          <div
                            key={promo.promoId}
                            onClick={() => {
                              if (isAlreadyUsed) {
                                toast.error('Bạn đã sử dụng mã khuyến mãi này rồi')
                                return
                              }
                              if (!isEligible) {
                                toast.error(`Mã này yêu cầu hạng ${promo.targetTiers}`)
                                return
                              }
                              if (isSelected) {
                                setSelectedPromo(null)
                                toast.success('Đã hủy áp dụng mã khuyến mãi')
                              } else {
                                setSelectedPromo(promo)
                                toast.success(`Đã áp dụng mã: ${promo.name}`)
                              }
                            }}
                            className={cn(
                              'p-3.5 rounded-xl border flex flex-col justify-between transition-all relative overflow-hidden select-none cursor-pointer',
                              isSelected
                                ? 'border-emerald-600 bg-emerald-50/10'
                                : isAlreadyUsed
                                  ? 'border-slate-150 bg-slate-100 opacity-55 cursor-not-allowed'
                                  : isEligible
                                    ? 'border-slate-200 bg-white hover:border-indigo-500'
                                    : 'border-slate-150 bg-slate-50 opacity-60 cursor-not-allowed'
                            )}
                          >
                            <div className='flex justify-between items-start gap-2'>
                              <div className='flex items-center gap-2'>
                                <div className={cn(
                                  'p-1.5 rounded-lg border',
                                  isSelected ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                                )}>
                                  <Sparkles className='w-4 h-4' />
                                </div>
                                <div>
                                  <h5 className='text-xs font-bold text-slate-800 line-clamp-1'>{promo.name}</h5>
                                  <p className='text-[9px] text-slate-400 font-semibold mt-0.5 line-clamp-1'>{promo.description || 'Ưu đãi dành cho bạn'}</p>
                                </div>
                              </div>
                              <div className={cn(
                                'w-4 h-4 rounded-full border flex items-center justify-center shrink-0',
                                isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                              )}>
                                {isSelected && <div className='w-1.5 h-1.5 rounded-full bg-white'></div>}
                              </div>
                            </div>
                            
                            <div className='mt-2.5 pt-2 border-t border-slate-100 flex justify-between items-center text-[9px] font-bold text-slate-500'>
                              {isAlreadyUsed ? (
                                <span className='px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-600 uppercase tracking-wider'>
                                  Đã dùng
                                </span>
                              ) : (
                                <span className={cn(
                                  'px-1.5 py-0.5 rounded-md uppercase tracking-wider',
                                  isEligible ? 'bg-indigo-50 text-indigo-750' : 'bg-slate-200 text-slate-500'
                                )}>
                                  {promo.targetTiers}
                                </span>
                              )}
                              <span className='text-emerald-600'>
                                {promo.value < 100 
                                  ? `Giảm ${promo.value}%${promo.maxDiscount ? ` (tối đa ${formatCurrency(promo.maxDiscount)})` : ''}` 
                                  : `Giảm ${formatCurrency(promo.value)}`
                                }
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Phân hệ sử dụng điểm tích lũy */}
                <div className='border-t border-slate-100 pt-5 space-y-3'>
                  <div className='flex items-center gap-1.5 text-xs text-slate-800 font-bold uppercase tracking-wider'>
                    <Gift className='w-4 h-4 text-indigo-500' />
                    <span>Sử dụng điểm tích lũy</span>
                  </div>
                  <div className='flex items-center justify-between p-4 bg-slate-50 border border-slate-200/80 rounded-2xl'>
                    <div className='space-y-0.5'>
                      <p className='text-xs font-bold text-slate-800'>
                        Số dư điểm của bạn: <span className='text-indigo-600'>{balance || 0} pts</span>
                      </p>
                      <p className='text-[10px] text-slate-450 font-semibold'>
                        Tỷ lệ quy đổi: 1 điểm = 100đ (Khấu trừ tối đa bằng số tiền thanh toán)
                      </p>
                    </div>

                    <label className='relative inline-flex items-center cursor-pointer select-none'>
                      <input 
                        type='checkbox' 
                        disabled={!balance || balance <= 0}
                        checked={usePoints} 
                        onChange={(e) => setUsePoints(e.target.checked)} 
                        className='sr-only peer' 
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {usePoints && pointsToUse > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className='p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-[10px] text-emerald-800 font-bold flex items-center justify-between'
                    >
                      <span>Đã áp dụng khấu trừ bằng điểm:</span>
                      <span>-{pointsToUse} pts (Giảm {formatCurrency(pointsDiscountAmount)})</span>
                    </motion.div>
                  )}
                </div>

                {/* Customer Notes Field */}
                <div className='border-t border-slate-100 pt-5 space-y-2'>
                  <div className='flex items-center gap-1.5 text-xs text-slate-800 font-bold uppercase tracking-wider'>
                    <Notebook className='w-4 h-4 text-slate-500' />
                    <span>Lưu ý đặc biệt gửi cho cửa hàng</span>
                  </div>
                  <p className='text-[10px] text-slate-400 font-semibold'>Nhập các yêu cầu riêng như: rửa kỹ mâm xe, tẩy vết bẩn ở ghế phụ, v.v.</p>
                  <textarea
                    rows={3}
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder='VD: Nhờ các kỹ thuật viên hút bụi kỹ cốp xe giúp tui nhé...'
                    className='w-full px-4 py-3 border border-slate-200 bg-slate-50 focus:bg-white rounded-2xl text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-350'
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Summary Action footer bar */}
          <div className='fixed bottom-0 right-0 left-0 lg:left-64 bg-white border-t border-slate-200 px-6 py-4 flex justify-between items-center z-30 shadow-[0_-4px_24px_rgba(15,23,42,0.06)]'>
            <div>
              <div className='flex items-baseline gap-1'>
                <span className='text-xs text-slate-400 font-bold uppercase tracking-wide'>
                  Tổng cộng:
                </span>
                {selectedPromo || pointsDiscountAmount > 0 ? (
                  <div className='flex items-baseline gap-2'>
                    <span className='text-xs line-through text-slate-400'>
                      {formatCurrency(totalAmount)}
                    </span>
                    <span className='text-xl font-bold tracking-tight text-slate-900'>
                      {formatCurrency(finalAmount)}
                    </span>
                  </div>
                ) : (
                  <span className='text-xl font-bold tracking-tight text-slate-900'>
                    {formatCurrency(totalAmount)}
                  </span>
                )}
              </div>
              <p className='text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-0.5'>
                Tích lũy: +{pointsEarned} điểm thưởng ({totalDuration} phút)
              </p>
            </div>

            <div className='flex gap-3'>
              <button
                onClick={() => {
                  if (dbServices.length > 0) {
                    setSelectedServicesList([dbServices[0]])
                  }
                  setCustomerNotes('')
                  setSelectedPromo(null)
                  setUsePoints(false)
                }}
                className='px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100/50 transition-all select-none cursor-pointer'
              >
                Reset
              </button>
              <button
                onClick={handleConfirmBooking}
                className='px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-650/25 select-none cursor-pointer'
              >
                Xác nhận đặt lịch
              </button>
            </div>
          </div>

          {/* Dialog: Thêm xe mới */}
          <AnimatePresence>
            {isAddCarOpen && (
              <div className='fixed inset-0 bg-slate-950/20 backdrop-blur-xs flex items-center justify-center z-50 p-4'>
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className='bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200/80 shadow-2xl space-y-4'
                >
                  <div className='flex justify-between items-center pb-2 border-b border-slate-100'>
                    <h4 className='text-xs font-bold uppercase tracking-tight text-slate-800'>
                      Thêm xe mới vào hồ sơ
                    </h4>
                    <button
                      onClick={() => setIsAddCarOpen(false)}
                      className='text-slate-450 hover:text-slate-600 text-xs font-bold cursor-pointer'
                    >
                      Đóng
                    </button>
                  </div>

                  <form onSubmit={handleAddNewCar} className='space-y-3 pt-1'>
                    <div>
                      <label className='block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1'>
                        Biển kiểm soát (VD: 51H-999.99)
                      </label>
                      <input
                        type='text'
                        required
                        placeholder='VD: 51G-123.45'
                        value={newPlate}
                        onChange={(e) => setNewPlate(e.target.value)}
                        className='w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors'
                      />
                    </div>
                    <div>
                      <label className='block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1'>
                        Hãng xe & Dòng xe (VD: Toyota Fortuner)
                      </label>
                      <input
                        type='text'
                        required
                        placeholder='VD: VinFast VF8'
                        value={newModel}
                        onChange={(e) => setNewModel(e.target.value)}
                        className='w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors'
                      />
                    </div>

                    <div className='flex gap-2 pt-3'>
                      <button
                        type='button'
                        onClick={() => setIsAddCarOpen(false)}
                        className='flex-1 py-2 border border-slate-200 text-xs font-bold text-slate-650 rounded-xl hover:bg-slate-50 transition-colors'
                      >
                        Hủy bỏ
                      </button>
                      <button
                        type='submit'
                        className='flex-1 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 cursor-pointer'
                      >
                        Lưu xe
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Dialog: Đặt lịch thành công */}
          <AnimatePresence>
            {isSuccessModalOpen && selectedVehicle && (
              <div className='fixed inset-0 bg-slate-950/20 backdrop-blur-xs flex items-center justify-center z-50 p-4'>
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className='bg-white rounded-2xl max-w-sm w-full p-6 text-center border border-slate-200/80 shadow-2xl space-y-4'
                >
                  <div className='w-12 h-12 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs'>
                    <CheckCircle className='w-6 h-6' />
                  </div>

                  <div className='space-y-1.5'>
                    <h4 className='text-sm font-bold text-slate-900 tracking-tight uppercase'>
                      Đặt lịch thành công!
                    </h4>
                    <p className='text-xs text-slate-500 leading-relaxed font-semibold mt-1'>
                      Yêu cầu đặt lịch phục vụ xe{' '}
                      <span className='font-bold text-slate-800'>
                        {selectedVehicle.plate}
                      </span>{' '}
                      vào lúc{' '}
                      <span className='font-bold text-slate-800'>
                        {selectedTimeSlot} ({selectedDateStr.split('-').slice(1).reverse().join('/')})
                      </span>{' '}
                      đã được lưu giữ trên hệ thống.
                    </p>
                  </div>

                  <div className='bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 text-left text-[11px] space-y-1.5 text-slate-600 font-semibold'>
                    <p>
                      • <span className='text-slate-400'>Dịch vụ:</span>{' '}
                      {selectedServicesList.map(s => s.name).join(', ')}
                    </p>
                    <p>
                      • <span className='text-slate-400'>Chi phí:</span>{' '}
                      {selectedPromo || pointsDiscountAmount > 0 ? (
                        <span>
                          <span className='line-through text-slate-400 mr-2'>{formatCurrency(totalAmount)}</span>
                          <span className='text-slate-800 font-bold'>{formatCurrency(finalAmount)}</span>
                        </span>
                      ) : (
                        formatCurrency(totalAmount)
                      )}
                    </p>
                    <p>
                      • <span className='text-slate-400'>Thời lượng:</span>{' '}
                      {totalDuration} phút
                    </p>
                    <p>
                      • <span className='text-slate-400'>Tích điểm:</span> +
                      {pointsEarned} điểm
                    </p>
                  </div>

                  <button
                    onClick={handleCloseSuccessModal}
                    className='w-full py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 cursor-pointer'
                  >
                    Tuyệt vời, tôi đã hiểu
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

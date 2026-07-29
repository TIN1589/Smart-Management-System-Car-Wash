import { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CalendarPlus, Car, CheckCircle2, MoreHorizontal, Plus, Star, Trash2, Edit2, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { AnimatePresence, motion } from 'motion/react'
import { ClientSidebar } from '@/features/client/components/client-sidebar'
import { ClientTopbar } from '@/features/client/components/client-topbar'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import type { AppDispatch, RootState } from '@/app/store'
import { fetchVehicles } from '@/features/client/store/client-slice'
import { vehicleService, type VehicleResponse } from '@/features/client/services/vehicle-service'
import { useRouter } from '@/app/router'
import { routes } from '@/app/routes'

export function ClientVehiclesPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { navigate } = useRouter()
  const apiVehicles = useSelector((state: RootState) => state.client.vehicles.items)
  const isLoading = useSelector((state: RootState) => state.client.vehicles.isLoading)

  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedVehicleForEdit, setSelectedVehicleForEdit] = useState<VehicleResponse | null>(null)
  
  // Dropdown menu state
  const [activeMenuVehicleId, setActiveMenuVehicleId] = useState<string | null>(null)

  // Form states
  const [licensePlate, setLicensePlate] = useState('')
  const [vehicleType, setVehicleType] = useState('CAR')
  const [brand, setBrand] = useState('')
  const [color, setColor] = useState('')

  useEffect(() => {
    dispatch(fetchVehicles())
  }, [dispatch])

  // Reset form helper
  const resetForm = () => {
    setLicensePlate('')
    setVehicleType('CAR')
    setBrand('')
    setColor('')
  }

  // Handle Add Vehicle
  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!licensePlate || !brand) {
      toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc')
      return
    }
    try {
      await vehicleService.addVehicle({
        licensePlate: licensePlate.toUpperCase(),
        vehicleType,
        brand,
        color: color || 'Chưa rõ',
        primary: apiVehicles.length === 0 // Default first vehicle as primary
      })
      toast.success('Thêm phương tiện thành công')
      dispatch(fetchVehicles())
      setIsAddOpen(false)
      resetForm()
    } catch {
      toast.error('Có lỗi xảy ra khi thêm phương tiện mới')
    }
  }

  // Open Edit Modal
  const openEditModal = (vehicle: VehicleResponse) => {
    setSelectedVehicleForEdit(vehicle)
    setLicensePlate(vehicle.licensePlate)
    setVehicleType(vehicle.vehicleType)
    setBrand(vehicle.brand || '')
    setColor(vehicle.color || '')
    setIsEditOpen(true)
    setActiveMenuVehicleId(null)
  }

  // Handle Edit Vehicle
  const handleEditVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVehicleForEdit) return
    if (!licensePlate || !brand) {
      toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc')
      return
    }
    try {
      const vId = selectedVehicleForEdit.id || (selectedVehicleForEdit as any).vehicleId
      await vehicleService.updateVehicle(vId, {
        licensePlate: licensePlate.toUpperCase(),
        vehicleType,
        brand,
        color: color || 'Chưa rõ',
        primary: selectedVehicleForEdit.primary
      })
      toast.success('Cập nhật phương tiện thành công')
      dispatch(fetchVehicles())
      setIsEditOpen(false)
      setSelectedVehicleForEdit(null)
      resetForm()
    } catch {
      toast.error('Có lỗi xảy ra khi cập nhật phương tiện')
    }
  }

  // Handle Set Default Vehicle
  const handleSetDefault = async (vehicleId: string) => {
    try {
      await vehicleService.setPrimaryVehicle(vehicleId)
      toast.success('Đặt xe mặc định thành công')
      dispatch(fetchVehicles())
      setActiveMenuVehicleId(null)
    } catch {
      toast.error('Có lỗi xảy ra khi thiết lập xe mặc định')
    }
  }

  // Handle Delete Vehicle
  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phương tiện này không?')) return
    try {
      await vehicleService.deleteVehicle(vehicleId)
      toast.success('Xóa phương tiện thành công')
      dispatch(fetchVehicles())
      setActiveMenuVehicleId(null)
    } catch {
      toast.error('Có lỗi xảy ra khi xóa phương tiện')
    }
  }

  // Handle Quick Booking
  const handleQuickBooking = (vehicleId: string) => {
    localStorage.setItem('booking_vehicle_id', vehicleId)
    navigate(routes.booking)
  }

  // Dynamic calculations for Stats
  const defaultVehicle = useMemo(() => apiVehicles.find(v => v.primary), [apiVehicles])
  const lastWashStr = useMemo(() => {
    const dates = apiVehicles.map(v => v.lastWashDate).filter(Boolean) as string[]
    if (dates.length === 0) return 'Chưa có'
    return dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
  }, [apiVehicles])

  const vehicleStats = [
    { label: 'Tổng số xe', value: apiVehicles.length.toString() },
    { label: 'Xe mặc định', value: defaultVehicle ? `${defaultVehicle.brand || defaultVehicle.licensePlate}` : 'Chưa thiết lập' },
    { label: 'Lần rửa gần nhất', value: lastWashStr },
  ]

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <ClientSidebar />
      <ClientTopbar title="Xe của tôi" utility="settings" />

      <main className="min-h-screen px-6 pb-8 pt-24 lg:pl-[calc(16rem+24px)]">
        <div className="mx-auto max-w-[1280px] space-y-6 relative">
          <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-medium leading-8 text-on-background">Quản lý xe</h1>
              <p className="mt-1 text-base leading-6 text-on-surface-variant">
                Theo dõi phương tiện, biển số và lịch chăm sóc xe của bạn.
              </p>
            </div>
            <Button
              className="h-11 gap-2 px-5 bg-primary text-on-primary hover:opacity-95"
              type="button"
              onClick={() => {
                resetForm()
                setIsAddOpen(true)
              }}
            >
              <Plus size={18} />
              Thêm xe
            </Button>
          </section>

          <div className="grid gap-4 md:grid-cols-3">
            {vehicleStats.map((stat) => (
              <Card className="rounded-lg p-5" key={stat.label}>
                <p className="text-sm font-medium leading-5 text-outline">{stat.label}</p>
                <p className="mt-2 text-xl font-medium leading-7 text-on-surface">{stat.value}</p>
              </Card>
            ))}
          </div>

          <section className="space-y-4">
            {isLoading ? (
              <div className="py-12 text-center text-on-surface-variant">Đang tải danh sách xe...</div>
            ) : apiVehicles.length === 0 ? (
              <Card className="border-dashed bg-surface-container-lowest p-8 text-center flex flex-col items-center gap-4">
                <Car className="size-16 text-outline-variant" strokeWidth={1} />
                <div>
                  <h3 className="text-lg font-medium text-on-surface">Bạn chưa đăng ký xe nào</h3>
                  <p className="text-sm text-on-surface-variant">Hãy thêm xe mới ngay để lên lịch và nhận dịch vụ chăm sóc tốt nhất</p>
                </div>
                <Button
                  onClick={() => setIsAddOpen(true)}
                  className="bg-primary text-on-primary hover:opacity-95"
                >
                  Thêm xe mới
                </Button>
              </Card>
            ) : (
              apiVehicles.map((vehicle) => {
                const vId = vehicle.id || (vehicle as any).vehicleId
                return (
                  <Card className="rounded-lg p-5 relative" key={vId}>
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-5">
                        <div className="grid size-16 shrink-0 place-items-center rounded-lg bg-primary-fixed text-primary">
                          <Car size={32} />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-xl font-medium leading-7 text-on-background">
                              {vehicle.brand || vehicle.vehicleType}
                            </h3>
                            {vehicle.primary ? (
                              <span className="inline-flex items-center gap-1 rounded-lg bg-tier-gold px-2.5 py-1 text-[10px] font-bold uppercase leading-4 tracking-wide text-[#2f1400]">
                                <Star className="size-3 fill-current" />
                                Mặc định
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-sm leading-5 text-on-surface-variant">
                            {vehicle.vehicleType === 'CAR' ? 'Ô tô' : 'Xe máy'} · {vehicle.color || 'Chưa rõ màu'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <Button
                          className="gap-2 border-primary text-primary hover:bg-primary/10"
                          type="button"
                          variant="outline"
                          onClick={() => handleQuickBooking(vId)}
                        >
                          <CalendarPlus size={16} />
                          Đặt lịch
                        </Button>
                        
                        <div className="relative">
                          <Button
                            aria-label="Tùy chọn xe"
                            size="icon"
                            type="button"
                            variant="ghost"
                            onClick={() => setActiveMenuVehicleId(activeMenuVehicleId === vId ? null : vId)}
                          >
                            <MoreHorizontal className="size-5 text-on-surface-variant" />
                          </Button>

                          {/* Dropdown Menu */}
                          {activeMenuVehicleId === vId && (
                            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-outline-variant shadow-xl z-20 overflow-hidden text-sm">
                              {!vehicle.primary && (
                                <button
                                  onClick={() => handleSetDefault(vId)}
                                  className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-2 text-on-surface cursor-pointer"
                                >
                                  <Check size={16} className="text-success" /> Đặt làm mặc định
                                </button>
                              )}
                              <button
                                onClick={() => openEditModal(vehicle)}
                                className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-2 text-on-surface cursor-pointer"
                              >
                                <Edit2 size={16} className="text-primary" /> Chỉnh sửa
                              </button>
                              <button
                                onClick={() => handleDeleteVehicle(vId)}
                                className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-2 text-danger cursor-pointer"
                              >
                                <Trash2 size={16} /> Xóa xe
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                  <div className="mt-5 grid gap-4 border-t border-outline-variant pt-5 sm:grid-cols-3">
                    <div>
                      <p className="text-xs font-medium uppercase leading-4 tracking-wide text-outline">Biển số</p>
                      <p className="mt-1 text-base font-medium leading-6 text-on-surface">{vehicle.licensePlate}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase leading-4 tracking-wide text-outline">Dịch vụ gần nhất</p>
                      <p className="mt-1 text-base leading-6 text-on-surface">{vehicle.lastWashService || 'Chưa thực hiện'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase leading-4 tracking-wide text-outline">Lần rửa gần nhất</p>
                      <p className="mt-1 text-base leading-6 text-on-surface">{vehicle.lastWashDate || 'Chưa thực hiện'}</p>
                    </div>
                  </div>
                </Card>
              )
            })
          )}
          </section>

          <Card className="flex flex-col gap-4 rounded-lg border-dashed p-5 sm:flex-row sm:items-center sm:justify-between bg-surface-container-lowest">
            <div className="flex items-center gap-4">
              <div className="grid size-11 place-items-center rounded-lg bg-surface-container-low text-primary">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h2 className="text-base font-medium leading-6 text-on-surface">Thiết lập xe mặc định</h2>
                <p className="text-sm leading-5 text-on-surface-variant">
                  Xe mặc định sẽ được chọn sẵn khi bạn tạo lịch rửa xe mới.
                </p>
              </div>
            </div>
          </Card>

          {/* Dialog: Thêm xe mới */}
          <AnimatePresence>
            {isAddOpen && (
              <div className='fixed inset-0 bg-slate-950/20 backdrop-blur-xs flex items-center justify-center z-50 p-4'>
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className='bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200/80 shadow-2xl space-y-4'
                >
                  <div className='flex justify-between items-center pb-2 border-b border-slate-100'>
                    <h4 className='text-xs font-bold uppercase tracking-tight text-slate-800'>
                      Đăng ký xe mới
                    </h4>
                    <button
                      onClick={() => setIsAddOpen(false)}
                      className='text-slate-450 hover:text-slate-650 text-xs font-bold cursor-pointer'
                    >
                      Đóng
                    </button>
                  </div>

                  <form onSubmit={handleAddVehicle} className='space-y-3 pt-1'>
                    <div>
                      <label className='block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1'>
                        Biển kiểm soát * (VD: 51H-123.45)
                      </label>
                      <input
                        type='text'
                        required
                        placeholder='VD: 51H-123.45'
                        value={licensePlate}
                        onChange={(e) => setLicensePlate(e.target.value)}
                        className='w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors'
                      />
                    </div>
                    <div>
                      <label className='block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1'>
                        Loại xe *
                      </label>
                      <select
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        className='w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors'
                      >
                        <option value="CAR">Ô tô</option>
                        <option value="BIKE">Xe máy</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1'>
                        Hãng xe & Dòng xe * (VD: Toyota Camry)
                      </label>
                      <input
                        type='text'
                        required
                        placeholder='VD: Toyota Camry'
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        className='w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors'
                      />
                    </div>
                    <div>
                      <label className='block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1'>
                        Màu sắc xe (VD: Trắng ngọc trai)
                      </label>
                      <input
                        type='text'
                        placeholder='VD: Đen ánh kim'
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className='w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors'
                      />
                    </div>

                    <div className='flex gap-2 pt-3'>
                      <button
                        type='button'
                        onClick={() => setIsAddOpen(false)}
                        className='flex-1 py-2 border border-slate-200 text-xs font-bold text-slate-650 rounded-xl hover:bg-slate-50 transition-colors'
                      >
                        Hủy bỏ
                      </button>
                      <button
                        type='submit'
                        className='flex-1 py-2 bg-primary text-on-primary text-xs font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-indigo-100 cursor-pointer'
                      >
                        Đăng ký xe
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Dialog: Chỉnh sửa xe */}
          <AnimatePresence>
            {isEditOpen && selectedVehicleForEdit && (
              <div className='fixed inset-0 bg-slate-950/20 backdrop-blur-xs flex items-center justify-center z-50 p-4'>
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className='bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200/80 shadow-2xl space-y-4'
                >
                  <div className='flex justify-between items-center pb-2 border-b border-slate-100'>
                    <h4 className='text-xs font-bold uppercase tracking-tight text-slate-800'>
                      Cập nhật thông tin xe
                    </h4>
                    <button
                      onClick={() => {
                        setIsEditOpen(false)
                        setSelectedVehicleForEdit(null)
                      }}
                      className='text-slate-450 hover:text-slate-650 text-xs font-bold cursor-pointer'
                    >
                      Đóng
                    </button>
                  </div>

                  <form onSubmit={handleEditVehicle} className='space-y-3 pt-1'>
                    <div>
                      <label className='block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1'>
                        Biển kiểm soát * (VD: 51H-123.45)
                      </label>
                      <input
                        type='text'
                        required
                        placeholder='VD: 51H-123.45'
                        value={licensePlate}
                        onChange={(e) => setLicensePlate(e.target.value)}
                        className='w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors'
                      />
                    </div>
                    <div>
                      <label className='block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1'>
                        Loại xe *
                      </label>
                      <select
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        className='w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors'
                      >
                        <option value="CAR">Ô tô</option>
                        <option value="BIKE">Xe máy</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1'>
                        Hãng xe & Dòng xe * (VD: Toyota Camry)
                      </label>
                      <input
                        type='text'
                        required
                        placeholder='VD: Toyota Camry'
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        className='w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors'
                      />
                    </div>
                    <div>
                      <label className='block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1'>
                        Màu sắc xe (VD: Trắng ngọc trai)
                      </label>
                      <input
                        type='text'
                        placeholder='VD: Đen ánh kim'
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className='w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors'
                      />
                    </div>

                    <div className='flex gap-2 pt-3'>
                      <button
                        type='button'
                        onClick={() => {
                          setIsEditOpen(false)
                          setSelectedVehicleForEdit(null)
                        }}
                        className='flex-1 py-2 border border-slate-200 text-xs font-bold text-slate-650 rounded-xl hover:bg-slate-50 transition-colors'
                      >
                        Hủy bỏ
                      </button>
                      <button
                        type='submit'
                        className='flex-1 py-2 bg-primary text-on-primary text-xs font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-indigo-100 cursor-pointer'
                      >
                        Lưu thay đổi
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

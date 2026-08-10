import React, { useState, useEffect } from 'react'
import { Plus, Edit3, Trash2, CheckCircle2, XCircle, Droplet, Package } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { AdminSidebar } from '@/features/admin/components/admin-sidebar'
import { AdminTopbar } from '@/features/admin/components/admin-topbar'
import { adminService } from '@/features/admin/services/admin-service'
import { formatCurrency, cn } from '@/shared/lib/utils'
import toast from 'react-hot-toast'

interface WashService {
  serviceId: string
  name: string
  description: string
  basePrice: number
  estimatedDuration: number
  active: boolean
  points: number
  combo: boolean
  bundledServiceIds?: string
}

export function AdminServicesPage() {
  const [services, setServices] = useState<WashService[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [activeTab, setActiveTab] = useState<'ALL' | 'SINGLE' | 'COMBO'>('ALL')
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<WashService | null>(null)
  
  // Form states
  const [formName, setFormName] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formPrice, setFormPrice] = useState(0)
  const [formDuration, setFormDuration] = useState(30)
  const [formPoints, setFormPoints] = useState(0)
  const [formActive, setFormActive] = useState(true)
  const [formCombo, setFormCombo] = useState(false)
  const [selectedBundledIds, setSelectedBundledIds] = useState<string[]>([])

  const fetchServices = async () => {
    setLoading(true)
    try {
      const data = await adminService.getAdminServices()
      setServices(data)
    } catch (error) {
      console.error('Lỗi khi lấy danh sách dịch vụ:', error)
      toast.error('Không thể tải danh sách dịch vụ')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const handleOpenCreateModal = () => {
    setEditingService(null)
    setFormName('')
    setFormDesc('')
    setFormPrice(0)
    setFormDuration(30)
    setFormPoints(0)
    setFormActive(true)
    setFormCombo(false)
    setSelectedBundledIds([])
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (s: WashService) => {
    setEditingService(s)
    setFormName(s.name)
    setFormDesc(s.description || '')
    setFormPrice(s.basePrice)
    setFormDuration(s.estimatedDuration)
    setFormPoints(s.points || 0)
    setFormActive(s.active)
    setFormCombo(s.combo)
    
    const bundledIds = s.bundledServiceIds ? s.bundledServiceIds.split(',').filter(Boolean) : []
    setSelectedBundledIds(bundledIds)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) {
      toast.error('Vui lòng nhập tên dịch vụ')
      return
    }

    const payload = {
      name: formName,
      description: formDesc,
      basePrice: Number(formPrice),
      estimatedDuration: Number(formDuration),
      active: formActive,
      combo: formCombo,
      bundledServiceIds: formCombo ? selectedBundledIds.join(',') : '',
      points: formPoints > 0 ? Number(formPoints) : Math.floor(Number(formPrice) / 5000)
    }

    try {
      if (editingService) {
        await adminService.updateAdminService(editingService.serviceId, payload)
        toast.success('Cập nhật dịch vụ thành công')
      } else {
        await adminService.createAdminService(payload)
        toast.success('Tạo dịch vụ mới thành công')
      }
      setIsModalOpen(false)
      fetchServices()
    } catch (error: any) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Thao tác thất bại')
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn ngưng kích hoạt dịch vụ này?')) return
    try {
      await adminService.deleteAdminService(id)
      toast.success('Đã ngưng hoạt động dịch vụ thành công')
      fetchServices()
    } catch (error) {
      console.error(error)
      toast.error('Không thể xóa dịch vụ')
    }
  }

  const toggleBundledService = (id: string) => {
    let nextIds: string[]
    if (selectedBundledIds.includes(id)) {
      nextIds = selectedBundledIds.filter(x => x !== id)
    } else {
      nextIds = [...selectedBundledIds, id]
    }
    setSelectedBundledIds(nextIds)

    // Tự động cộng dồn thời gian và giá từ việc thêm các dịch vụ đơn
    const selectedServices = services.filter(s => nextIds.includes(s.serviceId))
    const sumPrice = selectedServices.reduce((sum, s) => sum + s.basePrice, 0)
    const sumDuration = selectedServices.reduce((sum, s) => sum + s.estimatedDuration, 0)
    const sumPoints = selectedServices.reduce((sum, s) => sum + (s.points || Math.floor(s.basePrice / 5000)), 0)

    setFormPrice(sumPrice)
    setFormDuration(sumDuration)
    setFormPoints(sumPoints)
  }

  const getBundledNames = (bundledIdsStr?: string) => {
    if (!bundledIdsStr) return ''
    const ids = bundledIdsStr.split(',').filter(Boolean)
    return services
      .filter(s => ids.includes(s.serviceId))
      .map(s => s.name)
      .join(', ')
  }
  
  // Filter lists
  const filteredServices = services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchText.toLowerCase()) || 
                          (s.description && s.description.toLowerCase().includes(searchText.toLowerCase()))
    
    if (!matchesSearch) return false
    if (activeTab === 'SINGLE') return !s.combo
    if (activeTab === 'COMBO') return s.combo
    return true
  })

  // List of single services available for bundling in combo
  const availableForCombo = services.filter(s => !s.combo && s.active && (editingService ? s.serviceId !== editingService.serviceId : true))

  return (
    <div className='min-h-screen bg-background text-on-surface'>
      <AdminSidebar activeItem='services' />
      <AdminTopbar
        searchPlaceholder='Tìm kiếm dịch vụ, combo...'
        searchValue={searchText}
        onSearchChange={setSearchText}
        actions={
          <button
            onClick={handleOpenCreateModal}
            className='h-10 px-4 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-lg select-none cursor-pointer'
          >
            <Plus size={16} />
            Thêm mới
          </button>
        }
      />

      <main className='min-h-screen px-6 pb-8 pt-24 lg:pl-70'>
        <div className='mx-auto max-w-7xl space-y-6'>
          <div>
            <h2 className='text-base font-bold text-slate-900 tracking-tight mb-1 uppercase'>Quản lý Dịch vụ & Combo</h2>
            <nav className='flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider'>
              <span className='hover:text-indigo-600 cursor-pointer'>Dashboard</span>
              <span className='mx-2'>/</span>
              <span className='text-slate-800 font-bold'>Dịch vụ & Gói Combo</span>
            </nav>
          </div>

          {/* Filter Tab bar */}
          <div className='flex justify-between items-center bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex-wrap gap-4'>
            <div className='flex gap-1.5 bg-slate-100 p-1 rounded-xl'>
              <button
                onClick={() => setActiveTab('ALL')}
                className={cn(
                  'px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer select-none',
                  activeTab === 'ALL' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-850'
                )}
              >
                Tất cả ({services.length})
              </button>
              <button
                onClick={() => setActiveTab('SINGLE')}
                className={cn(
                  'px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer select-none',
                  activeTab === 'SINGLE' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-850'
                )}
              >
                Dịch vụ đơn ({services.filter(s => !s.combo).length})
              </button>
              <button
                onClick={() => setActiveTab('COMBO')}
                className={cn(
                  'px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer select-none',
                  activeTab === 'COMBO' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-850'
                )}
              >
                Gói Combo ({services.filter(s => s.combo).length})
              </button>
            </div>

            <button
              onClick={handleOpenCreateModal}
              className='bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shrink-0 cursor-pointer'
            >
              <Plus className='w-4 h-4' />
              Tạo dịch vụ / Combo
            </button>
          </div>

          {/* Table display */}
          <div className='bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs'>
            <div className='overflow-x-auto'>
              {loading ? (
                <div className='py-12 text-center text-xs font-semibold text-slate-400 animate-pulse'>Đang tải dữ liệu dịch vụ...</div>
              ) : filteredServices.length === 0 ? (
                <div className='py-16 text-center text-xs text-slate-400 font-semibold'>Không tìm thấy dịch vụ nào phù hợp.</div>
              ) : (
                <table className='w-full text-left border-collapse'>
                  <thead>
                    <tr className='bg-slate-50/75 border-b border-slate-200'>
                      <th className='px-5 py-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase'>Tên dịch vụ</th>
                      <th className='px-5 py-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase'>Mô tả</th>
                      <th className='px-5 py-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase'>Giá cơ bản</th>
                      <th className='px-5 py-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase'>Thời lượng</th>
                      <th className='px-5 py-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase'>Loại hình</th>
                      <th className='px-5 py-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase text-center'>Điểm thưởng</th>
                      <th className='px-5 py-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase text-center'>Trạng thái</th>
                      <th className='px-5 py-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase text-right'>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-slate-100'>
                    {filteredServices.map(s => {
                      const bundledNames = getBundledNames(s.bundledServiceIds)
                      return (
                        <tr key={s.serviceId} className='hover:bg-slate-50/50 transition-colors'>
                          <td className='px-5 py-4 font-bold text-xs text-slate-900'>
                            <div className='flex items-center gap-2'>
                              {s.combo ? (
                                <Package className='w-4 h-4 text-purple-600 shrink-0' />
                              ) : (
                                <Droplet className='w-4 h-4 text-indigo-600 shrink-0' />
                              )}
                              {s.name}
                            </div>
                          </td>
                          <td className='px-5 py-4 max-w-xs'>
                            <p className='text-xs text-slate-600 truncate'>{s.description || 'Chưa cập nhật'}</p>
                            {s.combo && bundledNames && (
                              <p className='text-[9px] text-purple-600 font-bold uppercase mt-1 tracking-wide'>
                                Bao gồm: {bundledNames}
                              </p>
                            )}
                          </td>
                          <td className='px-5 py-4 text-xs font-bold text-slate-800'>{formatCurrency(s.basePrice)}</td>
                          <td className='px-5 py-4 text-xs font-medium text-slate-650'>{s.estimatedDuration} phút</td>
                          <td className='px-5 py-4'>
                            {s.combo ? (
                              <span className='px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-100 uppercase tracking-wide'>Combo</span>
                            ) : (
                              <span className='px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wide'>Dịch vụ đơn</span>
                            )}
                          </td>
                          <td className='px-5 py-4 text-center text-xs font-bold text-emerald-650'>+{s.points || Math.floor(s.basePrice / 5000)} pts</td>
                          <td className='px-5 py-4 text-center'>
                            {s.active ? (
                              <span className='inline-flex items-center gap-1 text-emerald-600 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100'><CheckCircle2 className='w-3.5 h-3.5' /> Hoạt động</span>
                            ) : (
                              <span className='inline-flex items-center gap-1 text-rose-600 text-[10px] font-bold uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100'><XCircle className='w-3.5 h-3.5' /> Tạm ngưng</span>
                            )}
                          </td>
                          <td className='px-5 py-4 text-right'>
                            <div className='flex justify-end gap-1.5'>
                              <button
                                onClick={() => handleOpenEditModal(s)}
                                className='p-1.5 text-slate-400 hover:text-indigo-650 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer'
                                title='Sửa thông tin'
                              >
                                <Edit3 className='w-4 h-4' />
                              </button>
                              <button
                                onClick={() => handleDelete(s.serviceId)}
                                className='p-1.5 text-slate-400 hover:text-rose-650 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer'
                                title='Ngưng hoạt động'
                                disabled={!s.active}
                              >
                                <Trash2 className='w-4 h-4' />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Modal popup Form: Tạo/Sửa dịch vụ & combo */}
          <AnimatePresence>
            {isModalOpen && (
              <div className='fixed inset-0 bg-slate-950/20 backdrop-blur-xs flex items-center justify-center z-50 p-4'>
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className='bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto'
                >
                  <div className='flex justify-between items-center pb-2 border-b border-slate-100'>
                    <h4 className='text-xs font-bold uppercase tracking-tight text-slate-800'>
                      {editingService ? 'Cập nhật dịch vụ / Combo' : 'Tạo mới dịch vụ / Combo'}
                    </h4>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className='text-slate-450 hover:text-slate-600 text-xs font-bold cursor-pointer'
                    >
                      Đóng
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className='space-y-4 text-xs pt-1'>
                    <div>
                      <label className='block text-[10px] font-bold text-slate-455 uppercase tracking-wider mb-1'>Tên dịch vụ / Combo</label>
                      <input 
                        type='text' 
                        required
                        placeholder='VD: Combo Rửa xe & Vệ sinh nội thất' 
                        value={formName} 
                        onChange={(e) => setFormName(e.target.value)} 
                        className='w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors' 
                      />
                    </div>

                    <div>
                      <label className='block text-[10px] font-bold text-slate-455 uppercase tracking-wider mb-1'>Mô tả chi tiết</label>
                      <textarea
                        rows={2}
                        placeholder='Nhập chi tiết các bước thực hiện...' 
                        value={formDesc} 
                        onChange={(e) => setFormDesc(e.target.value)} 
                        className='w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors' 
                      />
                    </div>

                    <div className='grid grid-cols-3 gap-2.5'>
                      <div>
                        <label className='block text-[10px] font-bold text-slate-455 uppercase tracking-wider mb-1'>Giá (VND)</label>
                        <input 
                          type='number' 
                          required
                          value={formPrice} 
                          onChange={(e) => setFormPrice(Number(e.target.value))} 
                          className='w-full px-2.5 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-bold focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors' 
                        />
                      </div>
                      <div>
                        <label className='block text-[10px] font-bold text-slate-455 uppercase tracking-wider mb-1'>Thời gian (P)</label>
                        <input 
                          type='number' 
                          required
                          value={formDuration} 
                          onChange={(e) => setFormDuration(Number(e.target.value))} 
                          className='w-full px-2.5 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-bold focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors' 
                        />
                      </div>
                      <div>
                        <label className='block text-[10px] font-bold text-slate-455 uppercase tracking-wider mb-1'>Điểm thưởng</label>
                        <input 
                          type='number' 
                          value={formPoints} 
                          onChange={(e) => setFormPoints(Number(e.target.value))} 
                          className='w-full px-2.5 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-bold focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors' 
                          placeholder='Tự động'
                        />
                      </div>
                    </div>

                    <div className='flex gap-6 items-center py-1.5 border-y border-slate-100'>
                      <label className='flex items-center gap-2 font-bold text-slate-700 cursor-pointer select-none'>
                        <input 
                          type='checkbox' 
                          checked={formActive} 
                          onChange={(e) => setFormActive(e.target.checked)} 
                          className='w-4 h-4 text-indigo-650 border-slate-200 focus:ring-indigo-500 rounded'
                        />
                        Cho phép hoạt động
                      </label>

                      <label className='flex items-center gap-2 font-bold text-slate-700 cursor-pointer select-none'>
                        <input 
                          type='checkbox' 
                          checked={formCombo} 
                          onChange={(e) => setFormCombo(e.target.checked)} 
                          className='w-4 h-4 text-indigo-650 border-slate-200 focus:ring-indigo-500 rounded'
                        />
                        Đây là gói Combo
                      </label>
                    </div>

                    {formCombo && (
                      <div className='space-y-2 bg-purple-50/30 p-3.5 rounded-xl border border-purple-100'>
                        <h5 className='text-[10px] font-bold uppercase tracking-wider text-purple-700'>Liên kết các dịch vụ đơn</h5>
                        <p className='text-[9px] text-slate-450 font-semibold mb-2'>Chọn các dịch vụ đơn có sẵn để gộp vào combo này:</p>
                        
                        {availableForCombo.length === 0 ? (
                          <p className='text-[10px] text-slate-400 font-semibold italic'>Không có dịch vụ đơn khả dụng.</p>
                        ) : (
                          <div className='max-h-36 overflow-y-auto space-y-1.5 pr-1'>
                            {availableForCombo.map(s => {
                              const isChecked = selectedBundledIds.includes(s.serviceId)
                              return (
                                <label 
                                  key={s.serviceId} 
                                  className={cn(
                                    'flex items-center justify-between p-2 rounded-lg border cursor-pointer select-none transition-colors text-[11px] font-semibold',
                                    isChecked ? 'bg-purple-100/40 border-purple-200 text-purple-800' : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                                  )}
                                >
                                  <span className='flex items-center gap-1.5'>
                                    <input 
                                      type='checkbox' 
                                      checked={isChecked}
                                      onChange={() => toggleBundledService(s.serviceId)}
                                      className='w-3.5 h-3.5 text-purple-650 rounded border-slate-200'
                                    />
                                    {s.name}
                                  </span>
                                  <span className='text-xs font-bold'>{formatCurrency(s.basePrice)}</span>
                                </label>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    <div className='flex gap-2 pt-3'>
                      <button 
                        type='button' 
                        onClick={() => setIsModalOpen(false)} 
                        className='flex-1 py-2.5 border border-slate-200 text-xs font-bold text-slate-650 rounded-xl hover:bg-slate-50 transition-colors'
                      >
                        Hủy bỏ
                      </button>
                      <button 
                        type='submit' 
                        className='flex-1 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg cursor-pointer'
                      >
                        Lưu thông tin
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

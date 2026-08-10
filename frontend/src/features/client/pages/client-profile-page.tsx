import { useState, useEffect, useMemo, type ReactNode, type FormEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Camera, Edit, LogOut, Phone, Eye, EyeOff, CheckCircle, AlertCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { AnimatePresence, motion } from 'motion/react'
import { ClientSidebar } from '@/features/client/components/client-sidebar'
import { ClientTopbar } from '@/features/client/components/client-topbar'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/utils'
import type { AppDispatch, RootState } from '@/app/store'
import { logout, updateUser } from '@/features/auth/store/auth-slice'
import { clearClientState } from '@/features/client/store/client-slice'
import { authService } from '@/features/auth/services/auth-service'
import { customerService } from '@/features/client/services/customer-service'
import { useRouter } from '@/app/router'
import { routes } from '@/app/routes'

const notificationSettings = [
  {
    title: 'Nhắc lịch hẹn',
    description: 'Nhận thông báo trước giờ rửa xe 30 phút',
    enabled: true,
  },
  {
    title: 'Điểm sắp hết hạn',
    description: 'Thông báo khi điểm thưởng chuẩn bị hết hạn',
    enabled: true,
  },
  {
    title: 'Khuyến mãi mới',
    description: 'Cập nhật các chương trình ưu đãi mới nhất',
    enabled: false,
  },
  {
    title: 'Nâng tier',
    description: 'Thông báo khi bạn đủ điều kiện thăng hạng',
    enabled: true,
  },
]

function ToggleSwitch({ defaultChecked }: { defaultChecked: boolean }) {
  const [checked, setChecked] = useState(defaultChecked)

  return (
    <button
      aria-pressed={checked}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none',
        checked ? 'bg-primary' : 'bg-surface-container',
      )}
      onClick={() => setChecked((value) => !value)}
      type="button"
    >
      <span
        className={cn(
          'absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}

function SectionCard({ children, title }: { children: ReactNode; title: string }) {
  return (
    <Card className="overflow-hidden rounded-lg">
      <div className="border-b border-outline-variant bg-surface-container-low px-5 py-4">
        <h3 className="text-sm font-medium uppercase leading-4 tracking-wide text-on-surface">{title}</h3>
      </div>
      {children}
    </Card>
  )
}

function ChangePasswordSection({ customerId }: { customerId: string }) {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [toastNotification, setToastNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => {
        setToastNotification(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [toastNotification])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới và xác nhận mật khẩu không trùng khớp.')
      return
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.')
      return
    }

    setLoading(true)
    try {
      await customerService.changePassword(customerId, {
        oldPassword,
        newPassword
      })

      setToastNotification({ message: 'Đổi mật khẩu thành công!', type: 'success' })
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ.'
      setToastNotification({ message: errMsg, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SectionCard title="Đổi mật khẩu">
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-danger/10 p-3 text-sm text-danger">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium leading-4 text-outline">
              Mật khẩu cũ
            </label>
            <div className="relative">
              <Input
                type={showOld ? 'text' : 'password'}
                placeholder="Nhập mật khẩu cũ"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface cursor-pointer"
                onClick={() => setShowOld(!showOld)}
              >
                {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium leading-4 text-outline">
              Mật khẩu mới
            </label>
            <div className="relative">
              <Input
                type={showNew ? 'text' : 'password'}
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface cursor-pointer"
                onClick={() => setShowNew(!showNew)}
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium leading-4 text-outline">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <Input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Xác nhận mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface cursor-pointer"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 mt-2 cursor-pointer"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white animate-infinite" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang cập nhật...
              </span>
            ) : (
              'Cập nhật mật khẩu'
            )}
          </Button>
        </form>
      </SectionCard>

      {/* Floating Toast Notification */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg border border-outline-variant bg-surface px-4 py-3 shadow-lg transition-all duration-300 ease-in-out">
          {toastNotification.type === 'success' ? (
            <CheckCircle className="text-success size-5 shrink-0" />
          ) : (
            <AlertCircle className="text-danger size-5 shrink-0" />
          )}
          <span className="text-sm font-medium text-on-surface">{toastNotification.message}</span>
          <button
            type="button"
            className="ml-2 text-outline hover:text-on-surface cursor-pointer"
            onClick={() => setToastNotification(null)}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </>
  )
}

export function ClientProfilePage() {
  const dispatch = useDispatch<AppDispatch>()
  const { navigate } = useRouter()
  const user = useSelector((state: RootState) => state.auth.user)
  const { tier } = useSelector((state: RootState) => state.client.loyalty)

  // Edit modal states
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Robust Customer ID resolution from Redux state or JWT token
  const customerId = useMemo(() => {
    if (user?.id) return user.id
    if ((user as any).userId) return (user as any).userId
    
    // Decode JWT payload
    const token = localStorage.getItem('jwt_token')
    if (token) {
      try {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const payload = JSON.parse(window.atob(base64))
        return payload.id || payload.userId || payload.sub
      } catch (e) {
        console.error('Lỗi giải mã JWT token:', e)
      }
    }
    return null
  }, [user])

  // Sync user info from /auth/me on mount
  useEffect(() => {
    authService.getMe()
      .then((data) => {
        dispatch(updateUser({
          id: data.id || data.customerId || customerId || undefined,
          name: data.name || data.fullName || user?.name,
          fullName: data.fullName || data.name || user?.fullName || user?.name,
          phone: data.phone || user?.phone,
          email: data.email || user?.email,
          role: data.role || user?.role
        }))
      })
      .catch((err) => {
        console.error('Không thể đồng bộ thông tin khách hàng từ /auth/me:', err)
      })
  }, [dispatch, customerId])

  // Get user initials
  const initials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'KH'

  // Open edit modal helper
  const handleOpenEdit = () => {
    setFullName(user?.name || '')
    setPhone(user?.phone || '')
    setEmail(user?.email || '')
    setIsEditOpen(true)
  }

  // Handle Edit Submit
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerId) {
      toast.error('Không tìm thấy ID người dùng để cập nhật')
      return
    }
    if (!fullName || !phone || !email) {
      toast.error('Vui lòng nhập đầy đủ thông tin')
      return
    }

    setIsSaving(true)
    try {
      const updated = await authService.updateMe({
        fullName,
        phone,
        email
      })
      dispatch(updateUser({
        id: updated.id || updated.customerId || customerId,
        name: updated.name || updated.fullName || fullName,
        fullName: updated.fullName || updated.name || fullName,
        phone: updated.phone || phone,
        email: updated.email || email
      }))
      toast.success('Cập nhật hồ sơ thành công')
      setIsEditOpen(false)
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật hồ sơ'
      toast.error(errMsg)
    } finally {
      setIsSaving(false)
    }
  }

  const personalFields = [
    { label: 'Họ và tên', value: user?.name || 'Chưa cập nhật' },
    { label: 'Số điện thoại', value: user?.phone || 'Chưa cập nhật' },
    { label: 'Email', value: user?.email || 'Chưa cập nhật' },
  ]

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <ClientSidebar />
      <ClientTopbar title="Hồ sơ" utility="settings" />

      <main className="min-h-screen px-6 pb-8 pt-24 lg:pl-[calc(16rem+24px)]">
        <div className="mx-auto max-w-[1280px] space-y-6 relative">
          <Card className="flex flex-col gap-6 rounded-lg p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-6">
              <div className="relative shrink-0">
                <div className="grid size-24 place-items-center rounded-full border-4 border-surface-container bg-primary text-4xl font-bold text-primary-foreground shadow-md">
                  {initials}
                </div>
                <button
                  aria-label="Cập nhật ảnh đại diện"
                  className="absolute bottom-0 right-0 grid size-8 place-items-center rounded-full border border-outline-variant bg-surface text-primary shadow-sm"
                  type="button"
                >
                  <Camera size={16} />
                </button>
              </div>

              <div>
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-medium leading-8 text-on-background">{user?.name || 'Khách hàng'}</h1>
                  <span className="rounded-lg bg-tier-gold px-3 py-1 text-[10px] font-bold uppercase leading-4 tracking-widest text-[#2f1400]">
                    {tier} Member
                  </span>
                </div>
                <p className="flex items-center gap-2 text-base leading-6 text-on-surface-variant">
                  <Phone className="size-4 text-outline" />
                  {user?.phone || 'Chưa cập nhật'}
                </p>
              </div>
            </div>

            <Button
              onClick={handleOpenEdit}
              className="h-12 gap-3 border-primary px-6 text-primary hover:bg-primary/10 sm:self-center"
              type="button"
              variant="outline"
            >
              <Edit size={18} />
              Chỉnh sửa
            </Button>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <SectionCard title="Thông tin cá nhân">
                <div className="space-y-5 p-6">
                  {personalFields.map((field) => (
                    <div className="block" key={field.label}>
                      <span className="mb-2 block text-sm font-medium leading-4 text-outline">{field.label}</span>
                      <span className="block rounded-lg border border-outline-variant bg-background px-4 py-3 text-base leading-6 text-on-surface">
                        {field.value}
                      </span>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <ChangePasswordSection customerId={customerId || ''} />
            </div>

            <SectionCard title="Cài đặt thông báo">
              <div className="space-y-6 p-6">
                {notificationSettings.map((setting) => (
                  <div className="flex items-center justify-between gap-6" key={setting.title}>
                    <div>
                      <p className="text-base leading-6 text-on-surface">{setting.title}</p>
                      <p className="text-sm leading-5 text-outline">{setting.description}</p>
                    </div>
                    <ToggleSwitch defaultChecked={setting.enabled} />
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <div className="flex justify-end border-t border-outline-variant pt-6">
            <Button
              onClick={() => {
                dispatch(logout())
                dispatch(clearClientState())
                toast.success('Đăng xuất thành công!')
                navigate(routes.login)
              }}
              className="h-12 gap-3 border-danger px-6 text-danger hover:bg-danger/10 hover:text-danger"
              type="button"
              variant="outline"
            >
              <LogOut size={18} />
              Đăng xuất
            </Button>
          </div>

          {/* Edit Profile Modal */}
          <AnimatePresence>
            {isEditOpen && (
              <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200/80 shadow-2xl space-y-4"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-tight text-slate-800">
                      Chỉnh sửa thông tin hồ sơ
                    </h4>
                    <button
                      onClick={() => setIsEditOpen(false)}
                      className="text-slate-450 hover:text-slate-605 text-xs font-bold cursor-pointer"
                    >
                      Đóng
                    </button>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-3 pt-1">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1">
                        Số điện thoại *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                      />
                    </div>

                    <div className="flex gap-2 pt-3">
                      <button
                        type="button"
                        onClick={() => setIsEditOpen(false)}
                        className="flex-1 py-2 border border-slate-200 text-xs font-bold text-slate-650 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        Hủy bỏ
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="flex-1 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-indigo-100 cursor-pointer disabled:opacity-50"
                      >
                        {isSaving ? 'Đang lưu...' : 'Lưu thông tin'}
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

import { useState, useEffect } from 'react'
import { Sparkles, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { Link, useRouter } from '@/app/router'
import { routes } from '@/app/routes'
import { BenefitCard } from '@/features/marketing/components/benefit-card'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { authBenefits } from '@/features/marketing/data/marketing'
import { cn } from '@/shared/lib/utils'
import { authService } from '../services/auth-service'
import { authStore } from '../store/auth-store'
import type { RootState } from '@/app/store'
import { authStart, loginSuccess, registerSuccess, authFailure, clearError } from '../store/auth-slice'

type AuthPageProps = {
  mode: 'login' | 'register'
}

export function AuthPage({ mode }: AuthPageProps) {
  const isLogin = mode === 'login'
  const { navigate } = useRouter()
  const dispatch = useDispatch()

  const { isLoading, error: reduxError } = useSelector((state: RootState) => state.auth)

  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [localError, setLocalError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (authStore.isAuthenticated()) {
      const user = authStore.getUser()
      if (user?.role === 'ADMIN') {
        navigate(routes.admin)
      } else {
        navigate(routes.dashboard)
      }
    }
  }, [navigate])

  // Clear messages when mode changes
  useEffect(() => {
    setLocalError(null)
    setSuccess(null)
    dispatch(clearError())
  }, [mode, dispatch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    setSuccess(null)
    dispatch(clearError())

    if (isLogin) {
      if (!emailOrPhone.trim()) {
        setLocalError('Vui lòng nhập email hoặc số điện thoại.')
        return
      }
      if (!password) {
        setLocalError('Vui lòng nhập mật khẩu.')
        return
      }

      dispatch(authStart())
      try {
        const data = await authService.login({ emailOrPhone, password })
        const token = data.token || data.accessToken || data.jwt

        if (token) {
          const userRole = data.role || data.user?.role
          const userFullName = data.fullName || data.user?.name || data.user?.fullName
          const userPhone = data.phone || data.user?.phone || (!emailOrPhone.includes('@') ? emailOrPhone : undefined)
          const userEmail = (data as any).email || data.user?.email || (emailOrPhone.includes('@') ? emailOrPhone : undefined)
          
          let tokenUserId = undefined
          try {
            const base64Url = token.split('.')[1]
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
            const payload = JSON.parse(window.atob(base64))
            tokenUserId = payload.id || payload.userId || payload.customerId || payload.sub
          } catch (e) {
            console.error('Lỗi giải mã JWT token:', e)
          }

          const userId = (data as any).id || (data as any).userId || data.user?.id || tokenUserId || userPhone

          const loggedInUser = {
            id: userId,
            name: userFullName,
            fullName: userFullName,
            email: userEmail,
            phone: userPhone,
            role: userRole,
          }

          dispatch(loginSuccess({
            token,
            refreshToken: data.refreshToken,
            user: loggedInUser
          }))
          toast.success('Đăng nhập thành công!')
          setSuccess('Đăng nhập thành công! Đang chuyển hướng...')
          setTimeout(() => {
            if (userRole === 'ADMIN') {
              navigate(routes.admin)
            } else {
              navigate(routes.dashboard)
            }
          }, 1000)
        } else {
          throw new Error('Không nhận được token từ server')
        }
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message || 'Sai tài khoản hoặc mật khẩu.'
        dispatch(authFailure(msg))
        // toast.error is handled by interceptors if it's an Axios error, but we show localError for inline form response
        setLocalError(msg)
      }
    } else {
      if (!name.trim()) {
        setLocalError('Vui lòng nhập họ tên.')
        return
      }
      if (!email.trim()) {
        setLocalError('Vui lòng nhập email.')
        return
      }
      if (!phone.trim()) {
        setLocalError('Vui lòng nhập số điện thoại.')
        return
      }
      if (!password) {
        setLocalError('Vui lòng nhập mật khẩu.')
        return
      }
      if (password !== confirmPassword) {
        setLocalError('Xác nhận mật khẩu không khớp.')
        return
      }

      dispatch(authStart())
      try {
        await authService.register({
          name,
          email,
          phone: phone.startsWith('0') ? phone : `0${phone.replace("+84", '')}`,
          password,
        })
        dispatch(registerSuccess())
        toast.success('Đăng ký tài khoản thành công!')
        setSuccess('Đăng ký tài khoản thành công! Đang chuyển hướng sang đăng nhập...')
        setTimeout(() => {
          navigate(routes.login)
        }, 1500)
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message || 'Đăng ký thất bại.'
        dispatch(authFailure(msg))
        setLocalError(msg)
      }
    }
  }

  const displayError = localError || reduxError

  return (
    <main className="grid min-h-screen place-items-center px-6 pb-18 pt-28">
      <section className="grid w-full max-w-[900px] justify-items-center gap-6">
        <Card className="w-full max-w-[460px]">
          <CardContent className="grid justify-items-center gap-6 px-6 pb-6 pt-12">
            <div className="grid size-16 place-items-center rounded-full text-primary" aria-hidden="true">
              <Sparkles size={18} />
            </div>

            <div className="grid w-full grid-cols-2 border-b border-outline-variant" role="tablist">
              <Link
                aria-selected={isLogin}
                className={cn(
                  'border-b-2 border-transparent py-3 text-center text-base font-medium leading-6 text-on-surface-variant',
                  isLogin && 'border-primary text-primary',
                )}
                role="tab"
                to={routes.login}
              >
                Đăng nhập
              </Link>
              <Link
                aria-selected={!isLogin}
                className={cn(
                  'border-b-2 border-transparent py-3 text-center text-base font-medium leading-6 text-on-surface-variant',
                  !isLogin && 'border-primary text-primary',
                )}
                role="tab"
                to={routes.register}
              >
                Đăng ký
              </Link>
            </div>

            {displayError && (
              <div className="flex w-full items-center gap-2 rounded-lg bg-error/10 p-3 text-sm text-error">
                <AlertCircle size={16} />
                <span>{displayError}</span>
              </div>
            )}

            {success && (
              <div className="flex w-full items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success">
                <CheckCircle size={16} />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid w-full gap-4">
              {!isLogin && (
                <label className="grid gap-2 text-sm font-medium leading-4 text-on-surface-variant">
                  Họ tên
                  <Input
                    autoComplete="name"
                    placeholder="Nhập họ và tên"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </label>
              )}

              {isLogin ? (
                <label className="grid gap-2 text-sm font-medium leading-4 text-on-surface-variant">
                  Email hoặc Số điện thoại
                  <Input
                    autoComplete="username"
                    placeholder="Nhập email hoặc số điện thoại"
                    type="text"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </label>
              ) : (
                <>
                  <label className="grid gap-2 text-sm font-medium leading-4 text-on-surface-variant">
                    Email
                    <Input
                      autoComplete="email"
                      placeholder="Nhập email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium leading-4 text-on-surface-variant">
                    Số điện thoại
                    <span className="relative block">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base leading-6 text-on-surface-variant">
                        +84
                      </span>
                      <Input
                        autoComplete="tel"
                        className="pl-14"
                        placeholder="Nhập số điện thoại"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </span>
                  </label>
                </>
              )}

              <label className="grid gap-2 text-sm font-medium leading-4 text-on-surface-variant">
                Mật khẩu
                <Input
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  placeholder="Nhập mật khẩu"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </label>

              {!isLogin && (
                <label className="grid gap-2 text-sm font-medium leading-4 text-on-surface-variant">
                  Xác nhận mật khẩu
                  <Input
                    autoComplete="new-password"
                    placeholder="Nhập lại mật khẩu"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </label>
              )}

              <Button type="submit" className="h-12 w-full text-base cursor-pointer" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />
                    Đang xử lý...
                  </>
                ) : (
                  isLogin ? 'Đăng nhập' : 'Đăng ký'
                )}
              </Button>

              {isLogin && (
                <div className="flex flex-col items-center gap-2">
                  <Link className="text-sm font-medium text-primary hover:underline" to={routes.otp}>
                    Quên mật khẩu? (OTP)
                  </Link>
                  <Link className="text-base leading-6 text-primary hover:underline" to={routes.register}>
                    Đăng ký tài khoản mới
                  </Link>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        <div className="grid w-full gap-4 md:grid-cols-3">
          {authBenefits.map((benefit) => (
            <BenefitCard {...benefit} key={benefit.title} />
          ))}
        </div>
      </section>
    </main>
  )
}

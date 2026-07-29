import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { Link } from '@/app/router'
import { routes } from '@/app/routes'
import { BenefitCard } from '@/features/marketing/components/benefit-card'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { authBenefits } from '@/features/marketing/data/marketing'

export function OtpPage() {
  const [seconds, setSeconds] = useState(60)
  const otpRefs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    otpRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (seconds <= 0) {
      return
    }

    const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [seconds])

  return (
    <main className="grid min-h-screen place-items-center px-6 pb-18 pt-28">
      <section className="grid w-full max-w-[900px] justify-items-center gap-6">
        <Card className="w-full max-w-[460px]">
          <CardContent className="grid justify-items-center gap-6 px-6 pb-6 pt-12">
            <div className="grid size-16 place-items-center rounded-full text-primary" aria-hidden="true">
              <Sparkles size={18} />
            </div>

            <div className="grid gap-2 text-center">
              <h1 className="text-xl font-medium leading-7 text-primary">Xác thực OTP</h1>
              <p className="text-sm leading-5 text-on-surface-variant">
                Mã xác thực đã được gửi đến số điện thoại của bạn.
              </p>
            </div>

            <div className="flex justify-center gap-2" aria-label="Nhập mã OTP">
              {Array.from({ length: 6 }).map((_, index) => (
                <input
                  className="size-12 rounded-lg border border-outline-variant bg-surface text-center text-xl font-medium leading-7 text-on-surface outline-none transition-[border-color,box-shadow] focus:border-primary focus:ring-2 focus:ring-primary/15 max-[420px]:size-10"
                  inputMode="numeric"
                  key={index}
                  maxLength={1}
                  ref={(node) => {
                    otpRefs.current[index] = node
                  }}
                  onChange={(event) => {
                    event.currentTarget.value = event.currentTarget.value.replace(/\D/g, '')
                    if (event.currentTarget.value && index < 5) {
                      otpRefs.current[index + 1]?.focus()
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Backspace' && !event.currentTarget.value && index > 0) {
                      otpRefs.current[index - 1]?.focus()
                    }
                  }}
                />
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-sm leading-5 text-on-surface-variant">
              <span>Gửi lại sau</span>
              <strong className="font-medium text-primary">{seconds > 0 ? `${seconds}s` : ''}</strong>
              <button
                className="text-primary disabled:cursor-not-allowed disabled:opacity-50 enabled:hover:underline"
                disabled={seconds > 0}
                type="button"
                onClick={() => setSeconds(60)}
              >
                Gửi lại
              </button>
            </div>

            <Button asChild className="h-12 w-full text-base" size="lg">
              <Link to={routes.dashboard}>Xác nhận</Link>
            </Button>

            <Button asChild className="gap-2 text-on-surface-variant" size="sm" variant="ghost">
              <Link to={routes.login}>
                <ArrowLeft aria-hidden="true" size={18} />
                Quay lại
              </Link>
            </Button>
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

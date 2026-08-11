import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronRight, ChevronLeft, X, HelpCircle } from 'lucide-react'
import { Button } from './button'

export type TourStep = {
  selector: string
  title: string
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
}

const DASHBOARD_STEPS: TourStep[] = [
  {
    selector: '[data-tour="membership-card"]',
    title: 'Thẻ Thành Viên của Bạn 💳',
    content: 'Tại đây bạn có thể theo dõi hạng thẻ (Thành viên, Bạc, Vàng, Kim cương) và số điểm tích lũy hiện có của mình.',
    position: 'bottom',
  },
  {
    selector: '[data-tour="quick-actions"]',
    title: 'Thao Tác Nhanh ⚡',
    content: 'Đặt lịch rửa xe cực nhanh, quản lý danh sách xe của bạn hoặc cập nhật thông tin cá nhân chỉ với 1 click.',
    position: 'bottom',
  },
  {
    selector: '[data-tour="upcoming-appointment"]',
    title: 'Lịch Hẹn Rửa Xe 📅',
    content: 'Theo dõi các lịch hẹn rửa xe sắp tới của bạn cùng với trạng thái xử lý thực tế.',
    position: 'top',
  },
]

export function UserTour() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null)
  
  // Check if user is on dashboard
  const isDashboard = window.location.pathname === '/dashboard'
  const steps = DASHBOARD_STEPS

  useEffect(() => {
    if (!isDashboard) {
      setIsOpen(false)
      return
    }

    const hasCompleted = localStorage.getItem('smartwash_tour_completed')
    if (!hasCompleted) {
      // Small delay to ensure page elements are fully rendered
      const timer = setTimeout(() => {
        setIsOpen(true)
        setCurrentStep(0)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isDashboard])

  // Update highlighted element's coordinates
  useEffect(() => {
    if (!isOpen || !steps[currentStep]) return

    const updateCoords = () => {
      const step = steps[currentStep]
      const element = document.querySelector(step.selector)

      if (element) {
        // Scroll into view if needed
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        
        // Wait a bit for scroll animation to settle
        setTimeout(() => {
          const finalRect = element.getBoundingClientRect()
          setCoords({
            top: finalRect.top + window.scrollY,
            left: finalRect.left + window.scrollX,
            width: finalRect.width,
            height: finalRect.height,
          })
        }, 300)
      } else {
        // Fallback to center if element not found
        setCoords(null)
      }
    }

    updateCoords()
    window.addEventListener('resize', updateCoords)
    window.addEventListener('scroll', updateCoords)

    return () => {
      window.removeEventListener('resize', updateCoords)
      window.removeEventListener('scroll', updateCoords)
    }
  }, [isOpen, currentStep, steps])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = () => {
    setIsOpen(false)
    localStorage.setItem('smartwash_tour_completed', 'true')
  }

  const handleRestartTour = () => {
    setIsOpen(true)
    setCurrentStep(0)
  }

  if (!isDashboard) return null

  // If tour is completed, show a small help button to restart the tour anytime
  if (!isOpen) {
    return (
      <button
        onClick={handleRestartTour}
        className="fixed bottom-6 right-6 z-40 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
        title="Hướng dẫn sử dụng"
      >
        <HelpCircle size={24} />
      </button>
    )
  }

  const stepInfo = steps[currentStep]
  const position = stepInfo?.position || 'bottom'

  // Calculate Tooltip Position
  const getTooltipStyle = () => {
    if (!coords) {
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 50,
      }
    }

    const gap = 16
    const style: React.CSSProperties = {
      position: 'absolute',
      zIndex: 50,
    }

    if (position === 'bottom') {
      style.top = coords.top + coords.height + gap
      style.left = coords.left + coords.width / 2 - 175 // Tooltip width is 350px
    } else if (position === 'top') {
      style.top = coords.top - gap - 200 // Assumed height
      style.left = coords.left + coords.width / 2 - 175
    } else if (position === 'left') {
      style.top = coords.top + coords.height / 2 - 100
      style.left = coords.left - gap - 350
    } else if (position === 'right') {
      style.top = coords.top + coords.height / 2 - 100
      style.left = coords.left + coords.width + gap
    }

    // Keep within window bounds
    if (typeof style.left === 'number') {
      style.left = Math.max(16, Math.min(window.innerWidth - 366, style.left))
    }
    if (typeof style.top === 'number') {
      style.top = Math.max(16, style.top)
    }

    return style
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* SVG Overlay Mask to highlight the element */}
      <svg className="absolute inset-0 size-full pointer-events-auto">
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {coords && (
              <rect
                x={coords.left - 8}
                y={coords.top - 8}
                width={coords.width + 16}
                height={coords.height + 16}
                rx={12}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.6)"
          mask="url(#tour-mask)"
        />
      </svg>

      {/* Tooltip Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          style={getTooltipStyle()}
          className="w-[350px] rounded-2xl border border-border bg-card p-5 shadow-2xl pointer-events-auto"
        >
          <div className="flex items-start justify-between gap-4">
            <h4 className="text-base font-bold text-card-foreground leading-6">
              {stepInfo.title}
            </h4>
            <button
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <p className="mt-2 text-sm leading-5 text-muted-foreground">
            {stepInfo.content}
          </p>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <span
                  key={index}
                  className={`size-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-primary' : 'bg-border'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="h-8 px-3"
              >
                <ChevronLeft size={16} className="mr-1" /> Trước
              </Button>
              <Button
                size="sm"
                onClick={handleNext}
                className="h-8 px-3"
              >
                {currentStep === steps.length - 1 ? 'Hoàn thành' : 'Tiếp theo'}{' '}
                <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

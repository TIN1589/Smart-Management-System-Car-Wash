import { Link } from '@/app/router'
import { routes } from '@/app/routes'
import { Button } from '@/shared/components/ui/button'
import { ChevronRight, Droplets, Sparkles, Star } from 'lucide-react'
import heroImg from '@/shared/assets/ultra-wash.png'
import { servicesData } from '@/shared/data/mockData'
import { SiteFooter } from '@/shared/components/layout/site-footer'
import quickCarImg from '@/shared/assets/banner-side.png'
// Mock Hooks
function useGetStats() {
  return {
    data: {
      totalCarsWashed: 12500,
      customerSatisfaction: 99,
      totalLocations: 3,
      yearsInBusiness: 5
    },
    isLoading: false
  }
}

function useGetFeaturedServices() {
  return {
    data: servicesData,
    isLoading: false
  }
}

function useListTestimonials() {
  return {
    data: [
      {
        id: 't1',
        customerName: 'Anh Tuấn',
        customerVehicle: 'Mercedes C200',
        content: 'Dịch vụ rửa xe rất chuyên nghiệp, phòng chờ VIP thoải mái, nhân viên phục vụ tận tình.',
        rating: 5
      },
      {
        id: 't2',
        customerName: 'Chị Mai',
        customerVehicle: 'VinFast VF8',
        content: 'Đặt lịch trước qua web vô cùng tiện lợi, không phải xếp hàng chờ đợi lâu. Rất hài lòng.',
        rating: 5
      },
      {
        id: 't3',
        customerName: 'Anh Hoàng',
        customerVehicle: 'Honda Civic',
        content: 'Giá cả hợp lý, chất lượng rửa sạch sâu. Sẽ tiếp tục ủng hộ chi nhánh Bình Thạnh.',
        rating: 5
      }
    ],
    isLoading: false
  }
}

// Inline Helper Components
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
}

interface Service {
  id: string
  name: string
  description: string
  price: number
  points: number
}

function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full">
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">{service.name}</h3>
        <p className="text-slate-600 text-sm mb-4 leading-relaxed">{service.description}</p>
      </div>
      <div>
        <div className="flex justify-between items-baseline mb-4">
          <span className="text-2xl font-extrabold text-primary">
            {service.price.toLocaleString('vi-VN')}đ
          </span>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">
            +{service.points} điểm
          </span>
        </div>
        <Link to={routes.booking}>
          <Button className="w-full rounded-xl font-semibold">Đặt lịch ngay</Button>
        </Link>
      </div>
    </div>
  )
}

interface Testimonial {
  id: string
  customerName: string
  customerVehicle: string
  content: string
  rating: number
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex gap-1 mb-4">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-slate-300 text-sm italic mb-4">"{testimonial.content}"</p>
      <div>
        <h4 className="font-bold text-white text-sm">{testimonial.customerName}</h4>
        <p className="text-xs text-slate-400">{testimonial.customerVehicle}</p>
      </div>
    </div>
  )
}

export function HomePage() {
  const { data: featuredServices, isLoading: isLoadingServices } = useGetFeaturedServices()
  const { data: stats, isLoading: isLoadingStats } = useGetStats()
  const { data: testimonials, isLoading: isLoadingTestimonials } = useListTestimonials()

  return (
    <div className="flex flex-col min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImg} 
            alt="Premium Car Wash" 
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to gradient if image not generated yet
              e.currentTarget.style.display = 'none'
              e.currentTarget.parentElement!.classList.add('bg-gradient-to-br', 'from-slate-900', 'via-primary', 'to-slate-900')
            }}
          />
          <div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
        </div>

        <div className="container relative z-10 px-4 md:px-6 text-center md:text-left flex flex-col md:items-start items-center">
          <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium text-white backdrop-blur-md mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="mr-2 h-4 w-4 text-accent" />
            Trung tâm chăm sóc xe cao cấp TP.HCM
          </div>
          
          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl font-display mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            Trả lại vẻ đẹp <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">nguyên bản</span> cho xế yêu
          </h1>
          
          <p className="max-w-xl text-lg text-slate-200 md:text-xl mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            Trải nghiệm dịch vụ rửa xe và chăm sóc chuyên nghiệp chuẩn detailing. Công nghệ hiện đại, dung dịch cao cấp, đội ngũ tận tâm.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 w-full md:w-auto">
            <Link to={routes.booking}>
              <Button size="lg" className="rounded-full h-14 px-8 text-lg font-bold w-full sm:w-auto shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all cursor-pointer">
                Đặt lịch ngay
              </Button>
            </Link>
            <Link to={routes.login}>
              <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-lg font-bold bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm w-full sm:w-auto transition-all cursor-pointer">
                Đăng nhập
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b border-slate-100 relative z-20 -mt-8 mx-4 md:mx-auto max-w-6xl rounded-2xl shadow-xl">
        <div className="px-6 md:px-12">
          {isLoadingStats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x-0 md:divide-x divide-slate-100">
              <div className="flex flex-col items-center text-center px-4">
                <span className="text-4xl md:text-5xl font-extrabold text-primary font-display mb-2">{stats?.totalCarsWashed.toLocaleString('vi-VN')}+</span>
                <span className="text-sm text-slate-500 font-medium uppercase tracking-wide">Xe đã phục vụ</span>
              </div>
              <div className="flex flex-col items-center text-center px-4">
                <span className="text-4xl md:text-5xl font-extrabold text-primary font-display mb-2">{stats?.customerSatisfaction}%</span>
                <span className="text-sm text-slate-500 font-medium uppercase tracking-wide">Hài lòng</span>
              </div>
              <div className="flex flex-col items-center text-center px-4">
                <span className="text-4xl md:text-5xl font-extrabold text-primary font-display mb-2">{stats?.totalLocations}</span>
                <span className="text-sm text-slate-500 font-medium uppercase tracking-wide">Chi nhánh</span>
              </div>
              <div className="flex flex-col items-center text-center px-4">
                <span className="text-4xl md:text-5xl font-extrabold text-primary font-display mb-2">{stats?.yearsInBusiness}</span>
                <span className="text-sm text-slate-500 font-medium uppercase tracking-wide">Năm kinh nghiệm</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-24 bg-slate-50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center text-center mb-16">
            <span className="text-primary font-bold tracking-wider uppercase text-sm mb-3">Dịch vụ nổi bật</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 font-display mb-4">
              Chăm Sóc Xe Chuyên Nghiệp
            </h2>
            <p className="text-slate-600 max-w-2xl text-lg">
              Các gói dịch vụ được khách hàng AutoWash® tin dùng nhất để bảo vệ và duy trì vẻ đẹp cho xe.
            </p>
          </div>

          {isLoadingServices ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-[500px] w-full rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredServices?.slice(0, 3).map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link to={routes.booking}>
              <Button variant="outline" size="lg" className="rounded-full border-primary text-primary hover:bg-primary hover:text-white font-bold px-8 cursor-pointer">
                Xem tất cả dịch vụ <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-white">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="w-full md:w-1/2">
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl bg-slate-100">
                {/* Fallback pattern if image is missing */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-slate-100 to-slate-100 flex items-center justify-center">
                   <Droplets className="h-32 w-32 text-primary/20" />
                </div>
                <img src={quickCarImg} alt="Quick Car Wash" className="absolute inset-0 object-cover w-full h-full opacity-80" onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.parentElement!.classList.add('bg-gradient-to-br', 'from-slate-900', 'via-primary', 'to-slate-900')
                }} />
                {/* This could be another image, using a gradient for now */}
              </div>
            </div>
            
            <div className="w-full md:w-1/2 space-y-8">
              <div>
                <span className="text-primary font-bold tracking-wider uppercase text-sm mb-3 block">Quy trình</span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 font-display mb-4">
                  Trải Nghiệm Nhanh Chóng & Dễ Dàng
                </h2>
                <p className="text-slate-600 text-lg">
                  Chúng tôi tối ưu hóa quy trình để bạn không phải chờ đợi lâu, nhưng vẫn đảm bảo chất lượng hoàn hảo nhất.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-xl">1</div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Đặt Lịch Online</h3>
                    <p className="text-slate-600">Chọn dịch vụ, địa điểm và thời gian qua website. Chức năng đặt lịch siêu tốc trong 30 giây.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-xl">2</div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Giao Xe & Thư Giãn</h3>
                    <p className="text-slate-600">Mang xe đến đúng giờ. Nghỉ ngơi tại phòng chờ VIP với máy lạnh, wifi và thức uống miễn phí.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/20 text-secondary font-bold text-xl">3</div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Nhận Xe Hoàn Hảo</h3>
                    <p className="text-slate-600">Xe của bạn sẽ sạch bóng như mới. Thanh toán linh hoạt và lái xe về với sự hài lòng tuyệt đối.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-50"></div>
        
        <div className="container relative z-10 px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white font-display mb-4">
              Khách Hàng Nói Gì Về AutoWash®
            </h2>
            <div className="flex gap-1 mb-4">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            </div>
            <p className="text-slate-300 max-w-2xl text-lg">
              Đánh giá trung bình {stats?.customerSatisfaction}% từ {stats?.totalCarsWashed.toLocaleString('vi-VN')} khách hàng
            </p>
          </div>

          {isLoadingTestimonials ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-64 w-full bg-slate-800" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials?.slice(0, 3).map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Locations CTA */}
      {/* <section className="py-24 bg-slate-50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-primary font-bold tracking-wider uppercase text-sm mb-3 block">Hệ Thống</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 font-display">
                Hệ Thống Chi Nhánh
              </h2>
            </div>
            <Link to={routes.booking} className="hidden md:flex text-primary font-bold items-center hover:underline">
              Xem bản đồ <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {isLoadingLocations ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 w-full" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {locations?.map((location) => (
                <LocationCard key={location.id} location={location} />
              ))}
            </div>
          )}
          
          <div className="mt-8 text-center md:hidden">
            <Link to={routes.booking}>
              <Button variant="outline" className="w-full">
                Xem tất cả chi nhánh
              </Button>
            </Link>
          </div>
        </div>
      </section> */}

      {/* Final CTA */}
      <section className="py-20 bg-primary">
        <div className="container px-4 md:px-6 text-center mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white font-display mb-6">
            Đã Đến Lúc Chăm Sóc Xế Yêu Của Bạn
          </h2>
          <p className="text-primary-foreground/80 text-xl mb-10 max-w-2xl mx-auto">
            Đặt lịch ngay hôm nay để nhận ưu đãi đặc biệt. Chúng tôi cam kết mang lại sự hài lòng tuyệt đối.
          </p>
          <Link to={routes.booking}>
            <Button size="lg" className="rounded-full h-16 px-10 text-xl font-bold bg-white text-primary hover:bg-slate-100 shadow-xl transition-transform hover:scale-105 cursor-pointer">
              Đặt Lịch AutoWash Ngay
            </Button>
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}

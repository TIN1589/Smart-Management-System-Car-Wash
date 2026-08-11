import { Mail, MapPin, Phone } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { SiteFooter } from '@/shared/components/layout/site-footer'

// Mock Hook
// function useListLocations() {
//   return {
//     data: [
//       {
//         id: 'l1',
//         name: 'Chi nhánh Quận 1',
//         address: '123 Lê Lợi, Phường Bến Thành, Quận 1, TP.HCM',
//         phone: '028 3829 1234'
//       },
//       {
//         id: 'l2',
//         name: 'Chi nhánh Quận 7',
//         address: '456 Nguyễn Thị Thập, Phường Tân Phong, Quận 7, TP.HCM',
//         phone: '028 3775 5678'
//       },
//       {
//         id: 'l3',
//         name: 'Chi nhánh Bình Thạnh',
//         address: '789 Điện Biên Phủ, Phường 25, Quận Bình Thạnh, TP.HCM',
//         phone: '028 3512 9012'
//       }
//     ],
//     isLoading: false
//   }
// }

// Helper Components
// function Skeleton({ className }: { className?: string }) {
//   return <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
// }

// interface Location {
//   id: string
//   name: string
//   address: string
//   phone: string
// }

// function LocationCard({ location }: { location: Location }) {
//   return (
//     <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all">
//       <h3 className="text-lg font-bold text-slate-900 mb-2">{location.name}</h3>
//       <p className="text-slate-600 text-sm mb-4 leading-relaxed">{location.address}</p>
//       <p className="text-xs font-semibold text-primary">{location.phone}</p>
//     </div>
//   )
// }

export function ContactPage() {
  // const { data: locations, isLoading } = useListLocations()

  return (
    <div className="min-h-screen bg-slate-50 pt-16 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="bg-slate-900 text-white py-16 md:py-24">
          <div className="container px-4 md:px-6 text-center mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold font-display mb-6">
              Liên Hệ & Hệ Thống Chi Nhánh
            </h1>
            <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto">
              AutoWash® luôn sẵn sàng lắng nghe và phục vụ. Tìm chi nhánh gần bạn nhất hoặc liên hệ hotline để được hỗ trợ 24/7.
            </p>
          </div>
        </div>

        <div className="container px-4 md:px-6 -mt-8 relative z-10 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <Card className="shadow-lg border-0 bg-white">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Phone className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-display text-slate-900 mb-2">Hotline 24/7</h3>
                <p className="text-slate-500 mb-4">Gọi ngay để đặt lịch hoặc giải đáp thắc mắc</p>
                <a href="tel:19001234" className="text-3xl font-extrabold text-primary">1900 1234</a>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                  <Mail className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold font-display text-slate-900 mb-2">Email</h3>
                <p className="text-slate-500 mb-4">Gửi email cho chúng tôi để nhận báo giá sỉ</p>
                <a href="mailto:cskh@autowash.vn" className="text-2xl font-bold text-slate-700">cskh@autowash.vn</a>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
                  <MapPin className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-bold font-display text-slate-900 mb-2">Trụ Sở Chính</h3>
                <p className="text-slate-500 mb-4">Đến trực tiếp văn phòng để hợp tác nhượng quyền</p>
                <p className="text-lg font-bold text-slate-700">123 Nguyễn Văn Linh, Q.7</p>
              </CardContent>
            </Card>
          </div>

          {/* <div className="mb-12">
            <h2 className="text-3xl font-extrabold font-display text-slate-900 mb-2">Hệ Thống Chi Nhánh</h2>
            <p className="text-slate-600">Với {locations?.length || 0} trung tâm phủ khắp TP.HCM, AutoWash® luôn ở gần bạn.</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-48 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
              {locations?.map((location) => (
                <LocationCard key={location.id} location={location} />
              ))}
            </div>
          )} */}
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}

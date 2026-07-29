import { authorizeAxios } from '@/shared/lib/api-client'

export interface CreateBookingRequest {
  vehicleId: string
  scheduledAt: string // ISO string or LocalDateTime format (yyyy-MM-ddTHH:mm:ss)
  serviceIds?: string[]
  notes?: string
  promoId?: string
  usedPoints?: number
}

export interface BookingResponse {
  id: string
  vehicleId: string
  licensePlate?: string
  vehicleDetails?: {
    licensePlate: string
    brand?: string
    color?: string
  }
  scheduledAt: string
  serviceType: string
  notes?: string
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'
  branchName?: string
  amount?: number
  promoId?: string
  promoName?: string
  discountAmount?: number
  usedPoints?: number
  pointsDiscountAmount?: number
}

export interface AvailabilitySlotResponse {
  time: string
  available: boolean
}

export interface WashService {
  serviceId: string
  name: string
  description: string
  basePrice: number
  estimatedDuration: number
  isActive: boolean
}

export const bookingService = {
  async getBookings(): Promise<BookingResponse[]> {
    const { data } = await authorizeAxios.get<any[]>('/bookings')
    return data.map(b => ({
      ...b,
      id: b.bookingId || b.id
    }))
  },

  async createBooking(payload: CreateBookingRequest): Promise<BookingResponse> {
    const { data } = await authorizeAxios.post<any>('/bookings', payload)
    return {
      ...data,
      id: data.bookingId || data.id
    }
  },

  async getBookingDetail(bookingId: string): Promise<BookingResponse> {
    const { data } = await authorizeAxios.get<BookingResponse>(`/bookings/${bookingId}`)
    return data
  },

  async cancelBooking(bookingId: string): Promise<BookingResponse> {
    const { data } = await authorizeAxios.patch<BookingResponse>(`/bookings/${bookingId}/cancel`)
    return data
  },

  async getAvailability(date: string): Promise<AvailabilitySlotResponse[]> {
    const { data } = await authorizeAxios.get<AvailabilitySlotResponse[]>('/bookings/availability', {
      params: { date },
    })
    return data
  },

  async getServices(): Promise<WashService[]> {
    const { data } = await authorizeAxios.get<WashService[]>('/services')
    return data
  },
}

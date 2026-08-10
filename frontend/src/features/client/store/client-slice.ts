import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { loyaltyService, type PointBalanceResponse } from '../services/loyalty-service'
import { vehicleService, type VehicleResponse } from '../services/vehicle-service'
import { bookingService, type BookingResponse } from '@/features/booking/services/booking-service'

interface ClientState {
  loyalty: {
    balance: number
    tier: string
    nextTierPoints: number
    totalVisits: number
    remainingVisits: number
    silverThreshold: number
    goldThreshold: number
    platinumThreshold: number
    isLoading: boolean
    error: string | null
  }
  vehicles: {
    items: VehicleResponse[]
    isLoading: boolean
    error: string | null
  }
  bookings: {
    items: BookingResponse[]
    isLoading: boolean
    error: string | null
  }
}

const initialState: ClientState = {
  loyalty: {
    balance: 0,
    tier: 'Regular',
    nextTierPoints: 0,
    totalVisits: 0,
    remainingVisits: 0,
    silverThreshold: 10,
    goldThreshold: 25,
    platinumThreshold: 50,
    isLoading: false,
    error: null,
  },
  vehicles: {
    items: [],
    isLoading: false,
    error: null,
  },
  bookings: {
    items: [],
    isLoading: false,
    error: null,
  },
}

export const fetchLoyaltyBalance = createAsyncThunk(
  'client/fetchLoyaltyBalance',
  async (customerId: string, { rejectWithValue }) => {
    try {
      const data = await loyaltyService.getLoyaltyBalance(customerId)
      return data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể lấy thông tin điểm thưởng')
    }
  }
)

export const fetchVehicles = createAsyncThunk(
  'client/fetchVehicles',
  async (_, { rejectWithValue }) => {
    try {
      const data = await vehicleService.getVehicles()
      return data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể lấy danh sách xe')
    }
  }
)

export const fetchBookings = createAsyncThunk(
  'client/fetchBookings',
  async (_, { rejectWithValue }) => {
    try {
      const data = await bookingService.getBookings()
      return data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể lấy danh sách đặt lịch')
    }
  }
)

const clientSlice = createSlice({
  name: 'client',
  initialState,
  reducers: {
    clearClientState(state) {
      state.loyalty = initialState.loyalty
      state.vehicles = initialState.vehicles
      state.bookings = initialState.bookings
    },
  },
  extraReducers: (builder) => {
    // Loyalty Balance
    builder
      .addCase(fetchLoyaltyBalance.pending, (state) => {
        state.loyalty.isLoading = true
        state.loyalty.error = null
      })
      .addCase(fetchLoyaltyBalance.fulfilled, (state, action: PayloadAction<PointBalanceResponse>) => {
        state.loyalty.isLoading = false
        state.loyalty.balance = action.payload.balance !== undefined ? action.payload.balance : (action.payload.currentPoints ?? 0)
        state.loyalty.tier = action.payload.tier || 'Regular'
        state.loyalty.nextTierPoints = action.payload.nextTierPoints || 0
        state.loyalty.totalVisits = action.payload.totalVisits ?? 0
        state.loyalty.remainingVisits = action.payload.remainingVisits ?? 0
        state.loyalty.silverThreshold = action.payload.silverThreshold ?? 10
        state.loyalty.goldThreshold = action.payload.goldThreshold ?? 25
        state.loyalty.platinumThreshold = action.payload.platinumThreshold ?? 50
      })
      .addCase(fetchLoyaltyBalance.rejected, (state, action) => {
        state.loyalty.isLoading = false
        state.loyalty.error = action.payload as string
      })

    // Vehicles
    builder
      .addCase(fetchVehicles.pending, (state) => {
        state.vehicles.isLoading = true
        state.vehicles.error = null
      })
      .addCase(fetchVehicles.fulfilled, (state, action: PayloadAction<VehicleResponse[]>) => {
        state.vehicles.isLoading = false
        state.vehicles.items = action.payload
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.vehicles.isLoading = false
        state.vehicles.error = action.payload as string
      })

    // Bookings
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.bookings.isLoading = true
        state.bookings.error = null
      })
      .addCase(fetchBookings.fulfilled, (state, action: PayloadAction<BookingResponse[]>) => {
        state.bookings.isLoading = false
        state.bookings.items = action.payload
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.bookings.isLoading = false
        state.bookings.error = action.payload as string
      })
  },
})

export const { clearClientState } = clientSlice.actions
export default clientSlice.reducer

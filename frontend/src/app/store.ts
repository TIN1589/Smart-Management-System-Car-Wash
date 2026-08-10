import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@/features/auth/store/auth-slice'
import clientReducer from '@/features/client/store/client-slice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    client: clientReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store

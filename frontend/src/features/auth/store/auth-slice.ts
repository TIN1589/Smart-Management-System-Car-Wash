import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import { authStore } from './auth-store'

export interface User {
  id?: string
  name?: string
  fullName?: string
  email?: string
  phone?: string
  role?: string
}

interface AuthState {
  token: string | null
  refreshToken: string | null
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

const getInitialToken = (): string | null => {
  return authStore.getToken()
}

const getInitialRefreshToken = (): string | null => {
  return authStore.getRefreshToken()
}

const getInitialUser = (): User | null => {
  return authStore.getUser()
}

const initialState: AuthState = {
  token: getInitialToken(),
  refreshToken: getInitialRefreshToken(),
  user: getInitialUser(),
  isAuthenticated: !!getInitialToken(),
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart(state) {
      state.isLoading = true
      state.error = null
    },
    loginSuccess(state, action: PayloadAction<{ token: string; refreshToken?: string; user?: User }>) {
      state.isLoading = false
      state.token = action.payload.token
      state.refreshToken = action.payload.refreshToken || null
      state.isAuthenticated = true
      state.error = null

      authStore.saveToken(action.payload.token)
      if (action.payload.refreshToken) {
        authStore.saveRefreshToken(action.payload.refreshToken)
      }
      
      const user = action.payload.user || null
      state.user = user
      if (user) {
        authStore.saveUser(user)
      }
    },
    registerSuccess(state) {
      state.isLoading = false
      state.error = null
    },
    authFailure(state, action: PayloadAction<string>) {
      state.isLoading = false
      state.error = action.payload
    },
    logout(state) {
      state.token = null
      state.refreshToken = null
      state.user = null
      state.isAuthenticated = false
      state.isLoading = false
      state.error = null

      authStore.clear()
    },
    updateUser(state, action: PayloadAction<User>) {
      state.user = {
        ...state.user,
        ...action.payload,
      }
      if (state.user) {
        authStore.saveUser(state.user)
      }
    },
    clearError(state) {
      state.error = null
    }
  },
})

export const {
  authStart,
  loginSuccess,
  registerSuccess,
  authFailure,
  logout,
  updateUser,
  clearError
} = authSlice.actions

export default authSlice.reducer

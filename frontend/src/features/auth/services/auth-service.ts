import { authorizeAxios } from '@/shared/lib/api-client'

export interface RegisterPayload {
  name: string
  email: string
  phone: string
  password?: string
}

export interface LoginPayload {
  emailOrPhone: string
  password?: string
}

export interface AuthResponse {
  token?: string
  accessToken?: string
  jwt?: string
  refreshToken?: string
  role?: string
  fullName?: string
  phone?: string
  email?: string
  id?: string
  tier?: string
  user?: {
    id?: string
    name?: string
    fullName?: string
    email?: string
    phone?: string
    role?: string
  }
}

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await authorizeAxios.post<AuthResponse>('/auth/register', {
      name: payload.name,
      fullName: payload.name,
      email: payload.email,
      phone: payload.phone,
      password: payload.password,
    })
    return data
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await authorizeAxios.post<AuthResponse>('/auth/login', {
      emailOrPhone: payload.emailOrPhone,
      password: payload.password,
    })
    return data
  },

  async getMe(): Promise<{ id?: string; customerId?: string; name?: string; fullName?: string; email?: string; phone?: string; role?: string }> {
    const { data } = await authorizeAxios.get<{ id?: string; customerId?: string; name?: string; fullName?: string; email?: string; phone?: string; role?: string }>('/auth/me')
    return data
  },

  async updateMe(payload: { fullName: string; phone: string; email: string }): Promise<{ id?: string; customerId?: string; name?: string; fullName?: string; email?: string; phone?: string; role?: string }> {
    const { data } = await authorizeAxios.put<{ id?: string; customerId?: string; name?: string; fullName?: string; email?: string; phone?: string; role?: string }>('/auth/me', payload)
    return data
  },
}

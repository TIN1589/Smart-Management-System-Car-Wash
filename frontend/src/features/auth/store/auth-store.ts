const TOKEN_KEY = 'jwt_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'auth_user'

export interface User {
  id?: string
  name?: string
  fullName?: string
  email?: string
  phone?: string
  role?: string
}

export function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    return null
  }
}

export const authStore = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },
  saveToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token)
  },
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },
  saveRefreshToken(refreshToken: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  },
  getUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY)
    if (!userStr) return null
    try {
      const user = JSON.parse(userStr)
      const token = this.getToken()
      // If user.id is a phone number (e.g., only digits or starting with +84), correct it using the token
      if (token && user && user.id && (user.id.startsWith('0') || user.id.startsWith('+84') || /^\d+$/.test(user.id))) {
        try {
          const base64Url = token.split('.')[1]
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
          const payload = JSON.parse(window.atob(base64))
          const realId = payload.id || payload.userId || payload.customerId || payload.sub
          if (realId) {
            user.id = realId
            localStorage.setItem(USER_KEY, JSON.stringify(user))
          }
        } catch (e) {
          console.error('Error correcting stored user ID:', e)
        }
      }
      return user
    } catch {
      return null
    }
  },
  saveUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  isAuthenticated(): boolean {
    return !!this.getToken()
  },
  clear(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
  logout(): void {
    this.clear()
    window.location.href = '/login'
  }
}

import axios from 'axios'
import toast from 'react-hot-toast'
import { authStore } from '@/features/auth/store/auth-store'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

export const authorizeAxios = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Attach JWT Token if exists
authorizeAxios.interceptors.request.use(
  (config) => {
    const token = authStore.getToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor: Global Error Handling and Toast Notification
let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

authorizeAxios.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config
    let errorMessage = 'Đã xảy ra lỗi hệ thống'

    if (error.response) {
      const { status, data } = error.response
      errorMessage = data?.message || errorMessage

      // Handle token refreshing on 401 Unauthorized
      if (status === 401 && !originalRequest._retry) {
        // Prevent infinite loop if refresh request fails
        if (originalRequest.url?.includes('/refresh')) {
          authStore.clear()
          window.location.href = '/login'
          return Promise.reject(error)
        }

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              return authorizeAxios(originalRequest)
            })
            .catch((err) => {
              return Promise.reject(err)
            })
        }

        originalRequest._retry = true
        isRefreshing = true

        const token = authStore.getToken()
        const refreshToken = authStore.getRefreshToken()

        return new Promise((resolve, reject) => {
          // Use standard axios to avoid trigger interceptors recursively
          axios
            .post(`${BASE_URL}/api/auth/refresh`, {
              token,
              refreshToken,
            })
            .then(({ data }) => {
              const newToken = data.token || data.accessToken || data.jwt
              const newRefreshToken = data.refreshToken || data.refresh

              if (newToken) {
                authStore.saveToken(newToken)
                if (newRefreshToken) {
                  authStore.saveRefreshToken(newRefreshToken)
                }
                
                originalRequest.headers.Authorization = `Bearer ${newToken}`
                processQueue(null, newToken)
                resolve(authorizeAxios(originalRequest))
              } else {
                throw new Error('Refresh failed')
              }
            })
            .catch((err) => {
              processQueue(err, null)
              toast.error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.')
              authStore.clear()
              setTimeout(() => {
                window.location.href = '/login'
              }, 1000)
              reject(err)
            })
            .finally(() => {
              isRefreshing = false
            })
        })
      }

      switch (status) {
        case 400:
          toast.error(errorMessage || 'Yêu cầu không hợp lệ')
          break
        case 401:
          // If we reached here, token refresh has already failed or been bypassed
          toast.error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.')
          authStore.clear()
          setTimeout(() => {
            window.location.href = '/login'
          }, 1000)
          break
        case 403:
          toast.error('Bạn không có quyền truy cập vào tài nguyên này')
          break
        case 404:
          toast.error('Không tìm thấy tài nguyên yêu cầu')
          break
        case 500:
          toast.error('Lỗi máy chủ nội bộ. Vui lòng thử lại sau.')
          break
        default:
          toast.error(errorMessage)
      }
    } else if (error.request) {
      toast.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối.')
    } else {
      toast.error(error.message)
    }

    return Promise.reject(error)
  }
)

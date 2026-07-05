import axios from 'axios'

// In production (Vercel), VITE_API_URL points to your Render backend.
// In local dev, Vite proxy forwards /api → localhost:8080
let rawUrl = import.meta.env.VITE_API_URL || '/api'

// Auto-normalize: make sure the URL ends with /api (but not double /api/api)
if (rawUrl.startsWith('http')) {
  // Strip trailing slash
  if (rawUrl.endsWith('/')) {
    rawUrl = rawUrl.substring(0, rawUrl.length - 1)
  }
  // Append /api if not present
  if (!rawUrl.endsWith('/api')) {
    rawUrl = `${rawUrl}/api`
  }
}

const BASE_URL = rawUrl

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

axiosClient.interceptors.request.use((config) => {
  // Strip leading slash to prevent Axios from overriding the /api path of the baseURL in production
  if (config.url && config.url.startsWith('/')) {
    config.url = config.url.substring(1)
  }

  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status

    // Retry on 401 (Unauthorized) OR 403 (Forbidden) — Spring Security can return
    // either code when a JWT is missing/expired depending on the filter chain path.
    if ((status === 401 || status === 403) && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) throw new Error('No refresh token')
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
        localStorage.setItem('accessToken', data.accessToken)
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken)
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return axiosClient(originalRequest)
      } catch (refreshError) {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default axiosClient

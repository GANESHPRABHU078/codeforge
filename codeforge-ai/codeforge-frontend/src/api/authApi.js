import axiosClient from './axiosClient'

export const authApi = {
  register: (payload) => axiosClient.post('/auth/register', payload),
  login: (payload) => axiosClient.post('/auth/login', payload),
  refresh: (refreshToken) => axiosClient.post('/auth/refresh', { refreshToken }),
}

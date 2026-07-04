import axiosClient from './axiosClient'

export const projectApi = {
  list: (page = 0, size = 10) => axiosClient.get(`/projects?page=${page}&size=${size}`),
  search: (q) => axiosClient.get(`/projects/search?q=${encodeURIComponent(q)}`),
  getById: (id) => axiosClient.get(`/projects/${id}`),
  remove: (id) => axiosClient.delete(`/projects/${id}`),
  download: (id) => axiosClient.get(`/projects/${id}/download`, { responseType: 'blob' }),
  listVersions: (id) => axiosClient.get(`/projects/${id}/versions`),
  restoreVersion: (id, versionNumber) => axiosClient.post(`/projects/${id}/versions/${versionNumber}/restore`),
  chat: (id, message) => axiosClient.post(`/projects/${id}/chat`, { message }),
  chatHistory: (id) => axiosClient.get(`/projects/${id}/chat/history`),
}

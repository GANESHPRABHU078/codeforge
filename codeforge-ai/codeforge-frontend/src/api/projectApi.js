import axiosClient from './axiosClient'

export const projectApi = {
  // Core CRUD
  list:           (page = 0, size = 10) => axiosClient.get(`/projects?page=${page}&size=${size}`),
  search:         (q)                   => axiosClient.get(`/projects/search?q=${encodeURIComponent(q)}`),
  getById:        (id)                  => axiosClient.get(`/projects/${id}`),
  remove:         (id)                  => axiosClient.delete(`/projects/${id}`),

  // Export / download
  download:       (id)                  => axiosClient.get(`/projects/${id}/download`, { responseType: 'blob' }),

  // Versioning
  listVersions:   (id)                  => axiosClient.get(`/projects/${id}/versions`),
  restoreVersion: (id, versionNumber)   => axiosClient.post(`/projects/${id}/versions/${versionNumber}/restore`),

  // Chat
  chat:           (id, message)         => axiosClient.post(`/projects/${id}/chat`, { message }),
  chatHistory:    (id)                  => axiosClient.get(`/projects/${id}/chat/history`),

  // ── New endpoints (upgrade) ──
  // Toggle favorite status for a project
  toggleFavorite: (id)                  => axiosClient.patch(`/projects/${id}/favorite`),

  // Get recent projects (last 5) with richer metadata
  recent:         ()                    => axiosClient.get('/projects/recent'),
}

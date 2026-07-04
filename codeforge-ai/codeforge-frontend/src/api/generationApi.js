import axiosClient from './axiosClient'

export const generationApi = {
  generateCode:          (payload) => axiosClient.post('/generate/code', payload),
  modifyProject:         (payload) => axiosClient.post('/generate/code', payload), // same endpoint, includes projectId
  explain:               (payload) => axiosClient.post('/generate/explain', payload),
  generateTests:         (payload) => axiosClient.post('/generate/tests', payload),
  generateDocs:          (payload) => axiosClient.post('/generate/docs', payload),
  detectErrors:          (payload) => axiosClient.post('/generate/detect-errors', payload),
  refactor:              (payload) => axiosClient.post('/generate/refactor', payload),
  qualitySuggestions:    (payload) => axiosClient.post('/generate/quality-suggestions', payload),
  deploymentSuggestions: (payload) => axiosClient.post('/generate/deployment-suggestions', payload),
}


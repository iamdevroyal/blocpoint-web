import axios from 'axios'

/**
 * Base API client for blocpoint-web.
 *
 * For now, this is wired for future use with blocpoint-api but is not
 * actually called anywhere — all screens use mocked flows. When we are
 * ready to integrate, we will:
 *  - set VITE_API_BASE_URL in .env
 *  - replace mock calls in stores/views with real endpoints.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost/blocpoint/blocpoint-api/public/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  // Attach correlation and idempotency for future backend integration.
  config.headers['X-Correlation-Id'] = crypto.randomUUID()
  if (['post', 'put', 'patch', 'delete'].includes((config.method || '').toLowerCase())) {
    config.headers['Idempotency-Key'] = crypto.randomUUID()
  }
  return config
})

export default apiClient



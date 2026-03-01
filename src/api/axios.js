import axios from 'axios'

/**
 * Base API client for blocpoint-web.
 *
 * Configured to talk to blocpoint-api at the URL set in VITE_API_BASE_URL.
 * Falls back to http://localhost/blocpoint/blocpoint-api/public/api/v1 for
 * local XAMPP development.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost/blocpoint/blocpoint-api/public/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// ─── Request Interceptor ─────────────────────────────────────────────────────

/**
 * Attach required headers on every outgoing request:
 *  - Authorization: Bearer token (Sanctum)
 *  - X-Correlation-Id: per-request UUID for tracing
 *  - Idempotency-Key: for mutating requests (POST/PUT/PATCH/DELETE)
 */
apiClient.interceptors.request.use((config) => {
  // Attach Sanctum token if available
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }

  // Tracing header
  config.headers['X-Correlation-Id'] = crypto.randomUUID()

  // Idempotency for mutating requests
  const mutatingMethods = ['post', 'put', 'patch', 'delete']
  if (mutatingMethods.includes((config.method || '').toLowerCase())) {
    config.headers['Idempotency-Key'] = crypto.randomUUID()
  }

  return config
})

// ─── Response Interceptor ────────────────────────────────────────────────────

/**
 * Handle 401 Unauthorized responses globally.
 *
 * On a 401, we attempt to refresh the Sanctum token once via
 * POST /auth/refresh. If the refresh succeeds, we retry the original
 * request with the new token. If refresh also fails (e.g. token fully
 * revoked), we clear local state and redirect to login.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    const isRefreshRequest = originalRequest?.url?.includes('/auth/refresh')
    const hasToken = !!localStorage.getItem('token')

    // Attempt a token refresh only if:
    //  1. The response is 401
    //  2. We have not already retried this request
    //  3. The failing request is NOT the refresh endpoint itself (prevents infinite loop)
    //  4. There is actually a stored token to refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshRequest &&
      hasToken
    ) {
      originalRequest._retry = true

      try {
        const { data } = await apiClient.post('/auth/refresh')
        const newToken = data.data.token

        localStorage.setItem('token', newToken)
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`
        return apiClient(originalRequest)
      } catch {
        // Refresh failed — the token is fully expired/revoked.
        // Remove ONLY the token. Preserve 'bp_user' and 'device_id' so that
        // Login.vue can detect a returning device and activate quick-login mode.
        // Only a deliberate logout (auth.logout()) clears the full session.
        localStorage.removeItem('token')
        localStorage.removeItem('token_expires_at')
        window.location.href = '/auth/login?expired=1'
        return Promise.reject(error)
      }
    }

    // For all other 401s (no token, refresh endpoint, already retried): same pattern —
    // remove only the expired token, keep the user/device identity for quick-login.
    if (error.response?.status === 401 && !hasToken) {
      localStorage.removeItem('token')
      localStorage.removeItem('token_expires_at')
      window.location.href = '/auth/login?expired=1'
      return Promise.reject(error)
    }

    return Promise.reject(error)
  }
)

export default apiClient

import { defineStore } from 'pinia'
import apiClient from '../api/axios'
import { getDeviceId, getDeviceInfo, clearDeviceId } from '../utils/device'

const USER_KEY = 'bp_user'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        /** @type {object|null} Authenticated agent object */
        user: JSON.parse(localStorage.getItem(USER_KEY) || 'null'),

        /** @type {string|null} Sanctum plaintext token */
        token: localStorage.getItem('token') || null,

        /** @type {string|null} ISO timestamp when the token expires */
        expiresAt: localStorage.getItem('token_expires_at') || null,

        /**
         * Transient OTP token returned by /auth/verify-otp.
         * Passed to /auth/register to prove phone ownership.
         * Never persisted to localStorage.
         * @type {string|null}
         */
        otpToken: null,
    }),

    getters: {
        /** True when a token exists in state. Does not check expiry. */
        isAuthenticated: (state) => !!state.token,
    },

    actions: {
        // ─── Internal helper ─────────────────────────────────────────────────

        /**
         * Persist token and user to localStorage after a successful auth call.
         *
         * @param {string} token
         * @param {string} expiresAt  ISO date string
         * @param {object} agent
         */
        _persistSession(token, expiresAt, agent) {
            this.token = token
            this.expiresAt = expiresAt
            this.user = agent
            localStorage.setItem('token', token)
            localStorage.setItem('token_expires_at', expiresAt)
            localStorage.setItem(USER_KEY, JSON.stringify(agent))
        },

        /**
         * Clear all auth state from memory and localStorage.
         */
        _clearSession() {
            this.token = null
            this.expiresAt = null
            this.user = null
            this.otpToken = null
            localStorage.removeItem('token')
            localStorage.removeItem('token_expires_at')
            localStorage.removeItem(USER_KEY)
        },

        // ─── OTP helpers (registration onboarding) ───────────────────────────

        /**
         * Request an OTP SMS for the given phone number.
         * Corresponds to Step 1 of the registration flow.
         *
         * @param {string} phone  Normalized +234 phone number
         * @returns {Promise<object>} Backend response data
         * @throws {import('axios').AxiosError}
         */
        async requestOtp(phone) {
            const { data } = await apiClient.post('/auth/request-otp', {
                phone,
                purpose: 'register',
            })
            return data.data
        },

        /**
         * Verify the OTP code and store the returned otp_token.
         * Corresponds to Step 2 of the registration flow.
         *
         * @param {string} phone  Normalized +234 phone number
         * @param {string} code   6-digit OTP code
         * @returns {Promise<object>} Backend response data
         * @throws {import('axios').AxiosError}
         */
        async verifyOtp(phone, code) {
            const { data } = await apiClient.post('/auth/verify-otp', {
                phone,
                code,
                purpose: 'register',
            })
            // Store the otp_token for use in the final register call
            this.otpToken = data.data?.otp_token ?? null
            return data.data
        },

        // ─── Registration ─────────────────────────────────────────────────────

        /**
         * Complete agent registration.
         * Corresponds to Step 4 (final step) of the registration flow.
         *
         * Maps frontend camelCase form fields to the backend's snake_case
         * field names and includes device binding + OTP proof.
         *
         * @param {object} formData
         * @param {string} formData.phone
         * @param {string} formData.otp        6-digit code (used if otp_token not set)
         * @param {string} formData.firstName
         * @param {string} formData.lastName
         * @param {string} formData.pin        4-digit PIN
         * @param {string} formData.pinConfirm 4-digit PIN confirmation
         * @returns {Promise<void>}
         * @throws {import('axios').AxiosError}
         */
        async register({ phone, otp, firstName, lastName, pin, pinConfirm }) {
            const payload = {
                phone,
                pin,
                pin_confirmation: pinConfirm,
                first_name: firstName,
                last_name: lastName,
                device_id: getDeviceId(),
                device_info: getDeviceInfo(),
            }

            // Prefer otp_token (multi-step flow); fall back to inline otp_code
            if (this.otpToken) {
                payload.otp_token = this.otpToken
            } else if (otp) {
                payload.otp_code = otp
            }

            const { data } = await apiClient.post('/auth/register', payload)
            this._persistSession(data.data.token, data.data.expires_at, data.data.agent)
            this.otpToken = null  // clear transient state
        },

        // ─── Login ────────────────────────────────────────────────────────────

        /**
         * Full login — requires phone + PIN. Used on first login or after
         * device ID has been cleared (reinstall / logout).
         *
         * @param {object} credentials
         * @param {string} credentials.phone  Normalized +234 phone
         * @param {string} credentials.pin    4-digit PIN
         * @returns {Promise<void>}
         * @throws {import('axios').AxiosError}
         */
        async login({ phone, pin }) {
            const { data } = await apiClient.post('/auth/login', {
                phone,
                pin,
                device_id: getDeviceId(),
                device_info: getDeviceInfo(),
            })
            this._persistSession(data.data.token, data.data.expires_at, data.data.agent)
        },

        // ─── Quick Login ──────────────────────────────────────────────────────

        /**
         * PIN-only login for returning users on a bound device.
         *
         * The backend looks up the agent via the stored device_id so no phone
         * is needed. Used after session expiry or as the biometric fallback.
         *
         * If the backend returns 422 "Device not recognized" (e.g. after app
         * reinstall), the caller should catch it, clear the device_id and fall
         * back to the full login form.
         *
         * @param {string} pin  4-digit PIN
         * @returns {Promise<void>}
         * @throws {import('axios').AxiosError}
         */
        async quickLogin(pin) {
            const { data } = await apiClient.post('/auth/quick-login', {
                device_id: getDeviceId(),
                pin,
            })
            this._persistSession(data.data.token, data.data.expires_at, data.data.agent)
        },

        // ─── Forgot PIN (unauthenticated reset) ──────────────────────────────

        /**
         * Step 1 — Send an OTP to the phone for PIN reset.
         * Uses purpose='reset_pin' so the cache key is isolated from registration OTPs.
         *
         * @param {string} phone  Registered phone number
         * @returns {Promise<object>}
         */
        async requestForgotPinOtp(phone) {
            const { data } = await apiClient.post('/auth/forgot-pin', { phone })
            return data.data
        },

        /**
         * Step 2 — Verify the OTP and store the returned otp_token for step 3.
         *
         * @param {string} phone  Registered phone number
         * @param {string} code   6-digit OTP
         * @returns {Promise<object>}
         */
        async verifyForgotPinOtp(phone, code) {
            const { data } = await apiClient.post('/auth/verify-otp', {
                phone,
                code,
                purpose: 'reset_pin',
            })
            // Store the otp_token transiently — passed to resetPin() below
            this.otpToken = data.data?.otp_token ?? null
            return data.data
        },

        /**
         * Step 3 — Set the new PIN using the otp_token from step 2.
         * Clears the transient token after use.
         *
         * @param {string} phone    Registered phone number
         * @param {string} newPin   4-digit PIN
         * @returns {Promise<object>}
         */
        async resetPin(phone, newPin) {
            const { data } = await apiClient.post('/auth/reset-pin', {
                phone,
                otp_token:            this.otpToken,
                new_pin:              newPin,
                new_pin_confirmation: newPin,
            })
            this.otpToken = null   // clear transient state
            return data.data
        },

        // ─── Logout ───────────────────────────────────────────────────────────

        /**
         * Revoke the current Sanctum token on the backend, then clear local state.
         *
         * Even if the API call fails (e.g. already expired), we clear local state
         * so the user is signed out on this device.
         *
         * @returns {Promise<void>}
         */
        async logout() {
            try {
                await apiClient.post('/auth/logout')
            } catch {
                // Swallow errors — token may already be expired. Always clear locally.
            } finally {
                this._clearSession()
            }
        },

        // ─── Restore Session ──────────────────────────────────────────────────

        /**
         * Fetch the current agent's profile from the server.
         *
         * Called on page load / app boot to re-hydrate the user object from
         * the backend instead of blindly trusting stale localStorage data.
         *
         * - If a valid token exists: calls GET /auth/me and updates localStorage.
         * - If the call fails (token expired, network error): falls back to the
         *   locally cached user without throwing, so the app still boots.
         *
         * @returns {Promise<void>}
         */
        async fetchUser() {
            // No token — nothing to fetch
            if (!this.token) return

            try {
                const { data } = await apiClient.get('/auth/me')
                const agent = data.data?.agent ?? data.data
                if (agent) {
                    this.user = agent
                    localStorage.setItem(USER_KEY, JSON.stringify(agent))
                }
            } catch {
                // Graceful fallback: use whatever is in localStorage
                const cached = localStorage.getItem(USER_KEY)
                if (cached) {
                    this.user = JSON.parse(cached)
                }
            }
        },
    },
})

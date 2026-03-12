/**
 * Settings Store
 *
 * Centralises all agent settings API calls.
 * Components import this store and call actions — no direct axiosClient in settings views.
 *
 * TTL guard: `load()` skips the network call if data was fetched < 5 minutes ago.
 * Call `load(true)` to force a refresh (e.g. after navigating back to settings).
 */

import { defineStore } from 'pinia'
import apiClient from '../api/axios'

const TTL_MS = 5 * 60 * 1000 // 5 minutes

/** Default settings matching backend DB defaults */
const DEFAULT_SETTINGS = {
    notifications: {
        push: true,
        email: false,
        sms: true,
        marketing: false,
    },
    security: {
        biometric_login: false,
        biometric_txn: true,
    },
    tax: {
        tin: null,
        auto_remittance: false,
    },
    pos_pin_configured: false,
}

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        ...JSON.parse(localStorage.getItem('bp_settings') || JSON.stringify(DEFAULT_SETTINGS)),

        isLoading: false,
        isSaving: false,
        error: null,

        /** Timestamp (ms) of last successful load — used for TTL guard */
        _loadedAt: null,
    }),

    getters: {
        /**
         * True if the data is stale (older than TTL) or has never been loaded.
         * @param {object} state
         * @returns {boolean}
         */
        isStale: (state) =>
            state._loadedAt === null || Date.now() - state._loadedAt > TTL_MS,
    },

    actions: {
        /**
         * Load all settings from the backend.
         * Skips the API call if data is fresh (< 5 min), unless force=true.
         *
         * @param {boolean} force  Bypass TTL guard
         * @returns {Promise<void>}
         */
        async load(force = false) {
            // Guard: if offline, don't even try
            if (typeof navigator !== 'undefined' && !navigator.onLine) return

            if (!force && !this.isStale) return

            this.isLoading = true
            this.error = null
            try {
                const { data } = await apiClient.get('/agents/settings')
                const s = data.data
                this.notifications = s.notifications
                this.security = s.security
                this.tax = s.tax
                this.pos_pin_configured = s.pos_pin_configured
                this._loadedAt = Date.now()
            } catch (err) {
                // Preserve existing settings on error/offline
                this.error = err?.response?.data?.message ?? 'Network error. Viewing offline settings.'
            } finally {
                this.isLoading = false
                this._persist()
            }
        },

        _persist() {
            localStorage.setItem('bp_settings', JSON.stringify({
                notifications: this.notifications,
                security: this.security,
                tax: this.tax,
                pos_pin_configured: this.pos_pin_configured
            }))
        },

        /**
         * Update notification preference toggles.
         * Optimistically updates local state for instant UI feedback.
         *
         * @param {object} prefs  { notif_push, notif_email, notif_sms, notif_marketing }
         * @returns {Promise<void>}
         */
        async updateNotifications(prefs) {
            // Optimistic update
            this.notifications = {
                push: prefs.notif_push ?? this.notifications.push,
                email: prefs.notif_email ?? this.notifications.email,
                sms: prefs.notif_sms ?? this.notifications.sms,
                marketing: prefs.notif_marketing ?? this.notifications.marketing,
            }
            this.isSaving = true
            try {
                await apiClient.put('/agents/settings/notifications', prefs)
                this._loadedAt = Date.now() // Reset TTL — data is now fresh from our own write
            } catch (err) {
                // Revert optimistic update on failure
                await this.load(true)
                this.error = err?.response?.data?.message ?? 'Failed to save notifications.'
            } finally {
                this.isSaving = false
            }
        },

        /**
         * Update security preference toggles.
         * Optimistically updates local state.
         *
         * @param {object} prefs  { security_biometric_login, security_biometric_txn }
         * @returns {Promise<void>}
         */
        async updateSecurity(prefs) {
            this.security = {
                biometric_login: prefs.security_biometric_login ?? this.security.biometric_login,
                biometric_txn: prefs.security_biometric_txn ?? this.security.biometric_txn,
            }
            this.isSaving = true
            try {
                await apiClient.put('/agents/settings/security', prefs)
                this._loadedAt = Date.now()
            } catch (err) {
                await this.load(true)
                this.error = err?.response?.data?.message ?? 'Failed to save security settings.'
            } finally {
                this.isSaving = false
            }
        },

        /**
         * Update tax compliance settings.
         *
         * @param {{ tax_tin: string|null, tax_auto_remittance: boolean }} payload
         * @returns {Promise<{ success: boolean, error?: string }>}
         */
        async updateTax(payload) {
            this.isSaving = true
            this.error = null
            try {
                await apiClient.put('/agents/settings/tax', payload)
                this.tax = {
                    tin: payload.tax_tin ?? this.tax.tin,
                    auto_remittance: payload.tax_auto_remittance ?? this.tax.auto_remittance,
                }
                this._loadedAt = Date.now()
                return { success: true }
            } catch (err) {
                const msg = err?.response?.data?.message ?? 'Failed to save tax settings.'
                this.error = msg
                return { success: false, error: msg }
            } finally {
                this.isSaving = false
            }
        },

        /**
         * Reset the SoftPOS PIN.
         * Verifies the current login PIN on the backend before applying the change.
         *
         * @param {{ current_login_pin: string, new_pos_pin: string, new_pos_pin_confirmation: string }} payload
         * @returns {Promise<{ success: boolean, error?: string }>}
         */
        async resetPosPin(payload) {
            this.isSaving = true
            this.error = null
            try {
                await apiClient.post('/agents/settings/pos-pin/reset', payload)
                this.pos_pin_configured = true
                return { success: true }
            } catch (err) {
                const msg = err?.response?.data?.message ?? 'Failed to update POS PIN.'
                this.error = msg
                return { success: false, error: msg }
            } finally {
                this.isSaving = false
            }
        },

        /**
         * Clear loaded-at so the next load() call will always hit the API.
         * Call this on logout.
         */
        invalidate() {
            this._loadedAt = null
        },
    },
})

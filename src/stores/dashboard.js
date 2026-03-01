/**
 * Dashboard Store
 *
 * Loads and caches all data shown on the main dashboard:
 * - Wallet balance (GET /wallets/NGN/balance)
 * - Recent transactions (GET /transactions?per_page=5)
 * - Notifications (GET /notifications?per_page=10)
 *
 * All three are loaded in parallel via Promise.allSettled on mount so a
 * single failing call never blocks the others. Each section shows its own
 * skeleton state while loading.
 */

import { defineStore } from 'pinia'
import apiClient from '../api/axios'

export const useDashboardStore = defineStore('dashboard', {
    state: () => ({
        /** @type {{ available_balance: number, pending_balance: number, total_holds: number }|null} */
        wallet: null,

        /** @type {Array} Recent transactions (up to 5) */
        transactions: [],

        /** @type {Array} Notifications for the agent */
        notifications: [],

        isLoadingWallet: false,
        isLoadingTxns: false,
        isLoadingNotifs: false,

        walletError: null,
    }),

    getters: {
        /**
         * Count of unread notifications.
         *
         * @param {*} state
         * @returns {number}
         */
        unreadCount: (state) => state.notifications.filter((n) => !n.is_read).length,

        /**
         * True while any section is still loading.
         *
         * @param {*} state
         * @returns {boolean}
         */
        isLoading: (state) =>
            state.isLoadingWallet || state.isLoadingTxns || state.isLoadingNotifs,
    },

    actions: {
        /**
         * Load all dashboard data in parallel.
         * Failures are isolated — one section failing does not affect the others.
         *
         * @returns {Promise<void>}
         */
        async load() {
            await Promise.allSettled([
                this.fetchWallet(),
                this.fetchTransactions(),
                this.fetchNotifications(),
            ])
        },

        /**
         * Fetch the NGN wallet balance breakdown.
         * Uses /wallets/NGN/balance which returns available_balance, pending_balance, total_holds.
         *
         * @returns {Promise<void>}
         */
        async fetchWallet() {
            this.isLoadingWallet = true
            this.walletError = null
            try {
                const { data } = await apiClient.get('/wallets/NGN/balance')
                this.wallet = data.data
            } catch (err) {
                this.walletError = err?.response?.data?.message ?? 'Could not load balance.'
            } finally {
                this.isLoadingWallet = false
            }
        },

        /**
         * Fetch the 5 most recent transactions.
         *
         * @returns {Promise<void>}
         */
        async fetchTransactions() {
            this.isLoadingTxns = true
            try {
                const { data } = await apiClient.get('/transactions', {
                    params: { per_page: 5 },
                })
                // Handle both paginated (data.data) and plain array responses
                this.transactions = Array.isArray(data.data) ? data.data : (data.data?.data ?? [])
            } catch {
                this.transactions = []
            } finally {
                this.isLoadingTxns = false
            }
        },

        /**
         * Fetch recent notifications for the agent.
         *
         * @returns {Promise<void>}
         */
        async fetchNotifications() {
            this.isLoadingNotifs = true
            try {
                const { data } = await apiClient.get('/notifications', {
                    params: { per_page: 10 },
                })
                this.notifications = Array.isArray(data.data) ? data.data : (data.data?.data ?? [])
            } catch {
                this.notifications = []
            } finally {
                this.isLoadingNotifs = false
            }
        },

        /**
         * Mark a single notification as read via PATCH and update local state.
         *
         * @param {string} id Notification UUID
         * @returns {Promise<void>}
         */
        async markNotificationRead(id) {
            try {
                await apiClient.patch(`/notifications/${id}/read`)
                const notif = this.notifications.find((n) => n.id === id)
                if (notif) notif.is_read = true
            } catch {
                // Silently fail — the read state will re-sync on next load
            }
        },

        /**
         * Delete a notification and remove it from local state.
         *
         * @param {string} id Notification UUID
         * @returns {Promise<void>}
         */
        async dismissNotification(id) {
            try {
                await apiClient.delete(`/notifications/${id}`)
                this.notifications = this.notifications.filter((n) => n.id !== id)
            } catch {
                // Silently fail
            }
        },
    },
})

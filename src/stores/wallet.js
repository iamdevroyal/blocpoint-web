/**
 * Wallet Store
 *
 * Owns all wallet-related state:
 *  - wallets[]          — agent's wallets from GET /wallets
 *  - activeWallet       — currently selected wallet (updated on currency switch)
 *  - walletTransactions — per-currency paginated transactions
 *  - availableCurrencies — currencies available to create a new wallet in
 *
 * Used by:
 *  - Dashboard.vue   — currency dropdown + balance display
 *  - Wallet.vue      — carousel, transactions, Add Wallet, Send modal
 */

import { defineStore } from 'pinia'
import apiClient from '../api/axios'

// ─── Currency metadata (UI-only, backend returns code only) ────────────────
export const CURRENCY_META = {
    NGN: {
        code: 'NGN',
        name: 'Nigerian Naira',
        symbol: '₦',
        flag: '🇳🇬',
        color: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10',
        textColor: 'text-slate-800 dark:text-white',
        accentBg: 'bg-slate-100 dark:bg-white/5',
    },
    KES: {
        code: 'KES',
        name: 'Kenyan Shilling',
        symbol: 'KSh',
        flag: '🇰🇪',
        color: 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-500/20',
        textColor: 'text-rose-900 dark:text-rose-100',
        accentBg: 'bg-rose-100 dark:bg-rose-500/10',
    },
    GHC: {
        code: 'GHC',
        name: 'Ghanaian Cedi',
        symbol: 'GH₵',
        flag: '🇬🇭',
        color: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-500/20',
        textColor: 'text-emerald-900 dark:text-emerald-100',
        accentBg: 'bg-emerald-100 dark:bg-emerald-500/10',
    },
    USDT: {
        code: 'USDT',
        name: 'Tether (USDT)',
        symbol: '$',
        flag: '💵',
        color: 'bg-teal-50 dark:bg-teal-900/20 border-teal-100 dark:border-teal-500/20',
        textColor: 'text-teal-900 dark:text-teal-100',
        accentBg: 'bg-teal-100 dark:bg-teal-500/10',
    },
    USDC: {
        code: 'USDC',
        name: 'USD Coin (USDC)',
        symbol: '$',
        flag: '🔵',
        color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-500/20',
        textColor: 'text-blue-900 dark:text-blue-100',
        accentBg: 'bg-blue-100 dark:bg-blue-500/10',
    },
}

/**
 * Get display metadata for a currency code.
 * Falls back to generic entry if code not in CURRENCY_META.
 *
 * @param {string} code
 * @returns {object}
 */
export function currencyMeta(code) {
    return CURRENCY_META[code?.toUpperCase()] ?? {
        code,
        name: code,
        symbol: code,
        flag: '💳',
        color: 'bg-slate-50 dark:bg-slate-900/20 border-slate-100 dark:border-slate-500/20',
        textColor: 'text-slate-800 dark:text-white',
        accentBg: 'bg-slate-100 dark:bg-slate-500/10',
    }
}

export const useWalletStore = defineStore('wallet', {
    state: () => ({
        /** @type {Array<{id, currency, wallet_tag, available_balance, pending_balance, status}>} */
        wallets: [],

        /** @type {{id, currency, wallet_tag, available_balance, pending_balance}|null} */
        activeWallet: null,

        /**
         * Paginated transaction lists keyed by currency code.
         * Each value: { data: [], currentPage: 1, lastPage: 1, loading: false }
         */
        walletTransactions: {},

        /** Currencies available for wallet creation */
        availableCurrencies: [],

        isLoadingWallets: false,
        isLoadingBalance: false,
        isCreatingWallet: false,
        isResolvingTag: false,

        walletsError: null,
        balanceError: null,
        createError: null,
    }),

    getters: {
        /**
         * Active wallet enriched with CURRENCY_META display fields.
         */
        activeWalletMeta: (state) => {
            if (!state.activeWallet) return null
            return { ...state.activeWallet, ...currencyMeta(state.activeWallet.currency) }
        },

        /**
         * All wallets enriched with CURRENCY_META display fields.
         */
        enrichedWallets: (state) =>
            state.wallets.map((w) => ({ ...w, ...currencyMeta(w.currency) })),
    },

    actions: {
        /**
         * Load all wallets for the authenticated agent.
         * Sets activeWallet to first wallet in list.
         *
         * @returns {Promise<void>}
         */
        async fetchWallets() {
            this.isLoadingWallets = true
            this.walletsError = null
            try {
                const { data } = await apiClient.get('/wallets')
                const raw = data.data ?? data

                // Always show NGN first, then other currencies in the order the backend returns
                this.wallets = [
                    ...raw.filter((w) => w.currency?.toUpperCase() === 'NGN'),
                    ...raw.filter((w) => w.currency?.toUpperCase() !== 'NGN'),
                ]

                if (this.wallets.length) {
                    // Preserve prior selection; on fresh login default to NGN
                    const activeCurrency = this.activeWallet?.currency
                        ?? 'NGN'
                    this.activeWallet = this.wallets.find((w) => w.currency === activeCurrency)
                        ?? this.wallets.find((w) => w.currency === 'NGN')
                        ?? this.wallets[0]
                }
            } catch (err) {
                this.walletsError = err?.response?.data?.message ?? 'Could not load wallets.'
            } finally {
                this.isLoadingWallets = false
            }
        },

        /**
         * Switch the active wallet to the given currency.
         * Re-fetches the fresh balance from the backend.
         *
         * @param {string} currency
         * @returns {Promise<void>}
         */
        async selectWallet(currency) {
            const found = this.wallets.find((w) => w.currency === currency)
            if (found) {
                this.activeWallet = found
            }
            await this.fetchBalance(currency)
        },

        /**
         * Fetch the balance breakdown for a specific currency wallet.
         * Updates activeWallet in-place.
         *
         * @param {string} currency
         * @returns {Promise<void>}
         */
        async fetchBalance(currency) {
            this.isLoadingBalance = true
            this.balanceError = null
            try {
                const { data } = await apiClient.get(`/wallets/${currency}/balance`)
                const balance = data.data ?? data

                // Use splice() — always reactive in Vue 3's Proxy arrays
                const idx = this.wallets.findIndex((w) => w.currency === currency)
                if (idx !== -1) {
                    this.wallets.splice(idx, 1, { ...this.wallets[idx], ...balance })
                }
                // Keep activeWallet in sync if it's the same currency
                if (this.activeWallet?.currency === currency) {
                    this.activeWallet = { ...this.activeWallet, ...balance }
                }
            } catch (err) {
                this.balanceError = err?.response?.data?.message ?? 'Could not load balance.'
            } finally {
                this.isLoadingBalance = false
            }
        },

        /**
         * Fetch paginated transactions for a currency wallet.
         * Results are cached — set force=true to bypass cache.
         *
         * @param {string}  currency
         * @param {number}  page
         * @param {boolean} force
         * @returns {Promise<void>}
         */
        async fetchTransactions(currency, page = 1, force = false) {
            const key = currency.toUpperCase()

            if (!this.walletTransactions[key]) {
                this.walletTransactions[key] = { data: [], currentPage: 1, lastPage: 1, loading: false }
            }

            // Don't re-fetch if already loaded (unless forced)
            if (this.walletTransactions[key].data.length && !force && page === 1) return

            this.walletTransactions[key].loading = true
            try {
                const { data } = await apiClient.get('/transactions', {
                    params: { wallet_currency: key, per_page: 15, page },
                })
                const result = data.data ?? data
                this.walletTransactions[key].data = Array.isArray(result) ? result : (result.data ?? [])
                this.walletTransactions[key].currentPage = result.current_page ?? 1
                this.walletTransactions[key].lastPage = result.last_page ?? 1
            } catch {
                this.walletTransactions[key].data = []
            } finally {
                this.walletTransactions[key].loading = false
            }
        },

        /**
         * Fetch currencies available for new wallet creation.
         * Returns only active currencies the agent does NOT already have a wallet in.
         *
         * @returns {Promise<void>}
         */
        async fetchAvailableCurrencies() {
            try {
                const { data } = await apiClient.get('/wallets/available-currencies')
                this.availableCurrencies = data.data ?? data
            } catch {
                this.availableCurrencies = []
            }
        },

        /**
         * Create a new wallet in the given currency.
         * Appends the new wallet to the wallets list and refreshes available currencies.
         *
         * @param {string} currency
         * @returns {Promise<{wallet}|{error}>}
         */
        async createWallet(currency) {
            this.isCreatingWallet = true
            this.createError = null
            try {
                const { data } = await apiClient.post('/wallets', { currency })
                const wallet = data.data ?? data
                this.wallets.push(wallet)
                // Remove created currency from availableCurrencies
                this.availableCurrencies = this.availableCurrencies.filter(
                    (c) => c.currency_code !== currency
                )
                return { wallet }
            } catch (err) {
                this.createError = err?.response?.data?.message ?? 'Could not create wallet.'
                return { error: this.createError }
            } finally {
                this.isCreatingWallet = false
            }
        },

        /**
         * Resolve a wallet tag to  { wallet_tag, currency, agent_name }.
         * Used by the P2P Send modal to confirm the recipient.
         *
         * @param {string} tag  e.g. 'BLP-FX9K2-NGN'
         * @returns {Promise<{recipient}|{error}>}
         */
        async resolveTag(tag) {
            this.isResolvingTag = true
            try {
                const { data } = await apiClient.get('/wallets/resolve', { params: { tag } })
                return { recipient: data.data ?? data }
            } catch (err) {
                return { error: err?.response?.data?.message ?? 'Wallet tag not found.' }
            } finally {
                this.isResolvingTag = false
            }
        },

        /**
         * Send a wallet-to-wallet P2P transfer.
         *
         * @param {{ wallet_tag: string, source_currency: string, amount: number, narration?: string }} payload
         * @returns {Promise<{transaction}|{error}>}
         */
        async sendP2P(payload) {
            try {
                const { data } = await apiClient.post('/transfers/internal', payload)
                // Refresh balance after successful transfer
                await this.fetchBalance(payload.source_currency)
                await this.fetchTransactions(payload.source_currency, 1, true)
                return { transaction: data.data ?? data }
            } catch (err) {
                return { error: err?.response?.data?.message ?? 'Transfer failed.' }
            }
        },
        /**
         * Get a live conversion quote without executing any wallet changes.
         *
         * @param {string} from     Source currency code (e.g. 'NGN')
         * @param {string} to       Target currency code (e.g. 'KES')
         * @param {number} amount   Amount to convert
         * @returns {Promise<{quote}|{error}>}
         */
        async getConversionQuote(from, to, amount) {
            try {
                const { data } = await apiClient.get('/conversions/quote', {
                    params: { from, to, amount },
                })
                return { quote: data.data ?? data }
            } catch (err) {
                return { error: err?.response?.data?.message ?? 'Could not fetch rate.' }
            }
        },

        /**
         * Execute a wallet-to-wallet currency conversion.
         * Refreshes balances for both wallets after success.
         *
         * @param {{ from_currency: string, to_currency: string, amount: number, pin: string }} payload
         * @returns {Promise<{conversion}|{error}>}
         */
        async executeConversion(payload) {
            try {
                const { data } = await apiClient.post('/conversions', payload)
                // Refresh both wallets so the carousel shows updated balances + transactions
                await Promise.all([
                    this.fetchBalance(payload.from_currency),
                    this.fetchBalance(payload.to_currency),
                ])
                // Force-refresh transactions for BOTH wallets so each shows the correct history
                await Promise.all([
                    this.fetchTransactions(payload.from_currency, 1, true),
                    this.fetchTransactions(payload.to_currency, 1, true),
                ])
                return { conversion: data.data ?? data }
            } catch (err) {
                return { error: err?.response?.data?.message ?? 'Conversion failed.' }
            }
        },
    },
})

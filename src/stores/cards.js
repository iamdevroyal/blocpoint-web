import { defineStore } from 'pinia'
import {
    getCardholder,
    registerCardholder,
    getCards,
    createCard,
    getCardDetails,
    generateCardToken,
    fundCard,
    unloadCard,
    freezeCard,
    unfreezeCard,
    deleteCard,
    getCardTransactions,
    getFxRate,
    revealCardDetails,
} from '../api/cards.js'

export const useCardStore = defineStore('cards', {
    state: () => ({
        /** @type {Object|null} */
        cardholder: null,
        /** @type {Array}  */
        cards: [],
        /** @type {Object|null} */
        fxRate: null,
        /** @type {Array}  */
        transactions: [],
        loading: false,
        error: null,
    }),

    getters: {
        /** Cards that have not been deleted */
        activeCards: (state) => state.cards.filter(c => !c.is_deleted),

        /** Whether the agent has a verified cardholder profile */
        hasVerifiedCardholder: (state) => state.cardholder?.is_verified === true,
    },

    actions: {
        // ── Cardholder ─────────────────────────────────────────────────────────

        /**
         * Fetch the agent's cardholder profile / KYC status.
         */
        async fetchCardholder() {
            this.loading = true
            this.error = null
            try {
                const res = await getCardholder()
                this.cardholder = res.data?.data ?? null
            } catch (e) {
                // Keep the error message for 404 so UI can display backend's specific KYC instructions
                this.error = e?.response?.data?.message || 'Failed to load cardholder profile'
                if (e?.response?.status === 404) {
                    this.cardholder = null
                }
            } finally {
                this.loading = false
            }
        },

        /**
         * Register the agent as a cardholder (KYC submission).
         * @param {Object} data  { address, city, state, id_type, bvn, selfie_image, ... }
         */
        async registerCardholder(data) {
            this.loading = true
            this.error = null
            try {
                const res = await registerCardholder(data)
                this.cardholder = res.data?.data
                return this.cardholder
            } catch (e) {
                this.error = e?.response?.data?.message || 'KYC registration failed'
                throw e
            } finally {
                this.loading = false
            }
        },

        // ── Cards ──────────────────────────────────────────────────────────────

        /**
         * Fetch all virtual cards for this agent.
         */
        async fetchCards() {
            this.loading = true
            this.error = null
            try {
                const res = await getCards()
                this.cards = res.data?.data ?? []
            } catch (e) {
                this.error = e?.response?.data?.message || 'Failed to load cards'
            } finally {
                this.loading = false
            }
        },

        /**
         * Create a new virtual card.
         * @param {Object} data  { card_limit, pin, pin_confirmation, funding_amount_ngn }
         */
        async createCard(data) {
            this.loading = true
            this.error = null
            try {
                const res = await createCard(data)
                const card = res.data?.data
                if (card) this.cards.push(card)
                return card
            } catch (e) {
                this.error = e?.response?.data?.message || 'Card creation failed'
                throw e
            } finally {
                this.loading = false
            }
        },

        /**
         * Reveal sensitive card details via Evervault relay.
         * Returns { pan, cvv, expiry } — caller should clear them after 10 seconds.
         *
         * Flow:
         *   1. POST /cards/{id}/token  → backend returns { token, relay_url, expires_at }
         *   2. Fetch from Evervault relay using token  → returns PAN/CVV/expiry
         *
         * @param {string} cardId
         * @returns {Promise<Object>}
         */
        async revealCard(cardId) {
            this.loading = true
            this.error = null
            try {
                // Step 1: get one-time token + relay URL from our backend
                const tokenRes = await generateCardToken(cardId)
                const tokenData = tokenRes.data?.data ?? {}
                const token = tokenData.token
                const relayUrl = tokenData.relay_url || import.meta.env.VITE_BRIDGECARD_EVERVAULT_RELAY_URL
                const apiKey = import.meta.env.VITE_BRIDGECARD_API_KEY || ''

                if (!token) throw new Error('No reveal token returned from server')

                // Step 2: call Evervault relay directly — backend never sees PAN/CVV
                const details = await revealCardDetails(relayUrl, token, apiKey)
                return details
            } catch (e) {
                this.error = e?.response?.data?.message || e?.message || 'Failed to reveal card details'
                throw e
            } finally {
                this.loading = false
            }
        },

        /**
         * Fund a card from the agent's NGN wallet.
         * @param {string} cardId
         * @param {number} amountNgn
         */
        async fundCard(cardId, amountNgn) {
            this.loading = true
            this.error = null
            try {
                await fundCard(cardId, amountNgn)
                // Refresh cards to get updated balance after webhook settles
                await this.fetchCards()
            } catch (e) {
                this.error = e?.response?.data?.message || 'Funding failed'
                throw e
            } finally {
                this.loading = false
            }
        },

        /**
         * Unload USD from a card back to the NGN wallet.
         * @param {string} cardId
         * @param {number} amountCents
         */
        async unloadCard(cardId, amountCents) {
            this.loading = true
            this.error = null
            try {
                await unloadCard(cardId, amountCents)
                await this.fetchCards()
            } catch (e) {
                this.error = e?.response?.data?.message || 'Unload failed'
                throw e
            } finally {
                this.loading = false
            }
        },

        /**
         * Freeze a card, blocking all transactions.
         * @param {string} cardId
         */
        async freezeCard(cardId) {
            this.loading = true
            this.error = null
            try {
                const res = await freezeCard(cardId)
                this._updateCard(res.data?.data)
            } catch (e) {
                this.error = e?.response?.data?.message || 'Freeze failed'
                throw e
            } finally {
                this.loading = false
            }
        },

        /**
         * Unfreeze a frozen card.
         * @param {string} cardId
         */
        async unfreezeCard(cardId) {
            this.loading = true
            this.error = null
            try {
                const res = await unfreezeCard(cardId)
                this._updateCard(res.data?.data)
            } catch (e) {
                this.error = e?.response?.data?.message || 'Unfreeze failed'
                throw e
            } finally {
                this.loading = false
            }
        },

        /**
         * Permanently delete a card.
         * @param {string} cardId
         */
        async deleteCard(cardId) {
            this.loading = true
            this.error = null
            try {
                await deleteCard(cardId)
                this.cards = this.cards.filter(c => c.id !== cardId)
            } catch (e) {
                this.error = e?.response?.data?.message || 'Delete failed'
                throw e
            } finally {
                this.loading = false
            }
        },

        // ── Transactions ───────────────────────────────────────────────────────

        /**
         * Fetch transaction history for a specific card.
         * @param {string} cardId
         * @param {number} page
         */
        async fetchTransactions(cardId, page = 1) {
            this.loading = true
            this.error = null
            try {
                const res = await getCardTransactions(cardId, page)
                this.transactions = res.data?.data ?? []
            } catch (e) {
                this.error = e?.response?.data?.message || 'Failed to load transactions'
            } finally {
                this.loading = false
            }
        },

        // ── FX Rate ────────────────────────────────────────────────────────────

        /**
         * Fetch the current live NGN/USD FX rate.
         */
        async fetchFxRate() {
            try {
                const res = await getFxRate()
                this.fxRate = res.data?.data ?? null
            } catch {
                // FX rate failure is non-blocking — silently ignore
            }
        },

        // ── Private helpers ────────────────────────────────────────────────────

        /**
         * Update a card in the local state by its ID.
         * @param {Object|null} updated
         */
        _updateCard(updated) {
            if (!updated) return
            const idx = this.cards.findIndex(c => c.id === updated.id)
            if (idx !== -1) this.cards.splice(idx, 1, updated)
        },
    },
})

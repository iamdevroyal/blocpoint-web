import { defineStore } from 'pinia'
import savingsApi from '../api/savings'

/**
 * Savings Store
 *
 * Manages state for all BlocSave products:
 *  - overview      — Global summary (total balance, interest, active counts)
 *  - products      — Config for BlocFlex, BlocLock, BlocGoal, BlocRound
 *  - vaults        — Active user vaults (including Flex, Lock plans, Goals)
 *  - roundRule     — BlocRound configuration and trigger toggles
 *  - transactions  — Paginated savings history
 */
export const useSavingsStore = defineStore('savings', {
    state: () => ({
        /** @type {object|null} */
        overview: JSON.parse(localStorage.getItem('bp_savings_overview') || 'null'),

        /** @type {Array} */
        products: JSON.parse(localStorage.getItem('bp_savings_products') || '[]'),

        /** @type {Array} */
        vaults: JSON.parse(localStorage.getItem('bp_savings_vaults') || '[]'),

        /** @type {object|null} */
        roundRule: JSON.parse(localStorage.getItem('bp_savings_round_rule') || 'null'),

        /** Paginated transactions */
        transactions: {
            data: [],
            currentPage: 1,
            lastPage: 1,
            loading: false,
        },

        isLoadingOverview: false,
        isLoadingProducts: false,
        isLoadingVaults: false,
        isLoadingRoundRule: false,

        overviewError: null,
        productsError: null,
        vaultsError: null,

        /** TTL Tracking (5 min) */
        _loadedAt: {
            overview: null,
            products: null,
            vaults: null,
            roundRule: null
        }
    }),

    getters: {
        /** Filters vaults by product code */
        getVaultsByProduct: (state) => (productCode) => {
            return state.vaults.filter(v => v.product_code === productCode)
        },

        /** Find specifically the BlocFlex vault (singular unique) */
        blocFlexVault: (state) => {
            return state.vaults.find(v => v.product_code === 'blocflex')
        },

        /** Find specifically the BlocRound vault (singular unique) */
        blocRoundVault: (state) => {
            return state.vaults.find(v => v.product_code === 'blocround')
        },

        activeLockPlans: (state) => {
            return state.vaults.filter(v => v.product_code === 'bloclock' && v.status === 'active')
        },

        activeGoalPlans: (state) => {
            return state.vaults.filter(v => v.product_code === 'blocgoal' && v.status === 'active')
        }
    },

    actions: {
        _persist() {
            localStorage.setItem('bp_savings_overview', JSON.stringify(this.overview))
            localStorage.setItem('bp_savings_products', JSON.stringify(this.products))
            localStorage.setItem('bp_savings_vaults', JSON.stringify(this.vaults))
            localStorage.setItem('bp_savings_round_rule', JSON.stringify(this.roundRule))
        },

        async fetchOverview(force = false) {
            if (!force && this._loadedAt.overview && (Date.now() - this._loadedAt.overview < 300000)) return

            this.isLoadingOverview = true
            try {
                const { data } = await savingsApi.getOverview()
                this.overview = data.data
                this._loadedAt.overview = Date.now()
                this._persist()
            } catch (err) {
                this.overviewError = err.message
            } finally {
                this.isLoadingOverview = false
            }
        },

        async fetchProducts(force = false) {
            if (!force && this._loadedAt.products && (Date.now() - this._loadedAt.products < 3600000)) return // 1 hour for products

            this.isLoadingProducts = true
            try {
                const { data } = await savingsApi.getProducts()
                this.products = data.data
                this._loadedAt.products = Date.now()
                this._persist()
            } catch (err) {
                this.productsError = err.message
            } finally {
                this.isLoadingProducts = false
            }
        },

        async fetchVaults(force = false) {
            if (!force && this._loadedAt.vaults && (Date.now() - this._loadedAt.vaults < 300000)) return

            this.isLoadingVaults = true
            try {
                const { data } = await savingsApi.getVaults()
                this.vaults = data.data
                this._loadedAt.vaults = Date.now()
                this._persist()
            } catch (err) {
                this.vaultsError = err.message
            } finally {
                this.isLoadingVaults = false
            }
        },

        async fetchRoundRule(force = false) {
            if (!force && this._loadedAt.roundRule && (Date.now() - this._loadedAt.roundRule < 300000)) return

            this.isLoadingRoundRule = true
            try {
                const { data } = await savingsApi.getBlocRoundRule()
                this.roundRule = data.data
                this._loadedAt.roundRule = Date.now()
                this._persist()
            } catch (err) {
                // Round rule might not exist yet if not activated
            } finally {
                this.isLoadingRoundRule = false
            }
        },

        async fetchTransactions(page = 1, filters = {}) {
            this.transactions.loading = true
            try {
                const { data } = await savingsApi.getTransactions({ page, ...filters })
                const res = data.data
                this.transactions.data = res.data
                this.transactions.currentPage = res.current_page
                this.transactions.lastPage = res.last_page
            } catch {
                // Handled by axios interceptor or component
            } finally {
                this.transactions.loading = false
            }
        },

        // ─── Direct Mutations ────────────────────────────────────────────────────

        async fundFlex(amount) {
            const { data } = await savingsApi.fundBlocFlex(amount)
            await this.refreshAll()
            return data.data
        },

        async withdrawFlex(amount) {
            const { data } = await savingsApi.withdrawBlocFlex(amount)
            await this.refreshAll()
            return data.data
        },

        async createLock(payload) {
            const { data } = await savingsApi.createBlocLock(payload)
            await this.refreshAll()
            return data.data
        },

        async breakLock(planRef) {
            const { data } = await savingsApi.breakBlocLock(planRef)
            await this.refreshAll()
            return data.data
        },

        async createGoal(payload) {
            const { data } = await savingsApi.createBlocGoal(payload)
            await this.refreshAll()
            return data.data
        },

        async fundGoal(goalRef, amount) {
            const { data } = await savingsApi.fundBlocGoal(goalRef, amount)
            await this.refreshAll()
            return data.data
        },

        async toggleAutoSave(goalRef) {
            const { data } = await savingsApi.toggleAutoSave(goalRef)
            await this.fetchVaults(true)
            return data.data
        },

        async updateRoundRule(payload) {
            const { data } = await savingsApi.updateBlocRoundRule(payload)
            this.roundRule = data.data
            this._persist()
            return data.data
        },

        async toggleRoundRule() {
            const { data } = await savingsApi.toggleRoundRule()
            this.roundRule = data.data
            this._persist()
            return data.data
        },

        async toggleRoundTrigger(triggerType) {
            const { data } = await savingsApi.toggleBlocRoundTrigger(triggerType)
            this.roundRule = data.data
            this._persist()
            return data.data
        },

        async refreshAll() {
            await Promise.all([
                this.fetchOverview(true),
                this.fetchVaults(true),
                this.fetchRoundRule(true)
            ])
        }
    }
})

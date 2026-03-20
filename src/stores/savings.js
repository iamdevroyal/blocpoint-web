import { defineStore } from 'pinia'
import savingsApi from '../api/savings'
import { useDashboardStore } from './dashboard'

/**
 * Savings Store
 *
 * Manages state for all BlocSave products:
 *  - overview      — Aggregated summary (total_balance, total_locked, interest_earned)
 *  - products      — Config for BlocFlex, BlocLock, BlocGoal, BlocRound (rates, limits)
 *  - blocFlexVault — The agent's single liquid savings vault
 *  - lockPlans     — All BlocLock time-locked plans
 *  - goalPlans     — All BlocGoal savings plans
 *  - roundRule     — BlocRound configuration and per-trigger toggles
 *  - transactions  — Paginated savings ledger history
 *
 * Response shape from backend:
 *  - Overview:       { data: { total_balance, total_locked, … breakdown[] } }
 *  - Lists:          { data: [ …items ] }
 *  - Single vault:   { data: { id, vault_ref, available_balance, … } }
 *  - Paginated:      { data: [ …items ], meta: { current_page, last_page, total } }
 */
export const useSavingsStore = defineStore('savings', {
    state: () => ({
        /** @type {object|null} Aggregated overview */
        overview: JSON.parse(localStorage.getItem('bp_savings_overview') || 'null'),

        /** @type {Array} Active savings products with rates */
        products: JSON.parse(localStorage.getItem('bp_savings_products') || '[]'),

        /** @type {object|null} BlocFlex liquid vault */
        blocFlexVault: JSON.parse(localStorage.getItem('bp_savings_flex_vault') || 'null'),

        /** @type {Array} BlocLock time-locked plans */
        lockPlans: JSON.parse(localStorage.getItem('bp_savings_lock_plans') || '[]'),

        /** @type {Array} BlocGoal savings plans */
        goalPlans: JSON.parse(localStorage.getItem('bp_savings_goal_plans') || '[]'),

        /** @type {object|null} BlocRound round-up rule */
        roundRule: JSON.parse(localStorage.getItem('bp_savings_round_rule') || 'null'),

        /** @type {Array} All active vaults */
        vaults: JSON.parse(localStorage.getItem('bp_savings_vaults') || '[]'),

        /** Paginated transaction history */
        transactions: {
            data: [],
            currentPage: 1,
            lastPage: 1,
            total: 0,
            loading: false,
        },

        isLoadingOverview: false,
        isLoadingProducts: false,
        isLoadingFlex: false,
        isLoadingLockPlans: false,
        isLoadingGoalPlans: false,
        isLoadingRoundRule: false,
        isLoadingVaults: false,

        overviewError: null,
        productsError: null,

        /** TTL cache tracking (ms timestamps) */
        _loadedAt: {
            overview: null,
            products: null,
            flex: null,
            lockPlans: null,
            goalPlans: null,
            roundRule: null,
            vaults: null,
        },
    }),

    getters: {
        /** Whether a goal plan is expired (status = 'expired') */
        isGoalExpired: (state) => (goalRef) => {
            const plan = state.goalPlans.find(p => p.goal_ref === goalRef)
            return plan?.status === 'expired'
        },

        /** Whether a goal plan has been achieved (status = 'achieved') */
        isGoalAchieved: (state) => (goalRef) => {
            const plan = state.goalPlans.find(p => p.goal_ref === goalRef)
            return plan?.status === 'achieved'
        },

        /** Total value locked across all active BlocLock plans */
        totalLocked: (state) =>
            state.lockPlans.filter(p => p.status === 'active').reduce((s, p) => s + p.amount, 0),

        /** Active goal plans only */
        activeGoalPlans: (state) => state.goalPlans.filter(p => p.status === 'active'),

        /** Active lock plans only */
        activeLockPlans: (state) => state.lockPlans.filter(p => p.status === 'active'),

        /** Expected interest across all active BlocLock plans */
        expectedLockInterest: (state) =>
            state.lockPlans
                .filter(p => p.status === 'active')
                .reduce((s, p) => s + (p.expected_interest ?? 0), 0),

        /** Find a goal plan by its ref */
        findGoalPlan: (state) => (goalRef) =>
            state.goalPlans.find(p => p.goal_ref === goalRef) ?? null,

        /** Find a lock plan by its ref */
        findLockPlan: (state) => (planRef) =>
            state.lockPlans.find(p => p.plan_ref === planRef) ?? null,

        /** Whether BlocRound is currently active (enabled + at least one trigger) */
        isRoundActive: (state) =>
            !!(state.roundRule?.is_enabled),
    },

    actions: {
        // ─── Persistence ──────────────────────────────────────────────────────────

        _persist() {
            localStorage.setItem('bp_savings_overview', JSON.stringify(this.overview))
            localStorage.setItem('bp_savings_products', JSON.stringify(this.products))
            localStorage.setItem('bp_savings_flex_vault', JSON.stringify(this.blocFlexVault))
            localStorage.setItem('bp_savings_lock_plans', JSON.stringify(this.lockPlans))
            localStorage.setItem('bp_savings_goal_plans', JSON.stringify(this.goalPlans))
            localStorage.setItem('bp_savings_round_rule', JSON.stringify(this.roundRule))
            localStorage.setItem('bp_savings_vaults', JSON.stringify(this.vaults))
        },

        _isFresh(key, ttlMs = 300_000) {
            return this._loadedAt[key] && (Date.now() - this._loadedAt[key] < ttlMs)
        },

        // ─── Fetchers ─────────────────────────────────────────────────────────────

        async fetchOverview(force = false) {
            if (!force && this._isFresh('overview')) return
            this.isLoadingOverview = true
            this.overviewError = null
            try {
                const { data } = await savingsApi.getOverview()
                this.overview = data.data           // { total_balance, total_locked, breakdown[] }
                this._loadedAt.overview = Date.now()
                this._persist()
            } catch (err) {
                this.overviewError = err?.response?.data?.message ?? err.message
            } finally {
                this.isLoadingOverview = false
            }
        },

        async fetchProducts(force = false) {
            if (!force && this._isFresh('products', 3_600_000)) return
            this.isLoadingProducts = true
            this.productsError = null
            try {
                const { data } = await savingsApi.getProducts()
                this.products = data.data           // array of product configs
                this._loadedAt.products = Date.now()
                this._persist()
            } catch (err) {
                this.productsError = err?.response?.data?.message ?? err.message
            } finally {
                this.isLoadingProducts = false
            }
        },

        async fetchBlocFlex(force = false) {
            if (!force && this._isFresh('flex')) return
            this.isLoadingFlex = true
            try {
                const { data } = await savingsApi.getBlocFlexVault()
                this.blocFlexVault = data.data      // { id, vault_ref, available_balance, … }
                this._loadedAt.flex = Date.now()
                this._persist()
            } catch {
                // BlocFlex vault may not exist yet for brand-new agents
                this.blocFlexVault = null
            } finally {
                this.isLoadingFlex = false
            }
        },

        async fetchLockPlans(force = false) {
            if (!force && this._isFresh('lockPlans')) return
            this.isLoadingLockPlans = true
            try {
                const { data } = await savingsApi.getBlocLockPlans()
                this.lockPlans = data.data          // array of BlocLockPlanResource
                this._loadedAt.lockPlans = Date.now()
                this._persist()
            } finally {
                this.isLoadingLockPlans = false
            }
        },

        async fetchGoalPlans(force = false) {
            if (!force && this._isFresh('goalPlans')) return
            this.isLoadingGoalPlans = true
            try {
                const { data } = await savingsApi.getBlocGoalPlans()
                this.goalPlans = data.data          // array of BlocGoalPlanResource
                this._loadedAt.goalPlans = Date.now()
                this._persist()
            } finally {
                this.isLoadingGoalPlans = false
            }
        },

        async fetchRoundRule(force = false) {
            if (!force && this._isFresh('roundRule')) return
            this.isLoadingRoundRule = true
            try {
                const { data } = await savingsApi.getBlocRoundRule()
                this.roundRule = data.data          // BlocRoundRuleResource
                this._loadedAt.roundRule = Date.now()
                this._persist()
            } catch {
                // 404 is acceptable — agent hasn't set up BlocRound yet
                this.roundRule = null
            } finally {
                this.isLoadingRoundRule = false
            }
        },

        async fetchVaults(force = false) {
            if (!force && this._isFresh('vaults')) return
            this.isLoadingVaults = true
            try {
                const { data } = await savingsApi.getVaults()
                this.vaults = data.data             // array of active SavingsVaultResource
                this._loadedAt.vaults = Date.now()
                this._persist()
            } finally {
                this.isLoadingVaults = false
            }
        },

        /**
         * Fetch paginated savings transaction history.
         * Response: { data: [...], meta: { current_page, last_page, total } }
         */
        async fetchTransactions(page = 1, filters = {}) {
            this.transactions.loading = true
            try {
                const { data } = await savingsApi.getTransactions({ page, ...filters })
                this.transactions.data = data.data            // array of SavingsTransactionResource
                this.transactions.currentPage = data.meta.current_page
                this.transactions.lastPage = data.meta.last_page
                this.transactions.total = data.meta.total
            } catch {
                // handled by axios interceptor
            } finally {
                this.transactions.loading = false
            }
        },

        // ─── Mutations ────────────────────────────────────────────────────────────

        /** Fund the BlocFlex vault — returns the updated vault */
        async fundFlex(amount) {
            const { data } = await savingsApi.fundBlocFlex(amount)
            this.blocFlexVault = data.data
            await this.fetchOverview(true)
            this._persist()
            this._refreshNotificationsAfterAction()
            return data.data
        },

        /** Withdraw from BlocFlex — returns the updated vault */
        async withdrawFlex(amount) {
            const { data } = await savingsApi.withdrawBlocFlex(amount)
            this.blocFlexVault = data.data
            await this.fetchOverview(true)
            this._persist()
            return data.data
        },

        /** Create a BlocLock plan — returns new plan */
        async createLock(payload) {
            const { data } = await savingsApi.createBlocLock(payload)
            await this.fetchLockPlans(true)
            await this.fetchOverview(true)
            this._refreshNotificationsAfterAction()
            return data.data
        },

        /** Break a BlocLock plan early — returns updated plan */
        async breakLock(planRef) {
            const { data } = await savingsApi.breakBlocLock(planRef)
            await this.fetchLockPlans(true)
            await this.fetchBlocFlex(true)       // payout lands in BlocFlex
            await this.fetchOverview(true)
            this._refreshNotificationsAfterAction()
            return data.data
        },

        /** Create a BlocGoal plan — returns new plan */
        async createGoal(payload) {
            const { data } = await savingsApi.createBlocGoal(payload)
            await this.fetchGoalPlans(true)
            this._refreshNotificationsAfterAction()
            return data.data
        },

        /** Fund a BlocGoal plan — returns updated plan */
        async fundGoal(goalRef, amount) {
            const { data } = await savingsApi.fundBlocGoal(goalRef, amount)
            // Patch in-memory plan rather than full reload for speed
            const idx = this.goalPlans.findIndex(p => p.goal_ref === goalRef)
            if (idx >= 0) this.goalPlans[idx] = data.data
            await this.fetchOverview(true)
            this._persist()
            this._refreshNotificationsAfterAction()
            return data.data
        },

        /** Withdraw from a BlocGoal plan — returns updated plan */
        async withdrawGoal(goalRef, amount) {
            const { data } = await savingsApi.withdrawBlocGoal(goalRef, amount)
            const idx = this.goalPlans.findIndex(p => p.goal_ref === goalRef)
            if (idx >= 0) this.goalPlans[idx] = data.data
            await this.fetchOverview(true)
            this._persist()
            return data.data
        },

        /** Toggle auto-save for a goal; optionally update the rule */
        async toggleAutoSave(goalRef, autoSaveRule = null) {
            const { data } = await savingsApi.toggleAutoSave(goalRef, autoSaveRule)
            const idx = this.goalPlans.findIndex(p => p.goal_ref === goalRef)
            if (idx >= 0) this.goalPlans[idx] = data.data
            this._persist()
            return data.data
        },

        /**
         * Extend a goal's target date and/or raise its target amount.
         * Re-activates expired goals so funding can resume.
         *
         * @param {string}      goalRef
         * @param {string|null} targetDate   ISO date YYYY-MM-DD or null
         * @param {number|null} targetAmount Optional new higher savings target
         */
        async extendGoal(goalRef, targetDate = null, targetAmount = null) {
            const { data } = await savingsApi.extendBlocGoal(goalRef, targetDate, targetAmount)
            const idx = this.goalPlans.findIndex(p => p.goal_ref === goalRef)
            if (idx >= 0) this.goalPlans[idx] = data.data
            await this.fetchOverview(true)
            this._persist()
            return data.data
        },

        /** Create the initial BlocRound rule */
        async createRoundRule(payload) {
            const { data } = await savingsApi.createBlocRoundRule(payload)
            this.roundRule = data.data
            this._persist()
            return data.data
        },

        /** Update BlocRound rule config (rounding mode, caps) */
        async updateRoundRule(payload) {
            const { data } = await savingsApi.updateBlocRoundRule(payload)
            this.roundRule = data.data
            this._persist()
            return data.data
        },

        /** Toggle BlocRound master on/off */
        async toggleRoundRule() {
            const { data } = await savingsApi.toggleRoundRule()
            this.roundRule = data.data
            this._persist()
            return data.data
        },

        /** Toggle an individual BlocRound trigger (transfer_out, bill_payment, …) */
        async toggleRoundTrigger(triggerType) {
            const { data } = await savingsApi.toggleBlocRoundTrigger(triggerType)
            this.roundRule = data.data
            this._persist()
            return data.data
        },

        // ─── Bulk Refresh ─────────────────────────────────────────────────────────

        /**
         * Refresh the full savings dashboard in parallel.
         * Called on page mount and after any mutation that affects balances.
         */
        async refreshAll() {
            await Promise.all([
                this.fetchOverview(true),
                this.fetchBlocFlex(true),
                this.fetchLockPlans(true),
                this.fetchGoalPlans(true),
                this.fetchRoundRule(true),
                this.fetchVaults(true),
            ])
        },

        /**
         * Refresh the notification bell after a mutating savings action.
         * Uses a 2.5s delay to allow the queue worker to process and deliver
         * the SavedSavingsNotification job before we fetch.
         *
         * @private
         */
        _refreshNotificationsAfterAction() {
            setTimeout(async () => {
                try {
                    const dashStore = useDashboardStore()
                    await dashStore.fetchNotifications()
                } catch {
                    // Silently ignore — bell will refresh on next dashboard load
                }
            }, 2500)
        },
    },
})

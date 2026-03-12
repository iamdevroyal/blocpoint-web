import apiClient from './axios'

/**
 * Savings Module API wrapper.
 * Interacts with /api/v1/savings/* endpoints.
 */
export default {
  // ─── Global ────────────────────────────────────────────────────────────────

  /**
   * Get main savings dashboard data (total balance, interest, active vaults).
   */
  getOverview() {
    return apiClient.get('/savings/overview')
  },

  /**
   * Get all savings products (BlocFlex, BlocLock, etc.) with current rates.
   */
  getProducts() {
    return apiClient.get('/savings/products')
  },

  /**
   * Get all active vaults for the current user.
   */
  getVaults() {
    return apiClient.get('/savings/vaults')
  },

  /**
   * Get paginated transaction history for all savings.
   */
  getTransactions(params = {}) {
    return apiClient.get('/savings/transactions', { params })
  },

  // ─── BlocFlex ──────────────────────────────────────────────────────────────

  /**
   * Fund the liquid BlocFlex vault.
   */
  fundBlocFlex(amount) {
    return apiClient.post('/savings/blocflex/fund', { amount })
  },

  /**
   * Withdraw from the liquid BlocFlex vault to main wallet.
   */
  withdrawBlocFlex(amount) {
    return apiClient.post('/savings/blocflex/withdraw', { amount })
  },

  // ─── BlocLock ──────────────────────────────────────────────────────────────

  /**
   * Create a new time-locked savings plan.
   */
  createBlocLock(data) {
    return apiClient.post('/savings/bloclock/create', data)
  },

  /**
   * Break a lock plan early (forfeits interest).
   */
  breakBlocLock(planRef) {
    return apiClient.post(`/savings/bloclock/break`, { plan_ref: planRef })
  },

  // ─── BlocGoal ──────────────────────────────────────────────────────────────

  /**
   * Create a new goal-based savings plan.
   */
  createBlocGoal(data) {
    return apiClient.post('/savings/blocgoal/create', data)
  },

  /**
   * Add funds specifically to a goal.
   */
  fundBlocGoal(goalRef, amount) {
    return apiClient.post(`/savings/blocgoal/fund`, { goal_ref: goalRef, amount })
  },

  /**
   * Withdraw from an achieved or partially-funded goal.
   */
  withdrawBlocGoal(goalRef, amount) {
    return apiClient.post(`/savings/blocgoal/withdraw`, { goal_ref: goalRef, amount })
  },

  /**
   * Toggle the auto-save feature for a goal.
   */
  toggleAutoSave(goalRef) {
    return apiClient.post(`/savings/blocgoal/toggle-autosave`, { goal_ref: goalRef })
  },

  // ─── BlocRound ─────────────────────────────────────────────────────────────

  /**
   * Get the user's BlocRound configuration.
   */
  getBlocRoundRule() {
    return apiClient.get('/savings/blocround/rules')
  },

  /**
   * Update master rounding mode or amounts.
   */
  updateBlocRoundRule(data) {
    return apiClient.post('/savings/blocround/rules', data)
  },

  /**
   * Toggle a specific trigger (transfer_out, bill_payment, card_spend, inflow).
   */
  toggleBlocRoundTrigger(triggerType) {
    return apiClient.post('/savings/blocround/rules/toggle-trigger', { trigger_type: triggerType })
  },

  /**
   * Master toggle for BlocRound rule.
   */
  toggleRoundRule() {
    return apiClient.post('/savings/blocround/rules/toggle')
  },
}

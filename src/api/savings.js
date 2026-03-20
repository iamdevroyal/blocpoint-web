import apiClient from './axios'

/**
 * Savings Module API wrapper.
 *
 * All mutating calls (POST) automatically attach an Idempotency-Key header
 * so that network retries never double-process a savings operation.
 *
 * Base prefix: /api/v1/savings/*
 */

/** Returns a function that adds an Idempotency-Key to every mutating request. */
function withIdempotency(config = {}) {
  let key
  try {
    key = crypto.randomUUID()
  } catch (e) {
    key = Date.now().toString() + Math.random().toString(36).substring(2, 10)
  }

  return {
    ...config,
    headers: {
      ...(config.headers || {}),
      'Idempotency-Key': key,
    },
  }
}

export default {
  // ─── Global ────────────────────────────────────────────────────────────────

  /** GET /savings/overview — aggregated balances + breakdown per product */
  getOverview() {
    return apiClient.get('/savings/overview')
  },

  /** GET /savings/products — all active savings products with rates */
  getProducts() {
    return apiClient.get('/savings/products')
  },

  /**
   * GET /savings/blocflex — BlocFlex vault snapshot (available_balance, accrued)
   * Used by the store to get the default liquid saving vault.
   */
  getBlocFlexVault() {
    return apiClient.get('/savings/blocflex')
  },

  /** GET /savings/transactions — paginated cross-product savings history */
  getTransactions(params = {}) {
    return apiClient.get('/savings/transactions', { params })
  },

  /** GET /savings/vaults — all active saving vaults */
  getVaults() {
    return apiClient.get('/savings/vaults')
  },

  // ─── BlocFlex ──────────────────────────────────────────────────────────────

  /** POST /savings/blocflex/fund */
  fundBlocFlex(amount) {
    return apiClient.post('/savings/blocflex/fund', { amount }, withIdempotency())
  },

  /** POST /savings/blocflex/withdraw */
  withdrawBlocFlex(amount) {
    return apiClient.post('/savings/blocflex/withdraw', { amount }, withIdempotency())
  },

  /** GET /savings/blocflex/history */
  getBlocFlexHistory(params = {}) {
    return apiClient.get('/savings/blocflex/history', { params })
  },

  // ─── BlocLock ──────────────────────────────────────────────────────────────

  /** GET /savings/bloclock/plans — all agent lock plans */
  getBlocLockPlans() {
    return apiClient.get('/savings/bloclock/plans')
  },

  /** GET /savings/bloclock/{planRef} — single plan detail */
  getBlocLockPlan(planRef) {
    return apiClient.get(`/savings/bloclock/${planRef}`)
  },

  /** POST /savings/bloclock/create — {amount, tenure_days} */
  createBlocLock(data) {
    return apiClient.post('/savings/bloclock/create', data, withIdempotency())
  },

  /** POST /savings/bloclock/break — {plan_ref} */
  breakBlocLock(planRef) {
    return apiClient.post('/savings/bloclock/break', { plan_ref: planRef }, withIdempotency())
  },

  // ─── BlocGoal ──────────────────────────────────────────────────────────────

  /** GET /savings/blocgoal/plans — all agent goal plans */
  getBlocGoalPlans() {
    return apiClient.get('/savings/blocgoal/plans')
  },

  /** GET /savings/blocgoal/{goalRef} — single goal detail */
  getBlocGoalPlan(goalRef) {
    return apiClient.get(`/savings/blocgoal/${goalRef}`)
  },

  /** POST /savings/blocgoal/create — {goal_name, target_amount, target_date?, auto_save_rule?} */
  createBlocGoal(data) {
    return apiClient.post('/savings/blocgoal/create', data, withIdempotency())
  },

  /** POST /savings/blocgoal/fund — {goal_ref, amount} */
  fundBlocGoal(goalRef, amount) {
    return apiClient.post('/savings/blocgoal/fund', { goal_ref: goalRef, amount }, withIdempotency())
  },

  /** POST /savings/blocgoal/withdraw — {goal_ref, amount} */
  withdrawBlocGoal(goalRef, amount) {
    return apiClient.post('/savings/blocgoal/withdraw', { goal_ref: goalRef, amount }, withIdempotency())
  },

  /** POST /savings/blocgoal/toggle-autosave — {goal_ref, auto_save_rule?} */
  toggleAutoSave(goalRef, autoSaveRule = null) {
    const payload = { goal_ref: goalRef }
    if (autoSaveRule) payload.auto_save_rule = autoSaveRule
    return apiClient.post('/savings/blocgoal/toggle-autosave', payload, withIdempotency())
  },

  /**
   * POST /savings/blocgoal/extend — extend target date and/or raise target amount.
   * Re-activates expired goals so funding can resume.
   * @param {string}      goalRef
   * @param {string|null} targetDate   ISO date YYYY-MM-DD or null to remove deadline
   * @param {number|null} targetAmount Optional new (higher) savings target
   */
  extendBlocGoal(goalRef, targetDate = null, targetAmount = null) {
    const payload = { goal_ref: goalRef }
    if (targetDate)   payload.target_date   = targetDate
    if (targetAmount) payload.target_amount = targetAmount
    return apiClient.post('/savings/blocgoal/extend', payload, withIdempotency())
  },

  // ─── BlocRound ─────────────────────────────────────────────────────────────

  /** GET /savings/blocround/rules — agent's round-up rule */
  getBlocRoundRule() {
    return apiClient.get('/savings/blocround/rules')
  },

  /** POST /savings/blocround/rules — create rule {rounding_mode, rounding_value, daily_cap?, monthly_cap?} */
  createBlocRoundRule(data) {
    return apiClient.post('/savings/blocround/rules', data, withIdempotency())
  },

  /** PUT /savings/blocround/rules — update rule */
  updateBlocRoundRule(data) {
    return apiClient.put('/savings/blocround/rules', data)
  },

  /** POST /savings/blocround/toggle — master on/off toggle */
  toggleRoundRule() {
    return apiClient.post('/savings/blocround/toggle', {}, withIdempotency())
  },

  /**
   * POST /savings/blocround/toggle-trigger — enable/disable a specific trigger
   * @param {string} triggerType  'transfer_out' | 'bill_payment' | 'card_spend' | 'inflow'
   */
  toggleBlocRoundTrigger(triggerType) {
    return apiClient.post('/savings/blocround/toggle-trigger', { trigger_type: triggerType }, withIdempotency())
  },

  /** GET /savings/blocround/history */
  getBlocRoundHistory(params = {}) {
    return apiClient.get('/savings/blocround/history', { params })
  },
}

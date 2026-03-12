/**
 * Tax API Module — wraps all Compliance/Tax backend endpoints.
 *
 * All calls go through the configured Axios instance (which handles
 * auth headers, idempotency keys, and offline blocking).
 */
import apiClient from './axios'

// ─── Agent-Facing Tax Endpoints ─────────────────────────────────────────────

/**
 * GET /tax/dashboard
 * Returns current-period income, estimated tax liability, and summary stats.
 *
 * @returns {Promise<{current_month_income, estimated_tax, tax_by_type, period}>}
 */
export const getTaxDashboard = () => apiClient.get('/tax/dashboard')

/**
 * GET /tax/records
 * Paginated list of TaxRecord rows for the authenticated agent.
 *
 * @param {Object} params - { year?, month?, income_type?, page?, per_page? }
 * @returns {Promise<{data: TaxRecord[], meta: PaginationMeta}>}
 */
export const getTaxRecords = (params = {}) => apiClient.get('/tax/records', { params })

/**
 * GET /tax/summary/{period}
 * Returns an aggregated TaxSummary for a given period.
 *
 * @param {string} period - "2026-01", "2026-Q1", or "2026"
 * @returns {Promise<TaxSummary>}
 */
export const getTaxSummary = (period) => apiClient.get(`/tax/summary/${period}`)

/**
 * GET /tax/reports
 * Returns all monthly TaxSummaries for the current year.
 *
 * @param {Object} params - { year? }
 * @returns {Promise<TaxSummary[]>}
 */
export const getTaxReports = (params = {}) => apiClient.get('/tax/reports', { params })

/**
 * GET /tax/settings
 * Returns the agent's TaxConfiguration (TIN, frequency, auto-remittance).
 *
 * @returns {Promise<TaxConfiguration>}
 */
export const getTaxSettings = () => apiClient.get('/tax/settings')

/**
 * PUT /tax/settings
 * Updates the agent's TaxConfiguration.
 *
 * @param {Object} data - { tin?, filing_frequency?, auto_remittance? }
 * @returns {Promise<TaxConfiguration>}
 */
export const updateTaxSettings = (data) => apiClient.put('/tax/settings', data)

/**
 * GET /tax/submissions
 * Returns a list of FIRS submission history for the agent.
 *
 * @returns {Promise<FIRSSubmission[]>}
 */
export const getTaxSubmissions = () => apiClient.get('/tax/submissions')

/**
 * GET /tax/submissions/{id}/receipt
 * Returns a PDF download URL or blob for a specific FIRS submission.
 *
 * @param {string} submissionId
 * @returns {Promise<Blob>}
 */
export const downloadTaxReceipt = (submissionId) =>
    apiClient.get(`/tax/submissions/${submissionId}/receipt`, { responseType: 'blob' })

/**
 * POST /tax/remit
 * Initiates a FIRS tax remittance for the current period.
 *
 * @param {Object} data - { period_month, period_year, tin }
 * @returns {Promise<FIRSSubmission>}
 */
export const remitTax = (data) => apiClient.post('/tax/remit', data)

/**
 * GET /tax/reports/export
 * Export annual tax report as CSV, PDF, or Excel.
 *
 * @param {Object} params - { format: 'csv'|'pdf'|'excel', year? }
 * @returns {Promise<Blob>}
 */
export const exportTaxReport = (params) =>
    apiClient.get('/tax/reports/export', { params, responseType: 'blob' })

// ─── Tax Evaluation (Transaction-Level) ─────────────────────────────────────

/**
 * POST /tax/evaluate
 * Evaluate VAT and EMTL for a pending transaction.
 *
 * @param {Object} data - { product_type, principal, fee, currency?, transaction_id? }
 * @returns {Promise<{vat, emtl, total_tax, total_debit, breakdown, event_ids}>}
 */
export const evaluateTax = (data) => apiClient.post('/tax/evaluate', data)

/**
 * POST /tax/reserve
 * Reserve assessed tax events after a transaction is committed.
 *
 * @param {string[]} eventIds - UUIDs from evaluateTax() response
 * @returns {Promise<void>}
 */
export const reserveTaxEvents = (eventIds) =>
    apiClient.post('/tax/reserve', { event_ids: eventIds })

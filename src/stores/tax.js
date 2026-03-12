/**
 * Tax Store — Pinia store for all compliance / tax state.
 *
 * Wraps the Tax API module and provides reactive state for Tax.vue,
 * TaxDetailModal.vue, and any other component that needs tax data.
 *
 * State shape mirrors the backend API response structure so that
 * templates can bind directly to store properties without mapping.
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
    getTaxDashboard,
    getTaxRecords,
    getTaxSummary,
    getTaxReports,
    getTaxSettings,
    updateTaxSettings,
    getTaxSubmissions,
    downloadTaxReceipt,
    remitTax,
} from '../api/tax'

export const useTaxStore = defineStore('tax', () => {
    // ─── State ────────────────────────────────────────────────────────────────

    /** @type {import('vue').Ref<object|null>} */
    const dashboard = ref(null)

    /** @type {import('vue').Ref<object[]>} */
    const records = ref([])

    /** @type {import('vue').Ref<object|null>} */
    const recordsMeta = ref(null)

    /** @type {import('vue').Ref<object[]>} */
    const reports = ref([])

    /** @type {import('vue').Ref<object|null>} */
    const settings = ref(null)

    /** @type {import('vue').Ref<object[]>} */
    const submissions = ref([])

    /** @type {import('vue').Ref<boolean>} */
    const loading = ref(false)

    /** @type {import('vue').Ref<string|null>} */
    const error = ref(null)

    // ─── Computed ─────────────────────────────────────────────────────────────

    /**
     * Current month income from dashboard data.
     * @type {import('vue').ComputedRef<number>}
     */
    const currentMonthIncome = computed(() => dashboard.value?.current_month_income ?? 0)

    /**
     * Estimated tax liability from dashboard data.
     * @type {import('vue').ComputedRef<number>}
     */
    const estimatedTax = computed(() => dashboard.value?.estimated_tax ?? 0)

    /**
     * Percentage of monthly tax threshold reached (0-100).
     * @type {import('vue').ComputedRef<number>}
     */
    const taxThresholdPercent = computed(() => {
        const income = currentMonthIncome.value
        const monthly = dashboard.value?.monthly_threshold ?? 1_000_000
        return Math.min(100, Math.round((income / monthly) * 100))
    })

    /**
     * Auto-remittance enabled status.
     * @type {import('vue').ComputedRef<boolean>}
     */
    const autoRemittanceEnabled = computed(() => settings.value?.auto_remittance ?? false)

    // ─── Actions ──────────────────────────────────────────────────────────────

    /**
     * Fetch the tax dashboard metrics.
     * @returns {Promise<void>}
     */
    async function fetchDashboard() {
        loading.value = true
        error.value = null
        try {
            const { data } = await getTaxDashboard()
            dashboard.value = data.data ?? data
        } catch (err) {
            error.value = err?.response?.data?.message ?? 'Failed to load tax dashboard.'
        } finally {
            loading.value = false
        }
    }

    /**
     * Fetch paginated tax records.
     *
     * @param {Object} params - { year?, month?, income_type?, page?, per_page? }
     * @returns {Promise<void>}
     */
    async function fetchRecords(params = {}) {
        loading.value = true
        error.value = null
        try {
            const { data } = await getTaxRecords(params)
            records.value = data.data ?? data
            recordsMeta.value = data.meta ?? null
        } catch (err) {
            error.value = err?.response?.data?.message ?? 'Failed to load tax records.'
        } finally {
            loading.value = false
        }
    }

    /**
     * Fetch all monthly TaxSummaries for a given year.
     *
     * @param {number} year
     * @returns {Promise<void>}
     */
    async function fetchReports(year) {
        loading.value = true
        error.value = null
        try {
            const { data } = await getTaxReports({ year })
            reports.value = data.data ?? data
        } catch (err) {
            error.value = err?.response?.data?.message ?? 'Failed to load tax reports.'
        } finally {
            loading.value = false
        }
    }

    /**
     * Fetch the agent's tax configuration settings.
     * @returns {Promise<void>}
     */
    async function fetchSettings() {
        loading.value = true
        error.value = null
        try {
            const { data } = await getTaxSettings()
            settings.value = data.data ?? data
        } catch (err) {
            error.value = err?.response?.data?.message ?? 'Failed to load tax settings.'
        } finally {
            loading.value = false
        }
    }

    /**
     * Update the agent's tax configuration settings.
     *
     * @param {Object} payload - Fields to update
     * @returns {Promise<void>}
     */
    async function saveSettings(payload) {
        loading.value = true
        error.value = null
        try {
            const { data } = await updateTaxSettings(payload)
            settings.value = data.data ?? data
        } catch (err) {
            error.value = err?.response?.data?.message ?? 'Failed to update tax settings.'
            throw err
        } finally {
            loading.value = false
        }
    }

    /**
     * Fetch FIRS submission history.
     * @returns {Promise<void>}
     */
    async function fetchSubmissions() {
        loading.value = true
        error.value = null
        try {
            const { data } = await getTaxSubmissions()
            submissions.value = data.data ?? data
        } catch (err) {
            error.value = err?.response?.data?.message ?? 'Failed to load submissions.'
        } finally {
            loading.value = false
        }
    }

    /**
     * Download a PDF receipt for a FIRS submission.
     *
     * Triggers a browser download by creating a temporary anchor element.
     *
     * @param {string} submissionId
     * @param {string} filename
     * @returns {Promise<void>}
     */
    async function downloadReceipt(submissionId, filename = 'tax-receipt.pdf') {
        loading.value = true
        error.value = null
        try {
            const { data } = await downloadTaxReceipt(submissionId)
            const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
            const link = document.createElement('a')
            link.href = url
            link.download = filename
            link.click()
            URL.revokeObjectURL(url)
        } catch (err) {
            error.value = err?.response?.data?.message ?? 'Failed to download receipt.'
        } finally {
            loading.value = false
        }
    }

    /**
     * Submit a tax remittance to FIRS.
     *
     * @param {Object} payload - { period_month, period_year, tin }
     * @returns {Promise<object>} The created FIRSSubmission
     */
    async function submitRemittance(payload) {
        loading.value = true
        error.value = null
        try {
            const { data } = await remitTax(payload)
            // Refresh submissions after successful remittance
            await fetchSubmissions()
            return data.data ?? data
        } catch (err) {
            error.value = err?.response?.data?.message ?? 'Remittance failed. Please try again.'
            throw err
        } finally {
            loading.value = false
        }
    }

    /**
     * Load all data needed for the Tax page in parallel.
     * Calls dashboard + records + settings concurrently.
     *
     * @returns {Promise<void>}
     */
    async function loadTaxPage() {
        await Promise.allSettled([
            fetchDashboard(),
            fetchRecords({ per_page: 20 }),
            fetchSettings(),
        ])
    }

    return {
        // state
        dashboard,
        records,
        recordsMeta,
        reports,
        settings,
        submissions,
        loading,
        error,
        // computed
        currentMonthIncome,
        estimatedTax,
        taxThresholdPercent,
        autoRemittanceEnabled,
        // actions
        fetchDashboard,
        fetchRecords,
        fetchReports,
        fetchSettings,
        saveSettings,
        fetchSubmissions,
        downloadReceipt,
        submitRemittance,
        loadTaxPage,
    }
})

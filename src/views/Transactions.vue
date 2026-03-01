<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../components/layout/AppShell.vue'
import apiClient from '../api/axios'

const router = useRouter()

// ─── Filter state ──────────────────────────────────────────────────────────────

/**
 * UI filter tabs map to backend query params.
 * type=null means "All" (no type filter applied)
 */
const FILTER_TABS = [
  { label: 'All',       type: null,                direction: null   },
  { label: 'Received',  type: null,                direction: 'credit' },
  { label: 'Sent',      type: null,                direction: 'debit'  },
  { label: 'Transfers', type: 'internal_transfer', direction: null   },
  { label: 'Conversion',type: 'conversion',        direction: null   },
]

const activeTab      = ref(0)
const dateFrom       = ref('')
const dateTo         = ref('')
const showDateFilter = ref(false)

// ─── Data state ────────────────────────────────────────────────────────────────

const transactions   = ref([])
const isLoading      = ref(false)
const hasMore        = ref(false)
const currentPage    = ref(1)
const error          = ref(null)

// ─── Detail drawer ─────────────────────────────────────────────────────────────

const selectedTx  = ref(null)
const showDetail  = ref(false)

// ─── Export modal ──────────────────────────────────────────────────────────────

const showExportModal = ref(false)
const isExporting     = ref(false)
const exportRange     = ref('Last 30 Days')
const exportChannel   = ref('Download')

// ─── Helpers ───────────────────────────────────────────────────────────────────

const currencySymbols = { NGN: '₦', KES: 'KSh', GHS: 'GH₵', USD: '$' }

const symFor = (currency) => currencySymbols[currency?.toUpperCase()] ?? currency ?? ''

const typeLabel = (type) => ({
  transfer:          'Bank Transfer',
  internal_transfer: 'BlocPoint P2P',
  conversion:        'Currency Conversion',
  payment:           'Payment',
  cash_in:           'Cash In',
  cash_out:          'Cash Out',
  stablecoin_buy:    'Crypto Buy',
  stablecoin_sell:   'Crypto Sell',
}[type] ?? type)

const typeIcon = (type) => ({
  transfer:          '🏦',
  internal_transfer: '🔄',
  conversion:        '💱',
  payment:           '💳',
  cash_in:           '📥',
  cash_out:          '📤',
  stablecoin_buy:    '🪙',
  stablecoin_sell:   '🪙',
}[type] ?? '📋')

// ─── API call ──────────────────────────────────────────────────────────────────

const buildParams = (page = 1, overrides = {}) => {
  const tab = FILTER_TABS[activeTab.value]
  const params = { page, per_page: 20 }
  if (tab.type)      params.type      = tab.type
  if (tab.direction) params.direction = tab.direction
  if (dateFrom.value) params.date_from = dateFrom.value
  if (dateTo.value)   params.date_to   = dateTo.value
  return { ...params, ...overrides }
}

const loadTransactions = async (reset = true) => {
  if (isLoading.value) return
  if (reset) { transactions.value = []; currentPage.value = 1 }

  isLoading.value = true
  error.value = null

  try {
    const { data } = await apiClient.get('/transactions', { params: buildParams(currentPage.value) })
    const payload = data.data ?? data
    // Handle Laravel pagination envelope: { data: [...], meta: { last_page, ... } }
    const rows  = Array.isArray(payload) ? payload : (payload.data ?? [])
    const meta  = Array.isArray(payload) ? null    : (payload.meta ?? null)

    if (reset) {
      transactions.value = rows
    } else {
      transactions.value.push(...rows)
    }

    hasMore.value = meta ? currentPage.value < meta.last_page : false
    currentPage.value++
  } catch (err) {
    error.value = err?.response?.data?.message ?? 'Could not load transactions.'
  } finally {
    isLoading.value = false
  }
}

const loadMore = () => loadTransactions(false)

// ─── Filter changes re-fetch ────────────────────────────────────────────────────

watch(activeTab, () => loadTransactions())
watch([dateFrom, dateTo], () => {
  if (dateFrom.value || dateTo.value) loadTransactions()
})

// ─── Detail ────────────────────────────────────────────────────────────────────

const openDetail = (tx) => {
  selectedTx.value = tx
  showDetail.value  = true
}

// ─── Export ────────────────────────────────────────────────────────────────────

const rangeParams = computed(() => {
  const today = new Date()
  const fmt   = (d) => d.toISOString().split('T')[0]

  if (exportRange.value === 'Last 7 Days') {
    const from = new Date(today); from.setDate(from.getDate() - 7)
    return { date_from: fmt(from), date_to: fmt(today) }
  }
  if (exportRange.value === 'Last 30 Days') {
    const from = new Date(today); from.setDate(from.getDate() - 30)
    return { date_from: fmt(from), date_to: fmt(today) }
  }
  if (exportRange.value === 'Last 90 Days') {
    const from = new Date(today); from.setDate(from.getDate() - 90)
    return { date_from: fmt(from), date_to: fmt(today) }
  }
  return {}  // "All Time" — no date filter
})

const handleStatementExport = async () => {
  isExporting.value = true
  try {
    const params = new URLSearchParams(rangeParams.value).toString()
    // Use the raw URL so the browser gets a proper file download
    const { data: blob } = await apiClient.get(
      `/transactions/export${params ? '?' + params : ''}`,
      { responseType: 'blob' }
    )
    const url = URL.createObjectURL(blob)
    const a   = document.createElement('a')
    a.href  = url
    a.download = `blocpoint-statement-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showExportModal.value = false
  } catch {
    // silently fail on export — user impact is minimal
  } finally {
    isExporting.value = false
  }
}

const reportIssue = () => {
  if (!selectedTx.value) return
  router.push({
    path: '/app/support',
    query: { ref: selectedTx.value.reference, subject: `Issue with ${typeLabel(selectedTx.value.type)}` }
  })
}

onMounted(() => loadTransactions())
</script>

<template>
  <AppShell title="Transactions">
    <div class="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-28">

      <!-- Header -->
      <div class="flex items-center justify-between px-2">
        <div class="flex items-center gap-4">
          <button @click="router.back()" class="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm active:scale-90 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div>
            <h2 class="text-lg font-bold text-slate-800 dark:text-white">Activity</h2>
            <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">History & Statements</p>
          </div>
        </div>
        <div class="flex gap-2">
          <!-- Date filter toggle -->
          <button @click="showDateFilter = !showDateFilter"
            class="w-10 h-10 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
            :class="(dateFrom || dateTo) ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-500'">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </button>
          <!-- Export -->
          <button @click="showExportModal = true" class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center active:scale-90 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
        </div>
      </div>

      <!-- Date range filter (collapsible) -->
      <Transition name="fade">
        <div v-if="showDateFilter" class="px-2 grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-300">
          <div class="space-y-1">
            <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 block">From</label>
            <input v-model="dateFrom" type="date" class="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl px-3 text-[11px] font-bold outline-none focus:ring-2 focus:ring-primary/20 dark:text-white" />
          </div>
          <div class="space-y-1">
            <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 block">To</label>
            <input v-model="dateTo" type="date" class="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl px-3 text-[11px] font-bold outline-none focus:ring-2 focus:ring-primary/20 dark:text-white" />
          </div>
          <button v-if="dateFrom || dateTo" @click="dateFrom = ''; dateTo = ''; loadTransactions()"
            class="col-span-2 text-[10px] font-black text-red-500 uppercase tracking-widest text-center py-1">
            Clear dates
          </button>
        </div>
      </Transition>

      <!-- Filter tabs -->
      <div class="flex gap-2 overflow-x-auto scrollbar-hide px-2">
        <button
          v-for="(tab, idx) in FILTER_TABS" :key="tab.label"
          @click="activeTab = idx"
          class="px-5 py-2.5 rounded-full text-[11px] font-bold transition-all whitespace-nowrap border"
          :class="activeTab === idx
            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30'
            : 'bg-white/50 dark:bg-slate-900/50 text-slate-500 border-slate-200 dark:border-white/10'"
        >{{ tab.label }}</button>
      </div>

      <!-- Error state -->
      <div v-if="error" class="mx-2 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-center text-[11px] font-bold text-red-500">
        {{ error }}
        <button @click="loadTransactions()" class="block mx-auto mt-2 underline text-[10px]">Retry</button>
      </div>

      <!-- Skeleton loader -->
      <div v-if="isLoading && transactions.length === 0" class="space-y-2 px-2">
        <div v-for="i in 6" :key="i" class="h-20 bg-white/50 dark:bg-slate-900/50 rounded-3xl animate-pulse border border-slate-100 dark:border-white/5" />
      </div>

      <!-- Transaction list -->
      <div v-else-if="transactions.length > 0" class="space-y-2">
        <div class="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden">
          <div
            v-for="(tx, idx) in transactions" :key="tx.id"
            @click="openDetail(tx)"
            class="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 active:scale-[0.99] transition-all group"
            :class="{ 'border-b border-slate-100 dark:border-white/5': idx !== transactions.length - 1 }"
          >
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-xl shadow-sm border border-black/5 dark:border-white/5 group-hover:scale-110 transition-transform shrink-0">
                {{ typeIcon(tx.type) }}
              </div>
              <div>
                <h4 class="text-sm font-bold text-slate-800 dark:text-white">{{ typeLabel(tx.type) }}</h4>
                <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter">
                  {{ tx.formatted_date ?? tx.created_at }}
                  <span v-if="tx.recipient_label"> · {{ tx.recipient_label }}</span>
                </p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-bold tracking-tight"
                :class="tx.direction === 'credit' ? 'text-emerald-500' : 'text-slate-800 dark:text-white'">
                {{ tx.direction === 'credit' ? '+' : '-' }}{{ symFor(tx.currency) }}{{ Number(tx.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
              </p>
              <p class="text-[9px] font-bold uppercase tracking-widest"
                :class="tx.status === 'completed' ? 'text-emerald-500/70' : tx.status === 'pending' ? 'text-amber-500/70' : 'text-red-500/70'">
                {{ tx.status }}
              </p>
            </div>
          </div>
        </div>

        <!-- Load More -->
        <button v-if="hasMore" @click="loadMore" :disabled="isLoading"
          class="w-full h-14 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-3xl text-[11px] font-black text-slate-500 uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50">
          {{ isLoading ? 'Loading…' : 'Load More' }}
        </button>
      </div>

      <!-- Empty state -->
      <div v-else-if="!isLoading" class="py-20 text-center animate-in fade-in duration-500">
        <div class="text-4xl mb-4 opacity-20">📂</div>
        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">No transactions found</p>
        <p class="text-[10px] text-slate-300 mt-1">Try adjusting your filters</p>
      </div>
    </div>

    <!-- ── Transaction Detail Drawer ─────────────────────────────────────────── -->
    <Transition name="drawer-right">
      <div v-if="showDetail && selectedTx" class="fixed inset-0 z-[150] flex justify-end">
        <div class="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" @click="showDetail = false" />
        <div class="relative w-[85%] max-w-sm h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-white/10 overflow-hidden">
          <div class="p-8 space-y-8 flex-1 overflow-y-auto pt-12">

            <!-- Header -->
            <div class="flex items-start justify-between">
              <div>
                <h3 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">Transaction Detail</h3>
                <p class="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">{{ typeLabel(selectedTx.type) }}</p>
              </div>
              <button @click="showDetail = false" class="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 border border-black/5 dark:border-white/5">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <!-- Amount card -->
            <div class="p-8 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-slate-100 dark:border-white/5 text-center space-y-1 relative overflow-hidden">
              <div class="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">
                {{ selectedTx.direction === 'credit' ? 'Amount Received' : 'Amount Sent' }}
              </p>
              <p class="text-4xl font-black tracking-tighter relative z-10"
                :class="selectedTx.direction === 'credit' ? 'text-emerald-500' : 'text-slate-800 dark:text-white'">
                {{ selectedTx.direction === 'credit' ? '+' : '-' }}{{ symFor(selectedTx.currency) }}{{ Number(selectedTx.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
              </p>
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full mt-4 relative z-10"
                :class="selectedTx.status === 'completed' ? 'bg-emerald-500/10' : 'bg-amber-500/10'">
                <div class="w-1.5 h-1.5 rounded-full animate-pulse"
                  :class="selectedTx.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'" />
                <span class="text-[9px] font-black uppercase tracking-widest"
                  :class="selectedTx.status === 'completed' ? 'text-emerald-500' : 'text-amber-500'">
                  {{ selectedTx.status }}
                </span>
              </div>
            </div>

            <!-- Details -->
            <div class="space-y-5">
              <div v-for="item in [
                { label: 'Reference',    value: selectedTx.reference },
                { label: 'Date & Time',  value: selectedTx.formatted_date ?? selectedTx.created_at },
                { label: 'Currency',     value: selectedTx.currency },
                { label: 'Amount',       value: symFor(selectedTx.currency) + Number(selectedTx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) },
                { label: 'Fee',          value: symFor(selectedTx.currency) + Number(selectedTx.fee).toLocaleString('en-US', { minimumFractionDigits: 2 }) },
                { label: 'Recipient',    value: selectedTx.recipient_label ?? selectedTx.metadata?.trx_name ?? '—' },
                { label: 'Narration',    value: selectedTx.metadata?.narration ?? '—' },
              ]" :key="item.label" class="flex justify-between items-center">
                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ item.label }}</span>
                <span class="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 text-right max-w-[55%] break-all">{{ item.value }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="pt-4 space-y-3">
              <button @click="reportIssue"
                class="w-full h-14 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-[10px] font-black rounded-2xl active:scale-95 transition-all uppercase tracking-[0.2em]">
                Report Issue
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── Export Modal ──────────────────────────────────────────────────────── -->
    <Transition name="zoom">
      <div v-if="showExportModal" class="fixed inset-0 z-[200] flex items-center justify-center p-6">
        <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-md" @click="showExportModal = false" />
        <div class="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden">
          <div class="p-8 space-y-6">

            <div class="text-center space-y-2">
              <div class="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">📂</div>
              <h3 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">Export Statement</h3>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Downloads a CSV to your device</p>
            </div>

            <!-- Range -->
            <div class="space-y-3">
              <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Period</label>
              <div class="grid grid-cols-2 gap-3">
                <button v-for="range in ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'All Time']" :key="range"
                  @click="exportRange = range"
                  class="h-12 rounded-xl text-[10px] font-black transition-all border uppercase tracking-widest"
                  :class="exportRange === range ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-500'">
                  {{ range }}
                </button>
              </div>
            </div>

            <!-- Export CTA -->
            <button @click="handleStatementExport" :disabled="isExporting"
              class="w-full h-16 bg-primary text-white text-[11px] font-black rounded-[1.25rem] shadow-xl shadow-primary/30 active:scale-95 transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-50">
              <svg v-if="!isExporting" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>{{ isExporting ? 'Exporting…' : 'Download CSV' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </AppShell>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

.drawer-right-enter-active, .drawer-right-leave-active { transition: all 0.4s cubic-bezier(0.4,0,0.2,1); }
.drawer-right-enter-from, .drawer-right-leave-to      { opacity: 0; transform: translateX(100%); }

.zoom-enter-active, .zoom-leave-active { transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1); }
.zoom-enter-from,   .zoom-leave-to     { opacity: 0; transform: scale(0.9); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from,   .fade-leave-to     { opacity: 0; }
</style>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../components/layout/AppShell.vue'
import { articles } from '../data/knowledge'
import { useDashboardStore } from '../stores/dashboard'
import { useAuthStore } from '../stores/auth'
import { useWalletStore } from '../stores/wallet'
import {
  transactionDisplayName,
  transactionIcon,
  formatTransactionAmount,
  formatBalance,
} from '../utils/transaction'

const router      = useRouter()
const dash        = useDashboardStore()
const auth        = useAuthStore()
const walletStore = useWalletStore()

// ─── UI state ─────────────────────────────────────────────────────────────────

const showBalance          = ref(true)
const activeAlert          = ref(0)
const showAlerts           = ref(true)
const showCurrencyDropdown = ref(false)
const showCopyToast        = ref(false)
// ─── Computed from stores ─────────────────────────────────────────────────────

/** Available balance from the active wallet in the selected currency */
const balance = computed(() => {
  const wallet = walletStore.activeWallet
  if (!wallet) return null
  const symbol = walletStore.activeWalletMeta?.symbol ?? '₦'
  return formatBalance(wallet.available_balance, symbol)
})

/** The currently selected currency display object */
const selectedCurrency = computed(() => walletStore.activeWalletMeta ?? { code: 'NGN', symbol: '₦', name: 'Naira', flag: '🇳🇬' })

/**
 * Account number derived from the agent's phone.
 * Strips +234 prefix (stored format) to produce the 10-digit local number,
 * e.g. +2348012345678 → 8012345678, or 08012345678 → 8012345678.
 * Will be replaced by the real virtual account number once bank integration is live.
 */
const accountNumber = computed(() => {
  const phone = auth.user?.phone ?? ''
  if (phone.startsWith('+234')) return phone.slice(4)          // +2348012... → 8012...
  if (phone.startsWith('0'))   return phone.slice(1)           // 08012...   → 8012...
  return phone || null
})

/**
 * "Last updated" label.
 * The wallet endpoint does not return updated_at so we just show "just now"
 * until the wallet model is extended with that field.
 */
const balanceUpdatedLabel = computed(() => {
  if (dash.isLoadingWallet) return 'Updating…'
  if (!dash.wallet)         return '—'
  return 'just now'
})

/** KYC / status alert cards driven by the agent's status from authStore */
const alerts = computed(() => {
  const list = []
  const status = auth.user?.status

  if (status === 'pending_kyc' || status === 'active') {
    list.push({ id: 1, type: 'kyc',      title: 'KYC Updates',  message: status === 'pending_kyc' ? 'Your KYC is being verified' : 'Keep your KYC up to date',   color: 'amber' })
  }
  list.push({ id: 2, type: 'promo',    title: 'Gift Cards',   message: 'Get 5% cashback on all cards today',      color: 'indigo' })
  list.push({ id: 3, type: 'security', title: 'Security',     message: 'Enable 2FA for better security',           color: 'emerald' })
  list.push({ id: 4, type: 'reward',   title: 'Referrals',    message: 'Earn ₦500 per successful referral',        color: 'rose' })
  return list
})

// ─── Static UI data (UI-only, not from backend) ──────────────────────────────

const services = [
  { name: 'Airtime', color: 'bg-orange-500/10 text-orange-500' },
  { name: 'Data',    color: 'bg-emerald-500/10 text-emerald-500' },
  { name: 'TV',      color: 'bg-blue-500/10 text-blue-500' },
  { name: 'Loan',    color: 'bg-purple-500/10 text-purple-500' },
]

// ─── Handlers ─────────────────────────────────────────────────────────────────

const selectCurrency = async (wallet) => {
  showCurrencyDropdown.value = false
  await walletStore.selectWallet(wallet.currency)
}

const copyAccount = () => {
  if (accountNumber.value) navigator.clipboard.writeText(accountNumber.value)
  showCopyToast.value = true
  setTimeout(() => (showCopyToast.value = false), 2000)
}

const go = (path) => router.push(path)

const openArticle = (article) => router.push(`/app/knowledge/${article.id}`)

const refreshWallet = async () => {
  if (walletStore.activeWallet) {
    await walletStore.fetchBalance(walletStore.activeWallet.currency)
  }
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(() => {
  // Load dashboard data and wallets in parallel
  dash.load()
  walletStore.fetchWallets()
})
</script>

<template>
  <AppShell title="Home">
    <div class="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-x-hidden">

      <!-- Alerts Carousel -->
      <div v-if="showAlerts" class="relative group">
        <div class="flex overflow-x-auto gap-4 scrollbar-hide snap-x pb-2">
          <div
            v-for="alert in alerts"
            :key="alert.id"
            @click="alert.type === 'reward' ? go('/app/refer') : null"
            class="min-w-[85%] snap-center flex items-center justify-between p-4 rounded-2xl border transition-all duration-300"
            :class="[
              alert.color === 'amber'   ? 'bg-amber-50/50 dark:bg-amber-500/10 border-amber-200/50 dark:border-amber-500/20' :
              alert.color === 'indigo'  ? 'bg-indigo-50/50 dark:bg-indigo-500/10 border-indigo-200/50 dark:border-indigo-500/20' :
              alert.color === 'emerald' ? 'bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-200/50 dark:border-emerald-500/20' :
              'bg-rose-50/50 dark:bg-rose-500/10 border-rose-200/50 dark:border-rose-500/20',
              alert.type === 'reward' ? 'cursor-pointer active:scale-95' : ''
            ]"
          >
            <div class="flex items-center gap-3 overflow-hidden">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
                :class="[
                  alert.color === 'amber'   ? 'bg-amber-500' :
                  alert.color === 'indigo'  ? 'bg-indigo-500' :
                  alert.color === 'emerald' ? 'bg-emerald-500' :
                  'bg-rose-500'
                ]"
              >
                <svg v-if="alert.type === 'kyc'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                <span v-else-if="alert.type === 'promo'">🎁</span>
                <span v-else-if="alert.type === 'security'">🔒</span>
                <span v-else-if="alert.type === 'reward'">💰</span>
              </div>
              <div class="min-w-0">
                <h4 class="text-xs font-bold uppercase tracking-tight">{{ alert.title }}</h4>
                <p class="text-[10px] font-medium leading-tight truncate opacity-70">{{ alert.message }}</p>
              </div>
            </div>
            <button @click.stop="showAlerts = false" class="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors shrink-0 ms-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="opacity-50"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Hero / Account Card -->
      <div class="space-y-3">
        <div class="relative overflow-hidden p-6 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl shadow-slate-950/40 transition-all active:scale-[0.99]">
          <div class="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

          <div class="relative z-10 space-y-6">
            <!-- Account number row -->
            <div class="flex items-center justify-between">
              <div
                @click="copyAccount"
                class="relative flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-full cursor-pointer active:scale-95 transition-all group/copy"
              >
                <!-- Skeleton while wallet loads and no account_number -->
                <template v-if="dash.isLoadingWallet && !accountNumber">
                  <span class="w-32 h-3 rounded-full bg-white/10 animate-pulse inline-block"></span>
                </template>
                <template v-else>
                  <span class="text-xs font-bold tracking-tight opacity-90">
                    {{ accountNumber ?? '—' }} | Blocpoint
                  </span>
                  <svg v-if="accountNumber" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="opacity-50 group-hover/copy:opacity-100 transition-opacity"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                </template>

                <Transition name="fade">
                  <div v-if="showCopyToast" class="absolute inset-0 flex items-center justify-center bg-primary rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-lg">
                    Copied!
                  </div>
                </Transition>
              </div>

              <!-- Currency Dropdown -->
              <div class="relative">
                <button
                  @click="showCurrencyDropdown = !showCurrencyDropdown"
                  class="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-full hover:bg-white/10 transition-colors"
                >
                  <span class="text-xs font-bold">{{ selectedCurrency.code }}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="opacity-50"><path d="m6 9 6 6 6-6"/></svg>
                </button>

                <Transition name="fade">
                  <div v-if="showCurrencyDropdown" class="absolute right-0 mt-2 w-36 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    <div v-if="walletStore.isLoadingWallets" class="px-4 py-3 text-[10px] text-white/40 text-center">
                      Loading…
                    </div>
                    <button
                      v-else
                      v-for="wallet in walletStore.enrichedWallets"
                      :key="wallet.currency"
                      @click="selectCurrency(wallet)"
                      class="w-full flex items-center justify-between px-4 py-2.5 text-[10px] font-semibold hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                      :class="{ 'bg-white/10': walletStore.activeWallet?.currency === wallet.currency }"
                    >
                      <div class="flex items-center gap-2">
                        <span>{{ wallet.flag }}</span>
                        <span>{{ wallet.currency }}</span>
                      </div>
                      <span class="opacity-50">{{ wallet.symbol }}</span>
                    </button>
                  </div>
                </Transition>
              </div>
            </div>

            <!-- Balance display -->
            <div class="space-y-1">
              <div class="flex items-center gap-3">
                <div class="relative">
                  <!-- Skeleton -->
                  <div v-if="dash.isLoadingWallet && !dash.wallet" class="w-44 h-10 rounded-2xl bg-white/10 animate-pulse"></div>

                  <!-- Error state -->
                  <p v-else-if="dash.walletError" class="text-2xl font-extrabold tracking-tighter text-red-400 flex items-center gap-2">
                    <span>⚠</span>
                    <button @click="refreshWallet" class="text-sm underline opacity-70">Retry</button>
                  </p>

                  <!-- Balance -->
                  <p v-else
                    class="text-4xl font-extrabold tracking-tighter transition-all duration-300"
                    :class="{ 'blur-md select-none opacity-40 scale-95': !showBalance }"
                  >
                    {{ balance ?? `${selectedCurrency.symbol}—` }}
                  </p>
                </div>

                <button @click="showBalance = !showBalance" class="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                  <svg v-if="showBalance" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
              <p class="text-[10px] font-semibold text-white/50 tracking-widest">{{ balanceUpdatedLabel }}</p>
            </div>

            <!-- CTA buttons -->
            <div class="flex justify-between">
              <!-- Add Money: only for NGN wallet (primary funding source) -->
              <button
                v-if="walletStore.activeWallet?.currency === 'NGN'"
                @click="go('/app/add-money')"
                class="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-800/60 hover:bg-indigo-700/60 text-white rounded-2xl font-semibold text-[11px] border border-white/5 active:scale-95 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                Add Money
              </button>
              <!-- Convert: for non-NGN wallets — takes you to Convert with this wallet as source -->
              <button
                v-else
                @click="go('/app/convert')"
                class="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-700/60 hover:bg-emerald-600/60 text-white rounded-2xl font-semibold text-[11px] border border-white/5 active:scale-95 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16V4m0 0L3 8m4-4 4 4"/><path d="M17 8v12m0 0 4-4m-4 4-4-4"/></svg>
                Convert
              </button>

              <button @click="go('/app/transactions')" class="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-800/60 hover:bg-indigo-700/60 text-white rounded-2xl font-semibold text-[11px] border border-white/5 active:scale-95 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="9"/></svg>
                History
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Transfer Methods -->
      <div class="grid grid-cols-3 gap-4">
        <button @click="go('/app/transfer/blocpoint')" class="flex flex-col items-center gap-3 p-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-3xl transition-all active:scale-95 group">
          <div class="bg-primary/10 text-primary w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border border-black/5 dark:border-white/5 transition-transform group-hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <span class="text-[10px] font-bold text-slate-800 dark:text-slate-200 text-center leading-tight capitalize tracking-tight">To Blocpoint</span>
        </button>

        <button @click="go('/app/transfer/bank')" class="flex flex-col items-center gap-3 p-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-3xl transition-all active:scale-95 group">
          <div class="bg-indigo-500/10 text-indigo-500 w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border border-black/5 dark:border-white/5 transition-transform group-hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18 M3 10h18 M5 6l7-3 7 3 M4 10v11 M11 10v11 M15 10v11 M20 10v11"/></svg>
          </div>
          <span class="text-[10px] font-bold text-slate-800 dark:text-slate-200 text-center leading-tight capitalize tracking-tight">To Bank</span>
        </button>

        <button @click="go('/app/cards')" class="flex flex-col items-center gap-3 p-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-3xl transition-all active:scale-95 group">
          <div class="bg-emerald-500/10 text-emerald-500 w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border border-black/5 dark:border-white/5 transition-transform group-hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h.01"/><path d="M11 15h.01"/><path d="M15 15h.01"/><path d="M19 15h.01"/></svg>
          </div>
          <span class="text-[10px] font-bold text-slate-800 dark:text-slate-200 text-center leading-tight capitalize tracking-tight">Cards</span>
        </button>
      </div>

      <!-- Utilities -->
      <div class="space-y-4">
        <div class="flex items-center justify-between px-2">
          <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tighter">Utilities</h3>
        </div>
        <div class="grid grid-cols-4 gap-4">
          <button
            v-for="service in services"
            :key="service.name"
            @click="service.name === 'Loan' ? go('/app/loans') : service.name === 'Airtime' ? go('/app/airtime') : service.name === 'Data' ? go('/app/data') : go('/app/tv')"
            class="flex flex-col items-center gap-2.5 transition-all active:scale-90"
          >
            <div :class="[service.color, 'w-14 h-14 rounded-[1.25rem] flex items-center justify-center shadow-sm border border-black/5 dark:border-white/5']">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path v-if="service.name === 'Airtime'" d="M12 18h.01 M8 21h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z" />
                <path v-if="service.name === 'Data'"    d="M12 20v-8m0 0l-4 4m4-4l4 4M4 4h16" />
                <path v-if="service.name === 'TV'"      d="M2 8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8z M7 21h10 M12 18v3" />
                <path v-if="service.name === 'Loan'"    d="M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <span class="text-[10px] font-semibold text-slate-500 dark:text-slate-400 text-center tracking-tight">{{ service.name }}</span>
          </button>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="space-y-4">
        <div class="flex items-center justify-between px-2">
          <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tighter">Recent Transactions</h3>
          <button @click="go('/app/transactions')" class="text-xs font-semibold text-primary uppercase tracking-wider">See All</button>
        </div>

        <div class="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200/50 dark:border-white/5 rounded-[2rem] overflow-hidden">

          <!-- Skeleton while loading -->
          <template v-if="dash.isLoadingTxns">
            <div v-for="i in 3" :key="i" class="flex items-center gap-4 p-4 border-b border-slate-100 dark:border-white/5 last:border-0">
              <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse shrink-0"></div>
              <div class="flex-1 space-y-2">
                <div class="w-28 h-3 rounded-full bg-slate-200 dark:bg-white/10 animate-pulse"></div>
                <div class="w-20 h-2 rounded-full bg-slate-100 dark:bg-white/5 animate-pulse"></div>
              </div>
              <div class="space-y-2 text-right">
                <div class="w-16 h-3 rounded-full bg-slate-200 dark:bg-white/10 animate-pulse ml-auto"></div>
                <div class="w-12 h-2 rounded-full bg-slate-100 dark:bg-white/5 animate-pulse ml-auto"></div>
              </div>
            </div>
          </template>

          <!-- Empty state -->
          <div v-else-if="dash.transactions.length === 0" class="p-8 text-center text-slate-400">
            <p class="text-2xl mb-2">💳</p>
            <p class="text-sm font-semibold">No transactions yet</p>
            <p class="text-xs opacity-70 mt-1">Fund your wallet to get started</p>
          </div>

          <!-- Transaction list -->
          <template v-else>
            <div
              v-for="(tx, idx) in dash.transactions"
              :key="tx.id"
              class="flex items-center justify-between p-4 transition-colors hover:bg-slate-50 dark:hover:bg-white/5 group"
              :class="{ 'border-b border-slate-100 dark:border-white/5': idx !== dash.transactions.length - 1 }"
            >
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-xl shadow-sm border border-black/5 dark:border-white/5 group-hover:scale-110 transition-transform">
                  {{ transactionIcon(tx.type) }}
                </div>
                <div>
                  <h4 class="text-xs font-bold text-slate-800 dark:text-white">{{ transactionDisplayName(tx) }}</h4>
                  <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter">
                    {{ new Date(tx.created_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }) }}
                    • {{ tx.type?.replace(/_/g,' ') }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-xs font-bold tracking-tight"
                  :class="formatTransactionAmount(tx).startsWith('+') ? 'text-emerald-500' : 'text-slate-800 dark:text-white'">
                  {{ formatTransactionAmount(tx, selectedCurrency.symbol) }}
                </p>
                <p class="text-[9px] font-bold uppercase tracking-widest"
                  :class="tx.status === 'completed' ? 'text-emerald-500/70' : tx.status === 'failed' ? 'text-red-400/70' : 'text-amber-500/70'">
                  {{ tx.status }}
                </p>
              </div>
            </div>
          </template>

        </div>
      </div>

      <!-- Refer & Earn -->
      <div
        @click="go('/app/refer')"
        class="p-5 bg-gradient-to-br from-primary/10 to-indigo-500/10 border border-primary/20 rounded-[2.5rem] relative overflow-hidden group active:scale-[0.98] transition-all cursor-pointer"
      >
        <div class="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
        <div class="relative z-10 flex items-center justify-between">
          <div class="space-y-1">
            <h3 class="text-xs font-bold text-primary uppercase tracking-[0.2em]">Refer & Earn</h3>
            <p class="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Invite friends and get <span class="text-primary font-bold">₦500</span></p>
          </div>
          <div
            @click.stop="go('/app/refer')"
            class="px-5 py-2.5 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-primary/30 active:scale-95 transition-all"
          >
            Invite Now
          </div>
        </div>
      </div>

      <!-- Knowledge Base -->
      <div class="space-y-4">
        <div class="flex items-center justify-between px-2">
          <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tighter">Knowledge Base</h3>
          <button @click="go('/app/help-center')" class="text-xs font-semibold text-primary uppercase tracking-wider">Explore</button>
        </div>
        <div class="flex overflow-x-auto gap-4 scrollbar-hide snap-x pb-4">
          <div
            v-for="article in articles"
            :key="article.id"
            @click="openArticle(article)"
            class="min-w-[75%] snap-center aspect-[4/3] rounded-[2.5rem] bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 relative overflow-hidden group cursor-pointer active:scale-95 transition-all"
          >
            <img :src="article.image" class="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-700" />
            <div class="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-transparent to-transparent"></div>

            <div class="absolute inset-0 p-6 flex flex-col justify-between z-10">
              <div class="w-10 h-10 rounded-xl bg-primary/20 backdrop-blur-md flex items-center justify-center text-xl shadow-lg border border-white/10">
                {{ article.icon }}
              </div>
              <div class="space-y-1">
                <span class="text-[9px] font-black text-primary uppercase tracking-[0.2em]">{{ article.category }}</span>
                <h4 class="text-sm font-black text-slate-800 dark:text-white tracking-tight leading-tight">{{ article.title }}</h4>
                <p class="text-[10px] font-medium text-slate-500 dark:text-slate-400 line-clamp-2">{{ article.excerpt }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </AppShell>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>

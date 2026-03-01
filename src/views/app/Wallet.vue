<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../../components/layout/AppShell.vue'
import { useWalletStore, currencyMeta } from '../../stores/wallet'
import { formatBalance } from '../../utils/transaction'

const router      = useRouter()
const walletStore = useWalletStore()

// ─── Carousel state ───────────────────────────────────────────────────────────

const activeIndex    = ref(0)
const walletScroll   = ref(null)
const isBalanceHidden = ref(false)
const copiedTag       = ref(null)   // holds the tag string while flash is showing

const copyTag = (tag) => {
  if (!tag) return
  navigator.clipboard.writeText(tag)
  copiedTag.value = tag
  setTimeout(() => (copiedTag.value = null), 1800)
}

// ─── Computed: wallets from store, enriched with display metadata ─────────────

const wallets = computed(() => walletStore.enrichedWallets)

// Card total = real wallets + 1 "Add Wallet" card (if currencies available)
const totalCards = computed(() =>
  wallets.value.length + (walletStore.availableCurrencies.length > 0 ? 1 : 0)
)

const activeCurrency = computed(() => wallets.value[activeIndex.value]?.currency ?? null)

// ─── Computed: transactions for active wallet ─────────────────────────────────

const txState = computed(() => {
  const key = activeCurrency.value?.toUpperCase()
  return key ? (walletStore.walletTransactions[key] ?? { data: [], loading: false }) : { data: [], loading: false }
})

const transactions   = computed(() => txState.value.data ?? [])
const txLoading      = computed(() => txState.value.loading)

// ─── Transaction detail drawer ────────────────────────────────────────────────

const selectedTx           = ref(null)
const showDetail           = ref(false)
const isDownloadingReceipt = ref(false)
const receiptProgress      = ref(0)

const openDetail = (tx) => {
  selectedTx.value      = tx
  showDetail.value      = true
  receiptProgress.value = 0
}

const txDisplayName = (tx) =>
  tx.recipient_label ?? tx.metadata?.trx_name ?? tx.type ?? 'Transaction'

const txAmount = (tx) => {
  const wallet = wallets.value[activeIndex.value]
  const sym    = wallet?.symbol ?? ''
  const sign   = tx.direction === 'credit' ? '+' : '-'
  return `${sign}${sym}${Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

const txIsInbound = (tx) => tx.direction === 'credit'

const txDate = (tx) => {
  if (!tx.created_at) return '—'
  return new Date(tx.created_at).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

const handleReceiptDownload = () => {
  isDownloadingReceipt.value = true
  receiptProgress.value = 0
  const interval = setInterval(() => {
    receiptProgress.value += 10
    if (receiptProgress.value >= 100) {
      clearInterval(interval)
      setTimeout(() => { isDownloadingReceipt.value = false }, 500)
    }
  }, 100)
}

const reportIssue = () => {
  if (!selectedTx.value) return
  router.push({
    path: '/app/support',
    query: { ref: selectedTx.value.reference, subject: `Issue with ${txDisplayName(selectedTx.value)}` }
  })
}

// ─── onMounted: mirror Dashboard pattern exactly ─────────────────────────────

onMounted(async () => {
  // GET /wallets already returns available_balance — same as Dashboard.vue
  await walletStore.fetchWallets()

  // Sync carousel index to whichever wallet is currently active
  if (wallets.value.length) {
    const activeIdx = wallets.value.findIndex(
      (w) => w.currency === walletStore.activeWallet?.currency
    )
    activeIndex.value = activeIdx >= 0 ? activeIdx : 0

    // Scroll the carousel to the correct card after the DOM renders
    await nextTick()
    if (walletScroll.value && activeIndex.value > 0) {
      const cardWidth = walletScroll.value.offsetWidth * 0.85 + 16
      walletScroll.value.scrollLeft = activeIndex.value * cardWidth
    }

    walletStore.fetchTransactions(wallets.value[activeIndex.value]?.currency ?? wallets.value[0].currency)
    walletStore.fetchAvailableCurrencies()
  }
})

// ─── Scroll logic ─────────────────────────────────────────────────────────────

const handleScroll = (event) => {
  const scrollPosition = event.target.scrollLeft
  const cardWidth      = event.target.offsetWidth * 0.85 + 16
  const index          = Math.round(scrollPosition / cardWidth)
  if (index !== activeIndex.value && index >= 0 && index < totalCards.value) {
    activeIndex.value = index
    if (index < wallets.value.length) {
      const currency = wallets.value[index].currency
      // Fetch fresh balance + transactions when swiping to a new card
      walletStore.fetchBalance(currency)
      walletStore.fetchTransactions(currency)
    }
  }
}

const scrollToWallet = (index) => {
  if (!walletScroll.value) return
  const cardWidth = walletScroll.value.offsetWidth * 0.85 + 16
  walletScroll.value.scrollTo({ left: index * cardWidth, behavior: 'smooth' })
}

// ─── Add Wallet sheet ─────────────────────────────────────────────────────────

const showAddWallet       = ref(false)
const isCreatingWallet    = ref(false)
const createWalletError   = ref(null)

const openAddWallet = async () => {
  await walletStore.fetchAvailableCurrencies()
  showAddWallet.value = true
}

const createWallet = async (currencyCode) => {
  isCreatingWallet.value  = true
  createWalletError.value = null
  const result = await walletStore.createWallet(currencyCode)
  isCreatingWallet.value  = false
  if (result.error) {
    createWalletError.value = result.error
  } else {
    showAddWallet.value = false
    // Scroll to the newly added wallet card
    await new Promise((r) => setTimeout(r, 100))
    scrollToWallet(wallets.value.length - 1)
  }
}

// ─── P2P Send modal ───────────────────────────────────────────────────────────

const showSend         = ref(false)
const sendStep         = ref(1)   // 1 = tag input, 2 = amount, 3 = PIN
const sendTag          = ref('')
const sendAmount       = ref('')
const sendNarration    = ref('')
const sendPin          = ref('')
const sendRecipient    = ref(null)
const sendError        = ref(null)
const isSending        = ref(false)
const sendSuccess      = ref(false)

const openSend = async () => {
  sendStep.value      = 1
  sendTag.value       = ''
  sendAmount.value    = ''
  sendNarration.value = ''
  sendPin.value       = ''
  sendRecipient.value = null
  sendError.value     = null
  sendSuccess.value   = false
  showSend.value      = true
}

const resolveTag = async () => {
  if (!sendTag.value.trim()) {
    sendError.value = 'Please enter a wallet tag.'
    return
  }
  sendError.value = null
  const result = await walletStore.resolveTag(sendTag.value.trim().toUpperCase())
  if (result.error) {
    sendError.value = result.error
  } else {
    sendRecipient.value = result.recipient
    sendStep.value = 2
  }
}

const confirmAmount = () => {
  const amt = parseFloat(sendAmount.value)
  if (!amt || amt < 1) {
    sendError.value = 'Enter a valid amount (minimum 1).'
    return
  }
  sendError.value = null
  sendStep.value  = 3
}

const submitSend = async () => {
  if (!sendPin.value || sendPin.value.length < 4) {
    sendError.value = 'Enter your 4-digit PIN.'
    return
  }
  sendError.value = null
  isSending.value = true
  const sourceCurrency = activeCurrency.value ?? 'NGN'
  const result = await walletStore.sendP2P({
    wallet_tag:      sendTag.value.trim().toUpperCase(),
    source_currency: sourceCurrency,
    amount:          parseFloat(sendAmount.value),
    narration:       sendNarration.value || 'Wallet transfer',
  })
  isSending.value = false
  if (result.error) {
    sendError.value = result.error
  } else {
    sendSuccess.value = true
    setTimeout(() => { showSend.value = false }, 2000)
  }
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(async () => {
  if (!walletStore.wallets.length) {
    await walletStore.fetchWallets()
  }
  if (wallets.value.length) {
    walletStore.fetchTransactions(wallets.value[0].currency)
  }
})
</script>

<template>
  <AppShell title="My Wallets">
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">

      <!-- Wallet Carousel -->
      <div class="space-y-4">
        <div
          ref="walletScroll"
          class="flex overflow-x-auto gap-4 snap-x snap-mandatory px-4 pb-4 scrollbar-hide"
          @scroll="handleScroll"
        >
          <!-- Wallet skeleton while loading -->
          <template v-if="walletStore.isLoadingWallets">
            <div class="min-w-[85%] snap-center aspect-[1.8/1] rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
          </template>

          <!-- Real wallet cards -->
          <div
            v-if="!walletStore.isLoadingWallets"
            v-for="(wallet, idx) in wallets"
            :key="wallet.currency"
            class="min-w-[85%] snap-center aspect-[1.8/1] rounded-[2.5rem] p-4 relative overflow-hidden transition-all duration-500 shadow-xl border"
            :class="[
              wallet.color,
              activeIndex === idx ? 'scale-100 opacity-100' : 'scale-90 opacity-40'
            ]"
          >
            <div class="relative z-10 h-full flex flex-col justify-between" :class="wallet.textColor">

              <!-- Top row: currency code left, controls right -->
              <div class="flex justify-between items-center">
                <p class="text-2xl font-bold tracking-tight">{{ wallet.currency }}</p>
                <div class="flex items-center gap-2">
                  <!-- Eye toggle -->
                  <button @click="isBalanceHidden = !isBalanceHidden" class="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center transition-transform active:scale-90">
                    <svg v-if="!isBalanceHidden" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                  </button>
                  <!-- Currency symbol badge -->
                  <div class="w-10 h-10 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center font-bold text-sm border border-black/5 dark:border-white/10">
                    {{ wallet.symbol }}
                  </div>
                </div>
              </div>

              <!-- Bottom: balance (flex-1) + tag (shrink-0), aligned to baseline -->
              <div class="flex items-end gap-3">

                <!-- Balance — takes all remaining width -->
                <div class="flex-1 min-w-0">
                  <p class="text-[9px] font-semibold opacity-40 tracking-wider mb-0.5">Available Balance</p>
                  <h2 class="text-2xl font-bold tracking-tighter leading-none transition-all duration-300" :class="{ 'blur-md select-none opacity-40': isBalanceHidden }">
                    {{ wallet.symbol }}{{ Number(wallet.available_balance).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                  </h2>
                  <div class="flex items-center gap-1.5 mt-1">
                    <span class="w-1 h-1 rounded-full bg-emerald-500 shrink-0"></span>
                    <p class="text-[9px] font-medium opacity-60">
                      Pending: {{ wallet.symbol }}{{ Number(wallet.pending_balance).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                    </p>
                  </div>
                </div>

                <!-- Tag pill — shrink-0, always bottom-right, never shifts balance -->
                <button
                  v-if="wallet.wallet_tag"
                  @click.stop="copyTag(wallet.wallet_tag)"
                  class="relative shrink-0 self-end flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10 active:scale-95 transition-all"
                >
                  <Transition name="fade">
                    <span
                      v-if="copiedTag === wallet.wallet_tag"
                      class="absolute inset-0 flex items-center justify-center rounded-xl bg-emerald-500 text-white text-[8px] font-black tracking-widest uppercase"
                    >Copied!</span>
                  </Transition>
                  <span class="text-[8px] font-mono font-bold tracking-wider opacity-70">{{ wallet.wallet_tag }}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="opacity-40 shrink-0"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                </button>
              </div>

            </div><!-- /inner flex-col -->
          </div><!-- /wallet card -->

          <!-- Add Wallet card -->
          <div
            v-if="walletStore.availableCurrencies.length > 0 || !walletStore.isLoadingWallets"
            @click="openAddWallet"
            class="min-w-[85%] snap-center aspect-[1.8/1] rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-all active:scale-95"
            :class="activeIndex === wallets.length ? 'scale-100 opacity-100' : 'scale-90 opacity-40'"
          >
            <div class="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            </div>
            <p class="text-[10px] font-black text-slate-400 dark:text-white/40 uppercase tracking-widest">Add Wallet</p>
          </div>
        </div>

        <!-- Carousel indicators -->
        <div class="flex justify-center gap-2">
          <button
            v-for="(_, idx) in totalCards"
            :key="idx"
            @click="scrollToWallet(idx)"
            class="h-1.5 transition-all duration-300 rounded-full"
            :class="activeIndex === idx ? 'w-8 bg-primary' : 'w-2 bg-slate-200 dark:bg-white/10'"
          ></button>
        </div>
      </div>

      <!-- Quick Actions for Active Wallet -->
      <div class="px-4 grid grid-cols-2 gap-4">
        <button @click="router.push('/app/convert')" class="h-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all group">
          <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
          </div>
          <span class="text-[10px] font-bold uppercase tracking-widest">Convert</span>
        </button>
        <button @click="openSend" class="h-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all group">
          <div class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
          </div>
          <span class="text-[10px] font-bold uppercase tracking-widest">Send</span>
        </button>
      </div>

      <!-- Transaction List -->
      <div class="px-4 space-y-4">
        <div class="flex items-center justify-between px-2">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Transaction History</h3>
          <span class="text-[10px] font-bold text-primary px-3 py-1 bg-primary/10 rounded-full uppercase tracking-widest">
            {{ activeCurrency ?? '—' }}
          </span>
        </div>

        <!-- Skeleton loader -->
        <div v-if="txLoading" class="space-y-3">
          <div v-for="i in 4" :key="i" class="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
        </div>

        <!-- Transactions list -->
        <div v-else-if="transactions.length > 0" class="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2rem] overflow-hidden">
          <div
            v-for="tx in transactions"
            :key="tx.id"
            @click="openDetail(tx)"
            class="flex items-center justify-between p-5 border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group cursor-pointer active:scale-[0.99]"
          >
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform"
                :class="txIsInbound(tx) ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-slate-100 dark:bg-white/5'"
              >
                {{ txIsInbound(tx) ? '📥' : '📤' }}
              </div>
              <div>
                <h4 class="text-xs font-bold text-slate-800 dark:text-white">{{ txDisplayName(tx) }}</h4>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{{ txDate(tx) }} • {{ tx.type }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-xs font-bold tracking-tight" :class="txIsInbound(tx) ? 'text-emerald-500' : 'text-slate-800 dark:text-white'">
                {{ txAmount(tx) }}
              </p>
              <p class="text-[9px] font-bold text-emerald-500/60 uppercase tracking-widest">{{ tx.status }}</p>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="py-20 text-center space-y-4 bg-white/30 dark:bg-slate-900/30 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-white/5">
          <div class="text-4xl opacity-20">📂</div>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No transactions yet for this wallet</p>
        </div>
      </div>
    </div>

    <!-- Transaction Detail Drawer -->
    <Transition name="drawer-right">
      <div v-if="showDetail && selectedTx" class="fixed inset-0 z-[150] flex justify-end">
        <div class="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" @click="showDetail = false"></div>
        <div class="relative w-[85%] max-w-sm h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-white/10 overflow-hidden animate-in slide-in-from-right duration-500">
          <div class="p-8 space-y-8 flex-1 overflow-y-auto pt-12">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">Transaction Detail</h3>
                <p class="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">{{ selectedTx.type }}</p>
              </div>
              <button @click="showDetail = false" class="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <div class="p-8 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-slate-100 dark:border-white/5 text-center space-y-1 relative overflow-hidden">
              <div class="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">Amount Transferred</p>
              <p class="text-4xl font-black tracking-tighter relative z-10" :class="txIsInbound(selectedTx) ? 'text-emerald-500' : 'text-slate-800 dark:text-white'">
                {{ txAmount(selectedTx) }}
              </p>
              <div class="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full mt-4 relative z-10">
                <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span class="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{{ selectedTx.status }}</span>
              </div>

              <Transition name="fade">
                <div v-if="isDownloadingReceipt" class="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 space-y-3">
                  <div class="w-full h-1 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div class="h-full bg-primary transition-all duration-300" :style="{ width: receiptProgress + '%' }"></div>
                  </div>
                  <span class="text-[9px] font-black text-primary uppercase tracking-widest">Generating {{ receiptProgress }}%</span>
                </div>
              </Transition>
            </div>

            <div class="space-y-6 pt-4">
              <div v-for="item in [
                { label: 'Recipient/Source', value: txDisplayName(selectedTx) },
                { label: 'Reference', value: selectedTx.reference },
                { label: 'Date & Time', value: txDate(selectedTx) },
                { label: 'Type', value: selectedTx.type },
                { label: 'Status', value: selectedTx.status },
              ]" :key="item.label" class="flex justify-between items-center">
                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ item.label }}</span>
                <span class="text-[11px] font-extrabold text-slate-700 dark:text-slate-200">{{ item.value }}</span>
              </div>
            </div>

            <div class="pt-8 space-y-3">
              <button @click="handleReceiptDownload" :disabled="isDownloadingReceipt"
                class="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-[0.2em] disabled:opacity-50"
              >{{ isDownloadingReceipt ? 'Processing…' : 'Download Receipt' }}</button>
              <button @click="reportIssue"
                class="w-full h-14 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-[10px] font-black rounded-2xl active:scale-95 transition-all uppercase tracking-[0.2em]"
              >Report Issue</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Add Wallet Bottom Sheet -->
    <Transition name="sheet">
      <div v-if="showAddWallet" class="fixed inset-0 z-[150] flex flex-col justify-end">
        <div class="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" @click="showAddWallet = false"></div>
        <div class="relative bg-white dark:bg-slate-900 rounded-t-[2rem] p-6 space-y-5 shadow-2xl border-t border-white/10 max-h-[70vh] overflow-y-auto">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-base font-black text-slate-800 dark:text-white">Add New Wallet</h3>
              <p class="text-[10px] text-slate-400 mt-0.5">Choose a currency to open</p>
            </div>
            <button @click="showAddWallet = false" class="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          <p v-if="createWalletError" class="text-[10px] text-red-500 font-bold">{{ createWalletError }}</p>

          <div v-if="walletStore.availableCurrencies.length === 0" class="py-8 text-center">
            <p class="text-[11px] text-slate-400">You have wallets in all available currencies.</p>
          </div>

          <div v-else class="space-y-3">
            <button
              v-for="c in walletStore.availableCurrencies"
              :key="c.currency_code"
              @click="createWallet(c.currency_code)"
              :disabled="isCreatingWallet"
              class="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl active:scale-95 transition-all disabled:opacity-50"
            >
              <div class="flex items-center gap-4">
                <span class="text-2xl">{{ currencyMeta(c.currency_code).flag }}</span>
                <div class="text-left">
                  <p class="text-xs font-bold text-slate-800 dark:text-white">{{ c.name }}</p>
                  <p class="text-[10px] text-slate-400">{{ c.currency_code }}</p>
                </div>
              </div>
              <svg v-if="isCreatingWallet" class="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- P2P Send Modal — bottom sheet with 3 steps -->
    <Transition name="sheet">
      <div v-if="showSend" class="fixed inset-0 z-[200] flex flex-col justify-end">
        <div class="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" @click="showSend = false"></div>
        <div class="relative bg-white dark:bg-slate-900 rounded-t-[2rem] p-6 shadow-2xl border-t border-white/10">

          <!-- Success state -->
          <div v-if="sendSuccess" class="py-10 flex flex-col items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-3xl">✓</div>
            <p class="text-sm font-black text-slate-800 dark:text-white">Transfer Successful!</p>
          </div>

          <!-- Step forms -->
          <div v-else class="space-y-5">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-base font-black text-slate-800 dark:text-white">
                  {{ sendStep === 1 ? 'Enter Wallet Tag' : sendStep === 2 ? 'Enter Amount' : 'Confirm with PIN' }}
                </h3>
                <p class="text-[10px] text-slate-400">Step {{ sendStep }} of 3</p>
              </div>
              <button @click="showSend = false" class="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <!-- Step 1: Tag -->
            <div v-if="sendStep === 1" class="space-y-4">
              <input
                v-model="sendTag"
                placeholder="e.g. BLP-FX9K2-NGN"
                class="w-full h-14 px-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold uppercase tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p v-if="sendError" class="text-[10px] text-red-500 font-bold text-center">{{ sendError }}</p>
              <button @click="resolveTag" :disabled="walletStore.isResolvingTag"
                class="w-full h-14 bg-primary text-white text-[10px] font-black rounded-2xl uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50"
              >{{ walletStore.isResolvingTag ? 'Searching…' : 'Find Recipient' }}</button>
            </div>

            <!-- Step 2: Amount -->
            <div v-if="sendStep === 2" class="space-y-4">
              <div class="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-lg">👤</div>
                <div>
                  <p class="text-xs font-black text-emerald-700 dark:text-emerald-300">{{ sendRecipient?.agent_name }}</p>
                  <p class="text-[10px] text-emerald-500/70 font-mono">{{ sendRecipient?.wallet_tag }} · {{ sendRecipient?.currency }}</p>
                </div>
              </div>
              <input
                v-model="sendAmount"
                type="number"
                min="1"
                placeholder="Amount"
                class="w-full h-14 px-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                v-model="sendNarration"
                placeholder="Narration (optional)"
                class="w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p v-if="sendError" class="text-[10px] text-red-500 font-bold text-center">{{ sendError }}</p>
              <div class="grid grid-cols-2 gap-3">
                <button @click="sendStep = 1" class="h-12 bg-slate-100 dark:bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">Back</button>
                <button @click="confirmAmount" class="h-12 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">Continue</button>
              </div>
            </div>

            <!-- Step 3: PIN -->
            <div v-if="sendStep === 3" class="space-y-4">
              <div class="text-center p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                <p class="text-[10px] text-slate-400 uppercase tracking-widest">Sending</p>
                <p class="text-2xl font-black text-slate-800 dark:text-white">
                  {{ wallets.find(w => w.currency === activeCurrency)?.symbol }}{{ Number(sendAmount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                </p>
                <p class="text-[10px] text-slate-400">to {{ sendRecipient?.agent_name }}</p>
              </div>
              <input
                v-model="sendPin"
                type="password"
                maxlength="6"
                inputmode="numeric"
                placeholder="••••"
                class="w-full h-14 px-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-2xl font-black tracking-[1rem] text-center focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p v-if="sendError" class="text-[10px] text-red-500 font-bold text-center">{{ sendError }}</p>
              <div class="grid grid-cols-2 gap-3">
                <button @click="sendStep = 2" class="h-12 bg-slate-100 dark:bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">Back</button>
                <button @click="submitSend" :disabled="isSending"
                  class="h-12 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50"
                >{{ isSending ? 'Sending…' : 'Send Now' }}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </AppShell>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

.drawer-right-enter-active, .drawer-right-leave-active { transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
.drawer-right-enter-from, .drawer-right-leave-to { opacity: 0; transform: translateX(100%); }

.sheet-enter-active, .sheet-leave-active { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.sheet-enter-from, .sheet-leave-to { opacity: 0; transform: translateY(100%); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

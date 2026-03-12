<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../../components/layout/AppShell.vue'
import PinInput from '../../components/ui/PinInput.vue'
import { useSavingsStore } from '../../stores/savings'
import { useWalletStore } from '../../stores/wallet'
import { formatBalance, transactionDisplayName, transactionIcon, formatTransactionAmount } from '../../utils/transaction'

const router = useRouter()
const savingsStore = useSavingsStore()
const walletStore = useWalletStore()

// ─── State ──────────────────────────────────────────────────────────────────

const showFund = ref(false)
const showWithdraw = ref(false)
const amount = ref('')
const pin = ref('')
const step = ref(1) // 1: Amount, 2: PIN
const isProcessing = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// ─── Computed ───────────────────────────────────────────────────────────────

const flexVault = computed(() => savingsStore.blocFlexVault)
const flexProduct = computed(() => savingsStore.products.find(p => p.code === 'blocflex'))
const ngnWallet = computed(() => walletStore.wallets.find(w => w.currency === 'NGN'))

const transactions = computed(() => savingsStore.transactions.data || [])
const isLoadingTx = computed(() => savingsStore.transactions.loading)

// ─── Methods ────────────────────────────────────────────────────────────────

const openFund = () => {
  resetForm()
  showFund.value = true
}

const openWithdraw = () => {
  resetForm()
  showWithdraw.value = true
}

const resetForm = () => {
  amount.value = ''
  pin.value = ''
  step.value = 1
  errorMessage.value = ''
  successMessage.value = ''
  isProcessing.value = false
}

const handleFund = async () => {
  if (step.value === 1) {
    if (!amount.value || amount.value < 100) {
      errorMessage.value = 'Minimum funding amount is ₦100'
      return
    }
    if (ngnWallet.value && amount.value > ngnWallet.value.available_balance) {
      errorMessage.value = 'Insufficient wallet balance'
      return
    }
    errorMessage.value = ''
    step.value = 2
    return
  }

  // Final submission
  isProcessing.value = true
  try {
    await savingsStore.fundFlex(amount.value)
    successMessage.value = 'Vault funded successfully!'
    setTimeout(() => {
      showFund.value = false
      fetchData()
    }, 2000)
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'Funding failed. Please try again.'
  } finally {
    isProcessing.value = false
  }
}

const handleWithdraw = async () => {
  if (step.value === 1) {
    if (!amount.value || amount.value < 100) {
      errorMessage.value = 'Minimum withdrawal amount is ₦100'
      return
    }
    if (flexVault.value && amount.value > flexVault.value.available_balance) {
      errorMessage.value = 'Insufficient vault balance'
      return
    }
    errorMessage.value = ''
    step.value = 2
    return
  }

  // Final submission
  isProcessing.value = true
  try {
    await savingsStore.withdrawFlex(amount.value)
    successMessage.value = 'Withdrawal processed!'
    setTimeout(() => {
      showWithdraw.value = false
      fetchData()
    }, 2000)
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'Withdrawal failed.'
  } finally {
    isProcessing.value = false
  }
}

const fetchData = async () => {
  savingsStore.fetchVaults(true)
  savingsStore.fetchTransactions(1, { product_code: 'blocflex' })
  walletStore.fetchWallets(true)
}

onMounted(() => {
  fetchData()
  if (savingsStore.products.length === 0) {
    savingsStore.fetchProducts()
  }
})
</script>

<template>
  <AppShell title="BlocFlex" @back="router.push('/app/savings')">
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 px-4">
      
      <!-- Balance Card -->
      <div class="rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-cyan-500 p-8 shadow-2xl relative overflow-hidden text-white">
        <div class="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div class="relative z-10 space-y-6">
          <div class="flex justify-between items-center">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">BlocFlex Balance</p>
            <div class="px-2 py-0.5 rounded-full bg-white/20 text-[8px] font-bold uppercase tracking-widest border border-white/10">
              Liquid • 5% PA
            </div>
          </div>
          <h2 class="text-4xl font-black tracking-tighter leading-none">
            {{ formatBalance(flexVault?.available_balance || 0) }}
          </h2>
          <div class="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div>
              <p class="text-[9px] font-black text-white/50 uppercase tracking-widest">Total Interest</p>
              <p class="text-xs font-bold">{{ formatBalance(flexVault?.paid_interest || 0) }}</p>
            </div>
            <div>
              <p class="text-[9px] font-black text-white/50 uppercase tracking-widest">Growth Rate</p>
              <p class="text-xs font-bold">{{ (flexProduct?.interest_rate * 100 || 5) }}% Annually</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="grid grid-cols-2 gap-4">
        <button @click="openFund" class="h-16 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-center gap-3 shadow-sm active:scale-95 transition-all">
          <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          </div>
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white">Fund</span>
        </button>
        <button @click="openWithdraw" class="h-16 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-center gap-3 shadow-sm active:scale-95 transition-all">
          <div class="w-10 h-10 rounded-xl bg-slate-500/10 text-slate-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>
          </div>
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white">Withdraw</span>
        </button>
      </div>

      <!-- Transaction List -->
      <div class="space-y-4">
        <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center justify-between">
          <span>Recent Activity</span>
          <span v-if="isLoadingTx" class="w-1 h-1 rounded-full bg-primary animate-ping"></span>
        </h3>

        <div v-if="isLoadingTx" class="space-y-3">
          <div v-for="i in 3" :key="i" class="h-16 rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse"></div>
        </div>

        <div v-else-if="transactions.length > 0" class="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2rem] overflow-hidden">
          <div v-for="tx in transactions" :key="tx.id" class="flex items-center justify-between p-5 border-b border-slate-100 dark:border-white/5 last:border-0">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-slate-100 dark:bg-white/5">
                {{ transactionIcon(tx.type) }}
              </div>
              <div>
                <h4 class="text-xs font-black text-slate-800 dark:text-white">{{ transactionDisplayName(tx) }}</h4>
                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                  {{ new Date(tx.created_at).toLocaleDateString() }}
                </p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-xs font-black tracking-tight" :class="tx.direction === 'credit' ? 'text-emerald-500' : 'text-slate-800 dark:text-white'">
                {{ formatTransactionAmount(tx) }}
              </p>
              <p class="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest">{{ tx.status }}</p>
            </div>
          </div>
        </div>

        <div v-else class="py-20 text-center space-y-4 bg-white/30 dark:bg-slate-900/30 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-white/5">
          <div class="text-4xl opacity-20">📂</div>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No activity yet</p>
        </div>
      </div>

    </div>

    <!-- Fund Sheet -->
    <Transition name="sheet">
      <div v-if="showFund" class="fixed inset-0 z-[150] flex flex-col justify-end">
        <div class="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" @click="showFund = false"></div>
        <div class="relative bg-white dark:bg-slate-900 rounded-t-[2rem] p-8 space-y-6 shadow-2xl border-t border-white/10">
          
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-black text-slate-800 dark:text-white">Fund BlocFlex</h3>
              <p class="text-[10px] text-slate-400 uppercase tracking-widest">Available in wallet: {{ formatBalance(ngnWallet?.available_balance || 0) }}</p>
            </div>
            <button @click="showFund = false" class="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          <div v-if="successMessage" class="py-10 flex flex-col items-center gap-4 text-emerald-500">
            <div class="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-3xl">✓</div>
            <p class="text-[10px] font-black uppercase tracking-widest">{{ successMessage }}</p>
          </div>

          <div v-else class="space-y-6">
            <div v-if="step === 1" class="space-y-6">
              <div class="relative">
                <span class="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">₦</span>
                <input v-model="amount" type="number" placeholder="0.00" class="w-full h-20 pl-12 pr-6 rounded-[1.5rem] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-3xl font-black focus:ring-2 focus:ring-primary focus:outline-none transition-all" />
              </div>
              <p v-if="errorMessage" class="text-[10px] text-red-500 font-bold text-center uppercase tracking-widest">{{ errorMessage }}</p>
              <button @click="handleFund" class="w-full h-16 bg-primary text-white text-[10px] font-black rounded-[1.5rem] uppercase tracking-widest active:scale-95 transition-all shadow-xl">Continue</button>
            </div>

            <div v-if="step === 2" class="space-y-8 py-4">
              <PinInput v-model="pin" label="Confirm Transaction" @complete="handleFund" />
              <button @click="step = 1" class="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest">Back to Amount</button>
              <p v-if="isProcessing" class="text-[10px] text-primary font-bold text-center animate-pulse tracking-widest">Processing Transaction...</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Withdraw Sheet -->
    <Transition name="sheet">
      <div v-if="showWithdraw" class="fixed inset-0 z-[150] flex flex-col justify-end">
        <div class="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" @click="showWithdraw = false"></div>
        <div class="relative bg-white dark:bg-slate-900 rounded-t-[2rem] p-8 space-y-6 shadow-2xl border-t border-white/10">
          
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-black text-slate-800 dark:text-white">Withdraw to Wallet</h3>
              <p class="text-[10px] text-slate-400 uppercase tracking-widest">Vault balance: {{ formatBalance(flexVault?.available_balance || 0) }}</p>
            </div>
            <button @click="showWithdraw = false" class="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          <div v-if="successMessage" class="py-10 flex flex-col items-center gap-4 text-emerald-500">
            <div class="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-3xl">✓</div>
            <p class="text-[10px] font-black uppercase tracking-widest">{{ successMessage }}</p>
          </div>

          <div v-else class="space-y-6">
            <div v-if="step === 1" class="space-y-6">
              <div class="relative">
                <span class="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">₦</span>
                <input v-model="amount" type="number" placeholder="0.00" class="w-full h-20 pl-12 pr-6 rounded-[1.5rem] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-3xl font-black focus:ring-2 focus:ring-primary focus:outline-none transition-all" />
              </div>
              <p v-if="errorMessage" class="text-[10px] text-red-500 font-bold text-center uppercase tracking-widest">{{ errorMessage }}</p>
              <button @click="handleWithdraw" class="w-full h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black rounded-[1.5rem] uppercase tracking-widest active:scale-95 transition-all shadow-xl">Withdraw Funds</button>
            </div>

            <div v-if="step === 2" class="space-y-8 py-4">
              <PinInput v-model="pin" label="Confirm Transaction" @complete="handleWithdraw" />
              <button @click="step = 1" class="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest">Back to Amount</button>
              <p v-if="isProcessing" class="text-[10px] text-primary font-bold text-center animate-pulse tracking-widest">Processing Withdrawal...</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>

  </AppShell>
</template>

<style scoped>
.sheet-enter-active, .sheet-leave-active { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.sheet-enter-from, .sheet-leave-to { opacity: 0; transform: translateY(100%); }
</style>

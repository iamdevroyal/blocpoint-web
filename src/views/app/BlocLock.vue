<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../../components/layout/AppShell.vue'
import PinInput from '../../components/ui/PinInput.vue'
import { useSavingsStore } from '../../stores/savings'
import { useWalletStore } from '../../stores/wallet'
import { formatBalance } from '../../utils/transaction'

const router = useRouter()
const savingsStore = useSavingsStore()
const walletStore = useWalletStore()

// ─── State ──────────────────────────────────────────────────────────────────

const showCreate = ref(false)
const amount = ref('')
const tenure = ref(30) // Default 30 days
const pin = ref('')
const step = ref(1) // 1: Amount/Tenure, 2: PIN
const isProcessing = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// ─── Computed ───────────────────────────────────────────────────────────────

const lockPlans = computed(() => savingsStore.activeLockPlans)
const lockProduct = computed(() => savingsStore.products.find(p => p.code === 'bloclock'))
const ngnWallet = computed(() => walletStore.wallets.find(w => w.currency === 'NGN'))

const annualRate = computed(() => lockProduct.value?.interest_rate || 0.10)
const expectedInterest = computed(() => {
  if (!amount.value || amount.value < 1000) return 0
  const rate = annualRate.value
  const days = tenure.value
  // Simple interest: P * (R * T / 365)
  return (amount.value * rate * days) / 365
})

const maturityDate = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + parseInt(tenure.value))
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
})

// ─── Methods ────────────────────────────────────────────────────────────────

const openCreate = () => {
  resetForm()
  showCreate.value = true
}

const resetForm = () => {
  amount.value = ''
  tenure.value = 30
  pin.value = ''
  step.value = 1
  errorMessage.value = ''
  successMessage.value = ''
  isProcessing.value = false
}

const handleCreate = async () => {
  if (step.value === 1) {
    if (!amount.value || amount.value < 1000) {
      errorMessage.value = 'Minimum lock amount is ₦1,000'
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

  isProcessing.value = true
  try {
    await savingsStore.createLock({
      amount: amount.value,
      tenure_days: tenure.value
    })
    successMessage.value = 'Funds locked successfully!'
    setTimeout(() => {
      showCreate.value = false
      fetchData()
    }, 2000)
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'Lock failed.'
  } finally {
    isProcessing.value = false
  }
}

const fetchData = async () => {
  savingsStore.fetchVaults(true)
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
  <AppShell title="BlocLock" @back="router.push('/app/savings')">
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 px-4">
      
      <!-- Intro Card -->
      <div class="rounded-[2.5rem] bg-indigo-600 p-8 shadow-2xl relative overflow-hidden text-white">
        <div class="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div class="relative z-10 space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">🔒</div>
            <div>
              <h2 class="text-xl font-black tracking-tight">Fixed Savings</h2>
              <p class="text-[10px] font-bold uppercase tracking-widest opacity-60">Earn up to 10% Annually</p>
            </div>
          </div>
          <p class="text-xs font-medium leading-relaxed opacity-80">
            Lock your funds away for 30 to 365 days and enjoy guaranteed high returns. 
            Perfect for money you don't need immediately.
          </p>
          <button @click="openCreate" class="w-full h-14 bg-white text-indigo-600 text-[10px] font-black rounded-2xl uppercase tracking-widest active:scale-95 transition-all shadow-lg">
            Create New Lock
          </button>
        </div>
      </div>

      <!-- Active Plans List -->
      <div class="space-y-4">
        <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
          <span>Active Lock Plans</span>
          <span class="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-[8px]">{{ lockPlans.length }}</span>
        </h3>

        <div v-if="lockPlans.length > 0" class="grid gap-4">
          <div 
            v-for="plan in lockPlans" 
            :key="plan.id"
            @click="router.push(`/app/savings/lock/${plan.lockPlan?.plan_ref || plan.id}`)"
            class="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-sm active:scale-[0.98] transition-all flex items-center justify-between group"
          >
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                💰
              </div>
              <div>
                <h4 class="text-sm font-black text-slate-800 dark:text-white">{{ formatBalance(plan.available_balance) }}</h4>
                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Matures {{ new Date(plan.lockPlan?.matures_at).toLocaleDateString() }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active</p>
              <div class="w-20 h-1 bg-slate-100 dark:bg-white/5 rounded-full mt-2 overflow-hidden">
                <div class="h-full bg-indigo-500 w-1/2"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="py-16 text-center space-y-4 bg-white/30 dark:bg-slate-900/30 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-white/5">
          <div class="text-4xl opacity-20">📭</div>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No active lock plans</p>
          <button @click="openCreate" class="text-[10px] font-black text-primary underline uppercase tracking-widest">Lock your first ₦1,000</button>
        </div>
      </div>

    </div>

    <!-- Create Lock Sheet -->
    <Transition name="sheet">
      <div v-if="showCreate" class="fixed inset-0 z-[150] flex flex-col justify-end">
        <div class="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" @click="showCreate = false"></div>
        <div class="relative bg-white dark:bg-slate-900 rounded-t-[2.5rem] p-8 space-y-6 shadow-2xl border-t border-white/10 max-h-[90vh] overflow-y-auto">
          
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-black text-slate-800 dark:text-white">New BlocLock</h3>
              <p class="text-[10px] text-slate-400 uppercase tracking-widest">Wallet: {{ formatBalance(ngnWallet?.available_balance || 0) }}</p>
            </div>
            <button @click="showCreate = false" class="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          <div v-if="successMessage" class="py-10 flex flex-col items-center gap-4 text-emerald-500">
            <div class="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-4xl">🎉</div>
            <p class="text-sm font-black uppercase tracking-widest text-center">{{ successMessage }}</p>
          </div>

          <div v-else class="space-y-6">
            <div v-if="step === 1" class="space-y-6">
              <!-- Amount Input -->
              <div class="space-y-2">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Amount to Lock</label>
                <div class="relative">
                  <span class="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-black text-slate-300">₦</span>
                  <input v-model="amount" type="number" placeholder="Min. 1,000" class="w-full h-16 pl-10 pr-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                </div>
              </div>

              <!-- Tenure Selection -->
              <div class="space-y-3">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Tenure: {{ tenure }} Days</label>
                <div class="grid grid-cols-4 gap-2">
                  <button 
                    v-for="t in [30, 90, 180, 365]" 
                    :key="t"
                    @click="tenure = t"
                    class="h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    :class="tenure === t ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-white/5 text-slate-400'"
                  >
                    {{ t }}d
                  </button>
                </div>
                <!-- Range Slider -->
                <input type="range" v-model="tenure" min="30" max="365" class="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
              </div>

              <!-- Payout Calculator (WOW factor) -->
              <div class="p-6 rounded-[1.5rem] bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 space-y-4">
                <p class="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest text-center">Estimated Payout</p>
                <div class="flex justify-around items-center gap-2">
                  <div class="text-center space-y-0.5">
                    <p class="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Interest</p>
                    <p class="text-lg font-black text-emerald-500">+{{ formatBalance(expectedInterest) }}</p>
                  </div>
                  <div class="w-px h-8 bg-indigo-200 dark:bg-indigo-500/20"></div>
                  <div class="text-center space-y-0.5">
                    <p class="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Maturity Date</p>
                    <p class="text-xs font-black text-slate-700 dark:text-slate-200">{{ maturityDate }}</p>
                  </div>
                </div>
                <div class="pt-3 border-t border-indigo-200 dark:border-indigo-500/20 text-center">
                   <p class="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Total at Maturity</p>
                   <p class="text-xl font-black text-indigo-600 dark:text-indigo-400">{{ formatBalance(Number(amount) + expectedInterest) }}</p>
                </div>
              </div>

              <p v-if="errorMessage" class="text-[10px] text-red-500 font-bold text-center uppercase tracking-widest">{{ errorMessage }}</p>
              
              <button @click="handleCreate" class="w-full h-16 bg-indigo-600 text-white text-[10px] font-black rounded-2xl uppercase tracking-widest active:scale-95 transition-all shadow-xl">
                Lock Funds Now
              </button>
            </div>

            <div v-if="step === 2" class="space-y-8 py-4">
              <PinInput v-model="pin" label="Confirm Lock Request" @complete="handleCreate" />
              <button @click="step = 1" class="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest">Adjust Plan</button>
              <p v-if="isProcessing" class="text-[10px] text-primary font-bold text-center animate-pulse tracking-widest">Securing Your Future...</p>
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

input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 6px;
  cursor: pointer;
}
</style>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppShell from '../../components/layout/AppShell.vue'
import PinInput from '../../components/ui/PinInput.vue'
import { useSavingsStore } from '../../stores/savings'
import { useWalletStore } from '../../stores/wallet'
import { formatBalance } from '../../utils/transaction'

const route = useRoute()
const router = useRouter()
const savingsStore = useSavingsStore()
const walletStore = useWalletStore()

const goalRef = route.params.ref

// ─── State ──────────────────────────────────────────────────────────────────

const showFund = ref(false)
const showWithdraw = ref(false)
const showAutoSave = ref(false)
const amount = ref('')
const pin = ref('')
const step = ref(1) // 1: Amount, 2: PIN
const isProcessing = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// ─── Computed ───────────────────────────────────────────────────────────────

const vault = computed(() => {
  return savingsStore.vaults.find(v => 
    v.id === goalRef || 
    (v.goalPlan && v.goalPlan.goal_ref === goalRef)
  )
})

const goal = computed(() => vault.value?.goalPlan)
const ngnWallet = computed(() => walletStore.wallets.find(w => w.currency === 'NGN'))

const progress = computed(() => {
  if (!vault.value || !goal.value) return 0
  const target = goal.value.target_amount || 1
  const saved = vault.value.available_balance || 0
  return Math.min(100, Math.round((saved / target) * 100))
})

const isAchieved = computed(() => progress.value >= 100)

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

  isProcessing.value = true
  try {
    await savingsStore.fundGoal(goalRef, amount.value)
    successMessage.value = 'Goal funded successfully!'
    setTimeout(() => {
      showFund.value = false
      fetchData()
    }, 2000)
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'Funding failed.'
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
    if (vault.value && amount.value > vault.value.available_balance) {
      errorMessage.value = 'Insufficient goal balance'
      return
    }
    errorMessage.value = ''
    step.value = 2
    return
  }

  isProcessing.value = true
  try {
    const { data } = await savingsStore.withdrawGoal(goalRef, amount.value)
    successMessage.value = 'Funds returned to wallet!'
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

const toggleAutoSave = async () => {
  try {
    await savingsStore.toggleAutoSave(goalRef)
    fetchData()
  } catch (err) {
     // Error handled by store/interceptor
  }
}

const fetchData = async () => {
  savingsStore.fetchVaults(true)
  walletStore.fetchWallets(true)
}

onMounted(() => {
  if (savingsStore.vaults.length === 0) {
    fetchData()
  }
})
</script>

<template>
  <AppShell title="Goal Management" @back="router.push('/app/savings/goal')">
    <div v-if="vault && goal" class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 px-4">
      
      <!-- Goal Progress Card -->
      <div class="p-8 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden border border-white/10">
        <div class="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div class="relative z-10 space-y-8">
           <div class="flex justify-between items-start">
             <div>
               <h2 class="text-2xl font-black tracking-tight text-white uppercase">{{ goal.goal_name }}</h2>
               <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Goal Reference: {{ goal.goal_ref }}</p>
             </div>
             <div v-if="isAchieved" class="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xl animate-bounce relative">
               🏆
               <div class="absolute inset-0 rounded-full border-4 border-emerald-400 animate-ping opacity-20"></div>
             </div>
           </div>

           <!-- Celebration Overlay -->
           <div v-if="isAchieved" class="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
              <div v-for="n in 20" :key="n" 
                class="absolute animate-float" 
                :style="{ 
                  left: Math.random() * 100 + '%', 
                  top: Math.random() * 100 + '%', 
                  animationDelay: Math.random() * 5 + 's',
                  fontSize: Math.random() * 20 + 10 + 'px'
                }"
              >
                {{ ['🎉', '⭐', '🎈', '💸'][Math.floor(Math.random() * 4)] }}
              </div>
           </div>

           <div class="space-y-4">
             <div class="flex justify-between items-end">
               <div>
                 <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Saved</p>
                 <h3 class="text-3xl font-black tracking-tighter">{{ formatBalance(vault.available_balance) }}</h3>
               </div>
               <p class="text-[10px] font-black" :class="isAchieved ? 'text-emerald-400' : 'text-slate-400'">{{ progress }}% Reach</p>
             </div>
             <div class="h-4 w-full bg-white/5 rounded-full border border-white/5 overflow-hidden p-0.5">
               <div class="h-full bg-emerald-500 rounded-full transition-all duration-1000" :style="{ width: progress + '%' }"></div>
             </div>
             <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Target: {{ formatBalance(goal.target_amount) }}</p>
           </div>

           <!-- Accrued Interest Badge -->
           <div class="pt-6 border-t border-white/5 flex justify-between items-center">
             <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Yield Earned</span>
             </div>
             <span class="text-xs font-black text-emerald-400">+{{ formatBalance(vault.paid_interest) }}</span>
           </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="grid grid-cols-2 gap-4">
        <button @click="openFund" class="h-16 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-center gap-3 shadow-sm active:scale-95 transition-all">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          </div>
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white">Add Money</span>
        </button>
        <button @click="openWithdraw" class="h-16 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-center gap-3 shadow-sm active:scale-95 transition-all">
          <div class="w-10 h-10 rounded-xl bg-slate-500/10 text-slate-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>
          </div>
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white">Withdraw</span>
        </button>
      </div>

      <!-- Settings List -->
      <div class="space-y-4">
        <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Goal Settings</h3>
        <div class="space-y-px rounded-[2rem] overflow-hidden border border-slate-200 dark:border-white/5">
          
          <!-- Auto-Save Toggle -->
          <div class="p-6 bg-white dark:bg-slate-900 flex items-center justify-between border-b border-slate-100 dark:border-white/5">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-xl">
                 📅
              </div>
              <div>
                <h4 class="text-xs font-black text-slate-800 dark:text-white tracking-tight uppercase">Daily Auto-Save</h4>
                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Transfer automatically</p>
              </div>
            </div>
            <button 
              @click="toggleAutoSave"
              class="w-12 h-6 rounded-full transition-colors relative"
              :class="goal.auto_save_enabled ? 'bg-primary' : 'bg-slate-200 dark:bg-white/10'"
            >
              <div class="absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm" :class="goal.auto_save_enabled ? 'left-7' : 'left-1'"></div>
            </button>
          </div>

          <!-- Target Date -->
          <div class="p-6 bg-white dark:bg-slate-900 flex items-center justify-between border-b border-slate-100 dark:border-white/5">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-xl">
                 🕒
              </div>
              <div>
                <h4 class="text-xs font-black text-slate-800 dark:text-white tracking-tight uppercase">Target Date</h4>
                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Deadline for completion</p>
              </div>
            </div>
            <span class="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest px-3 py-1 bg-slate-50 dark:bg-white/5 rounded-full">
              {{ goal.target_date ? new Date(goal.target_date).toLocaleDateString() : 'None Set' }}
            </span>
          </div>
        </div>
      </div>

    </div>

    <!-- Empty State -->
    <div v-else class="py-20 text-center space-y-4">
      <div class="text-4xl">🔎</div>
      <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Goal not found</p>
      <button @click="router.push('/app/savings/goal')" class="text-primary font-black uppercase tracking-widest text-[10px]">Back to list</button>
    </div>

    <!-- Fund Sheet -->
    <Transition name="sheet">
      <div v-if="showFund" class="fixed inset-0 z-[150] flex flex-col justify-end">
        <div class="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" @click="showFund = false"></div>
        <div class="relative bg-white dark:bg-slate-900 rounded-t-[2.5rem] p-8 space-y-6 shadow-2xl border-t border-white/10">
          
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-black text-slate-800 dark:text-white">Fuel Your Goal</h3>
            <button @click="showFund = false" class="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          <div v-if="successMessage" class="py-10 flex flex-col items-center gap-4 text-emerald-500">
            <div class="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-3xl">🎯</div>
            <p class="text-[10px] font-black uppercase tracking-widest">{{ successMessage }}</p>
          </div>

          <div v-else class="space-y-6">
            <div v-if="step === 1" class="space-y-6">
              <div class="relative">
                <span class="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">₦</span>
                <input v-model="amount" type="number" placeholder="0.00" class="w-full h-20 pl-12 pr-6 rounded-[1.5rem] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-3xl font-black focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all" />
              </div>
              <p v-if="errorMessage" class="text-[10px] text-red-500 font-bold text-center uppercase tracking-widest">{{ errorMessage }}</p>
              <button @click="handleFund" class="w-full h-16 bg-emerald-500 text-white text-[10px] font-black rounded-[1.5rem] uppercase tracking-widest active:scale-95 transition-all shadow-xl">Confirm amount</button>
            </div>

            <div v-if="step === 2" class="space-y-8 py-4">
              <PinInput v-model="pin" label="Confirm Savings PUSH" @complete="handleFund" />
              <button @click="step = 1" class="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest">Back</button>
              <p v-if="isProcessing" class="text-[10px] text-primary font-bold text-center animate-pulse tracking-widest">Crediting Goal Vault...</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Withdraw Sheet -->
    <Transition name="sheet">
      <div v-if="showWithdraw" class="fixed inset-0 z-[150] flex flex-col justify-end">
        <div class="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" @click="showWithdraw = false"></div>
        <div class="relative bg-white dark:bg-slate-900 rounded-t-[2.5rem] p-8 space-y-6 shadow-2xl border-t border-white/10">
          
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-black text-slate-800 dark:text-white">Withdraw to Wallet</h3>
            <button @click="showWithdraw = false" class="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          <div v-if="successMessage" class="py-10 flex flex-col items-center gap-4 text-emerald-500">
            <div class="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-3xl">✓</div>
            <p class="text-[10px] font-black uppercase tracking-widest">Withdrawn to Main Wallet</p>
          </div>

          <div v-else class="space-y-6">
            <div v-if="step === 1" class="space-y-6">
              <div class="relative">
                <span class="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">₦</span>
                <input v-model="amount" type="number" placeholder="0.00" class="w-full h-20 pl-12 pr-6 rounded-[1.5rem] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-3xl font-black focus:ring-2 focus:ring-primary focus:outline-none transition-all" />
              </div>
              <p v-if="errorMessage" class="text-[10px] text-red-500 font-bold text-center uppercase tracking-widest">{{ errorMessage }}</p>
              <button @click="handleWithdraw" class="w-full h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black rounded-[1.5rem] uppercase tracking-widest active:scale-95 transition-all shadow-xl text-center">Execute Withdrawal</button>
            </div>

            <div v-if="step === 2" class="space-y-8 py-4">
              <PinInput v-model="pin" label="Confirm Identity" @complete="handleWithdraw" />
              <button @click="step = 1" class="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest">Adjust</button>
              <p v-if="isProcessing" class="text-[10px] text-primary font-bold text-center animate-pulse tracking-widest">Processing Goal Withdrawal...</p>
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

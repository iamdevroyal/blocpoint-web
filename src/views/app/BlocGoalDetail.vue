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

const showFund     = ref(false)
const showWithdraw = ref(false)
const showExtend   = ref(false)
const showAutoSave = ref(false)
const amount       = ref('')
const extendDate   = ref('')
const pin          = ref('')
const step         = ref(1) // 1: Amount, 2: PIN
const isProcessing = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// ─── Computed ───────────────────────────────────────────────────────────────

// Goal plans are stored flat in savingsStore.goalPlans as BlocGoalPlanResource objects
const goal      = computed(() => savingsStore.goalPlans.find(p => p.goal_ref === goalRef) ?? null)
const ngnWallet = computed(() => walletStore.wallets.find(w => w.currency === 'NGN'))

const progress = computed(() => {
  if (!goal.value) return 0
  const target = Number(goal.value.target_amount) || 1
  const saved  = Number(goal.value.available_balance) || 0
  return Math.min(100, Math.round((saved / target) * 100))
})

// 'achieved' = target balance reached (but NOT a hard gate — user can keep funding or withdraw)
const isAchieved = computed(() => goal.value?.status === 'achieved')

// 'expired' = target date passed AND previously marked expired by the backend
// Only expired goals block new funding — user must extend the date first
const isExpired = computed(() => goal.value?.status === 'expired')

// ─── Methods ────────────────────────────────────────────────────────────────

const openFund = () => {
  resetForm()
  showFund.value = true
}

const openWithdraw = () => {
  resetForm()
  showWithdraw.value = true
}

const openExtend = () => {
  errorMessage.value = ''
  successMessage.value = ''
  extendDate.value = ''
  showExtend.value = true
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
    if (goal.value && amount.value > goal.value.available_balance) {
      errorMessage.value = 'Insufficient goal balance'
      return
    }
    errorMessage.value = ''
    step.value = 2
    return
  }

  isProcessing.value = true
  try {
    await savingsStore.withdrawGoal(goalRef, amount.value)
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

const handleExtend = async () => {
  if (!extendDate.value) {
    errorMessage.value = 'Please pick a new target date.'
    return
  }
  isProcessing.value = true
  errorMessage.value = ''
  try {
    await savingsStore.extendGoal(goalRef, extendDate.value)
    successMessage.value = 'Goal extended! You can now add funds again.'
    setTimeout(() => {
      showExtend.value = false
      fetchData()
    }, 2000)
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'Extension failed.'
  } finally {
    isProcessing.value = false
  }
}

const toggleAutoSave = async () => {
  isProcessing.value = true
  errorMessage.value = ''
  try {
    await savingsStore.toggleAutoSave(goalRef)
    fetchData()
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'Failed to update auto-save setting.'
  } finally {
    isProcessing.value = false
  }
}

const fetchData = async () => {
  savingsStore.fetchGoalPlans(true)
  walletStore.fetchWallets(true)
}

onMounted(() => {
  if (savingsStore.goalPlans.length === 0) {
    fetchData()
  }
})
</script>

<template>
  <AppShell title="Goal Management" @back="router.push('/app/savings/goal')">
    <div v-if="goal" class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 px-4">
      
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
                 <h3 class="text-3xl font-black tracking-tighter">{{ formatBalance(goal.available_balance) }}</h3>
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
             <span class="text-xs font-black text-emerald-400">+{{ formatBalance(goal.paid_interest) }}</span>
           </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="space-y-3">

        <!-- ⏰ EXPIRED banner — goal date elapsed, must extend before funding again -->
        <div v-if="isExpired" class="p-5 rounded-[1.5rem] bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 flex items-center gap-4">
          <span class="text-3xl">⏰</span>
          <div class="flex-1">
            <h4 class="text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">Goal Expired</h4>
            <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400">Your deadline passed. Extend the date to keep saving, or withdraw your funds.</p>
          </div>
        </div>

        <!-- 🎉 ACHIEVED banner — target hit, but saving can still continue -->
        <div v-else-if="isAchieved" class="p-5 rounded-[1.5rem] bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 flex items-center gap-4">
          <span class="text-3xl">🎉</span>
          <div>
            <h4 class="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Goal Achieved!</h4>
            <p class="text-[10px] font-bold text-slate-500 dark:text-slate-400">You hit your target. Keep saving or withdraw your funds below.</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="grid gap-4" :class="isExpired ? 'grid-cols-2' : 'grid-cols-2'">

          <!-- Add Money — visible for active AND achieved; hidden only for expired -->
          <button
            v-if="!isExpired"
            @click="openFund"
            class="h-16 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-center gap-3 shadow-sm active:scale-95 transition-all"
          >
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            </div>
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white">Add Money</span>
          </button>

          <!-- Extend Goal — visible only for expired goals -->
          <button
            v-if="isExpired"
            @click="openExtend"
            class="h-16 rounded-[1.5rem] bg-orange-500 text-white border border-orange-400 flex items-center justify-center gap-3 shadow-sm active:scale-95 transition-all"
          >
            <div class="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/><circle cx="12" cy="12" r="9"/></svg>
            </div>
            <span class="text-[10px] font-black uppercase tracking-widest">Extend Goal</span>
          </button>

          <!-- Withdraw — always visible -->
          <button
            @click="openWithdraw"
            class="h-16 rounded-[1.5rem] flex items-center justify-center gap-3 shadow-sm active:scale-95 transition-all"
            :class="isAchieved && !isExpired
              ? 'bg-emerald-500 text-white border border-emerald-400'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5'"
          >
            <div class="w-10 h-10 rounded-xl flex items-center justify-center"
              :class="isAchieved && !isExpired ? 'bg-white/20 text-white' : 'bg-slate-500/10 text-slate-500'">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>
            </div>
            <span class="text-[10px] font-black uppercase tracking-widest"
              :class="isAchieved && !isExpired ? 'text-white' : 'text-slate-700 dark:text-white'"
            >Withdraw</span>
          </button>
        </div>
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

    <!-- Extend Goal Sheet — surfaces when goal is expired, lets agent pick a new deadline -->
    <Transition name="sheet">
      <div v-if="showExtend" class="fixed inset-0 z-[150] flex flex-col justify-end">
        <div class="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" @click="showExtend = false"></div>
        <div class="relative bg-white dark:bg-slate-900 rounded-t-[2.5rem] p-8 space-y-6 shadow-2xl border-t border-white/10">

          <div class="flex items-center justify-between">
            <h3 class="text-lg font-black text-slate-800 dark:text-white">Extend Goal Deadline</h3>
            <button @click="showExtend = false" class="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          <!-- Success state -->
          <div v-if="successMessage" class="py-10 flex flex-col items-center gap-4 text-orange-500">
            <div class="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center text-3xl">📅</div>
            <p class="text-[10px] font-black uppercase tracking-widest text-center">{{ successMessage }}</p>
          </div>

          <!-- Form state -->
          <div v-else class="space-y-6">
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase tracking-widest text-slate-400">New Target Date</label>
              <input
                v-model="extendDate"
                type="date"
                class="w-full h-16 px-6 rounded-[1.5rem] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-base font-black focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all text-slate-800 dark:text-white"
              />
            </div>

            <p v-if="errorMessage" class="text-[10px] text-red-500 font-bold text-center uppercase tracking-widest">{{ errorMessage }}</p>

            <button
              @click="handleExtend"
              :disabled="isProcessing"
              class="w-full h-16 bg-orange-500 text-white text-[10px] font-black rounded-[1.5rem] uppercase tracking-widest active:scale-95 transition-all shadow-xl disabled:opacity-50"
            >
              {{ isProcessing ? 'Extending…' : 'Extend &amp; Resume Saving' }}
            </button>
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

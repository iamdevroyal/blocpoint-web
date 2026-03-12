<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../../components/layout/AppShell.vue'
import { useSavingsStore } from '../../stores/savings'
import { useWalletStore } from '../../stores/wallet'
import { formatBalance } from '../../utils/transaction'

const router = useRouter()
const savingsStore = useSavingsStore()
const walletStore = useWalletStore()

// ─── State ──────────────────────────────────────────────────────────────────

const showCreate = ref(false)
const goalName = ref('')
const targetAmount = ref('')
const targetDate = ref('')
const isProcessing = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// ─── Computed ───────────────────────────────────────────────────────────────

const goalPlans = computed(() => savingsStore.vaults.filter(v => v.product_code === 'blocgoal'))
const goalProduct = computed(() => savingsStore.products.find(p => p.code === 'blocgoal'))

// ─── Methods ────────────────────────────────────────────────────────────────

const openCreate = () => {
  resetForm()
  showCreate.value = true
}

const resetForm = () => {
  goalName.value = ''
  targetAmount.value = ''
  targetDate.value = ''
  errorMessage.value = ''
  successMessage.value = ''
  isProcessing.value = false
}

const handleCreate = async () => {
  if (!goalName.value.trim()) {
    errorMessage.value = 'Give your goal a name'
    return
  }
  if (!targetAmount.value || targetAmount.value < 1000) {
    errorMessage.value = 'Minimum target is ₦1,000'
    return
  }

  isProcessing.value = true
  errorMessage.value = ''
  try {
    await savingsStore.createGoal({
      name: goalName.value,
      target_amount: targetAmount.value,
      target_date: targetDate.value || null
    })
    successMessage.value = 'Goal created! Time to start saving.'
    setTimeout(() => {
      showCreate.value = false
      fetchData()
    }, 2000)
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'Failed to create goal.'
  } finally {
    isProcessing.value = false
  }
}

const getProgress = (vault) => {
  const target = vault.goalPlan?.target_amount || 1
  const saved = vault.available_balance || 0
  return Math.min(100, Math.round((saved / target) * 100))
}

const getDaysLeft = (vault) => {
  if (!vault.goalPlan?.target_date) return null
  const end = new Date(vault.goalPlan.target_date).getTime()
  const now = Date.now()
  const diff = end - now
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

const fetchData = async () => {
  savingsStore.fetchVaults(true)
}

onMounted(() => {
  fetchData()
  if (savingsStore.products.length === 0) {
    savingsStore.fetchProducts()
  }
})
</script>

<template>
  <AppShell title="BlocGoal" @back="router.push('/app/savings')">
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 px-4">
      
      <!-- Intro Card -->
      <div class="rounded-[2.5rem] bg-emerald-500 p-8 shadow-2xl relative overflow-hidden text-white">
        <div class="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div class="relative z-10 space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">🎯</div>
            <div>
              <h2 class="text-xl font-black tracking-tight">Reach Your Goals</h2>
              <p class="text-[10px] font-bold uppercase tracking-widest opacity-60">Earn 12% PA as you save</p>
            </div>
          </div>
          <p class="text-xs font-medium leading-relaxed opacity-80">
            Create custom plans for your car, wedding, or vacation. We reward your consistency with our highest interest rate.
          </p>
          <button @click="openCreate" class="w-full h-14 bg-white text-emerald-600 text-[10px] font-black rounded-2xl uppercase tracking-widest active:scale-95 transition-all shadow-lg">
            Start New Goal
          </button>
        </div>
      </div>

      <!-- Goal Plans List -->
      <div class="space-y-4">
        <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
          <span>Your Savings Goals</span>
          <span class="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-[8px]">{{ goalPlans.length }}</span>
        </h3>

        <div v-if="goalPlans.length > 0" class="grid gap-4">
          <div 
            v-for="vault in goalPlans" 
            :key="vault.id"
            @click="router.push(`/app/savings/goal/${vault.goalPlan?.goal_ref || vault.id}`)"
            class="p-6 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-sm active:scale-[0.98] transition-all space-y-4 group"
          >
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  ⭐
                </div>
                <div>
                  <h4 class="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">{{ vault.goalPlan?.goal_name }}</h4>
                  <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    Target: {{ formatBalance(vault.goalPlan?.target_amount) }}
                  </p>
                </div>
              </div>
              <div v-if="getDaysLeft(vault) !== null" class="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[8px] font-black uppercase tracking-widest border border-blue-500/10">
                {{ getDaysLeft(vault) }}d Left
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex justify-between items-end">
                <p class="text-[16px] font-black tracking-tighter text-slate-800 dark:text-white">
                  {{ formatBalance(vault.available_balance) }}
                </p>
                <p class="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{{ getProgress(vault) }}%</p>
              </div>
              <div class="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div class="h-full bg-emerald-500 transition-all duration-1000" :style="{ width: getProgress(vault) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="py-16 text-center space-y-4 bg-white/30 dark:bg-slate-900/30 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/5">
          <div class="text-4xl opacity-20">🧗</div>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No goals set yet</p>
          <button @click="openCreate" class="text-[10px] font-black text-primary underline uppercase tracking-widest">What are you saving for?</button>
        </div>
      </div>

    </div>

    <!-- Create Goal Sheet -->
    <Transition name="sheet">
      <div v-if="showCreate" class="fixed inset-0 z-[150] flex flex-col justify-end">
        <div class="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" @click="showCreate = false"></div>
        <div class="relative bg-white dark:bg-slate-900 rounded-t-[2.5rem] p-8 space-y-6 shadow-2xl border-t border-white/10 max-h-[90vh] overflow-y-auto">
          
          <div class="flex items-center justify-between px-1">
            <h3 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">Define Your Goal</h3>
            <button @click="showCreate = false" class="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          <div v-if="successMessage" class="py-10 flex flex-col items-center gap-4 text-emerald-500">
            <div class="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-4xl">🚀</div>
            <p class="text-[11px] font-black uppercase tracking-widest text-center">{{ successMessage }}</p>
          </div>

          <div v-else class="space-y-6">
            <div class="space-y-4">
              <div class="space-y-1.5">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Goal Name</label>
                <input v-model="goalName" placeholder="e.g. Dream House, New Car" class="w-full h-16 px-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
              </div>

              <div class="space-y-1.5">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Target Amount</label>
                <div class="relative">
                  <span class="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-black text-slate-300">₦</span>
                  <input v-model="targetAmount" type="number" placeholder="0.00" class="w-full h-16 pl-10 pr-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xl font-black focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Target Date (Optional)</label>
                <input v-model="targetDate" type="date" class="w-full h-16 px-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
              </div>
            </div>

            <p v-if="errorMessage" class="text-[10px] text-red-500 font-bold text-center uppercase tracking-widest">{{ errorMessage }}</p>
            
            <button @click="handleCreate" :disabled="isProcessing" class="w-full h-16 bg-emerald-500 text-white text-[10px] font-black rounded-2xl uppercase tracking-[0.2em] active:scale-95 transition-all shadow-xl disabled:opacity-50">
              {{ isProcessing ? 'Creating...' : 'Create Goal' }}
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

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppShell from '../../components/layout/AppShell.vue'
import PinInput from '../../components/ui/PinInput.vue'
import { useSavingsStore } from '../../stores/savings'
import { useUIStore } from '../../stores/ui'
import { formatBalance } from '../../utils/transaction'

const route = useRoute()
const router = useRouter()
const savingsStore = useSavingsStore()
const uiStore = useUIStore()

const planRef = route.params.ref

// ─── State ──────────────────────────────────────────────────────────────────

const showBreak = ref(false)
const pin = ref('')
const isBreaking = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// ─── Computed ───────────────────────────────────────────────────────────────

// Lock plans are stored flat in savingsStore.lockPlans as BlocLockPlanResource objects
const plan = computed(() =>
  savingsStore.lockPlans.find(p => p.plan_ref === planRef) ?? null
)

const progress = computed(() => {
  if (!plan.value) return 0
  const start = new Date(plan.value.start_at).getTime()
  const end = new Date(plan.value.matures_at).getTime()
  const now = Date.now()
  
  if (now >= end) return 100
  const total = end - start
  const elapsed = now - start
  return Math.min(100, Math.max(0, (elapsed / total) * 100))
})

const daysRemaining = computed(() => {
  if (!plan.value) return 0
  const end = new Date(plan.value.matures_at).getTime()
  const now = Date.now()
  const diff = end - now
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
})

// ─── Methods ────────────────────────────────────────────────────────────────

const confirmBreak = () => {
  uiStore.showConfirm({
    title: 'Break Lock Early?',
    message: 'Breaking early will forfeit ALL accrued interest. Only your principal will be returned to your wallet.',
    confirmText: 'Yes, Break it',
    cancelText: 'Keep Saving',
    onConfirm: () => {
      showBreak.value = true
    }
  })
}

const handleBreak = async () => {
  if (!pin.value || pin.value.length < 4) {
    errorMessage.value = 'Enter your 4-digit PIN'
    return
  }

  isBreaking.value = true
  errorMessage.value = ''
  try {
    await savingsStore.breakLock(planRef)
    successMessage.value = 'Lock broken. Principal returned to wallet.'
    setTimeout(() => {
      showBreak.value = false
      router.push('/app/savings/lock')
    }, 2000)
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'Failed to break lock.'
  } finally {
    isBreaking.value = false
  }
}

onMounted(async () => {
  if (savingsStore.lockPlans.length === 0) {
    await savingsStore.fetchLockPlans()
  }
})
</script>

<template>
  <AppShell title="Plan Details" @back="router.push('/app/savings/lock')">
    <div v-if="plan" class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 px-4">
      
      <!-- Summary Card -->
      <div class="p-8 rounded-[2.5rem] bg-indigo-600 text-white shadow-2xl relative overflow-hidden">
        <div class="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div class="relative z-10 space-y-6 text-center">
           <p class="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Locked Amount</p>
           <h2 class="text-4xl font-black tracking-tighter">{{ formatBalance(plan.amount) }}</h2>
           
           <div class="space-y-2">
             <div class="flex justify-between items-center text-[9px] font-black uppercase tracking-widest px-1">
               <span class="opacity-60">Maturity Progress</span>
               <span>{{ Math.round(progress) }}%</span>
             </div>
             <div class="h-3 w-full bg-black/20 rounded-full overflow-hidden border border-white/5">
                <div class="h-full bg-white transition-all duration-1000" :style="{ width: progress + '%' }"></div>
             </div>
           </div>

           <div class="flex justify-center gap-4 text-[10px] font-black uppercase tracking-widest pt-2">
             <div class="px-4 py-2 bg-white/10 rounded-2xl border border-white/10">
               {{ daysRemaining }} Days Left
             </div>
             <div class="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/20">
               {{ plan.interest_rate * 100 }}% PA
             </div>
           </div>
        </div>
      </div>

      <!-- Detail Grid -->
      <div class="grid gap-4">
        <div v-for="item in [
          { label: 'Start Date', value: new Date(plan.start_at).toLocaleDateString() },
          { label: 'Maturity Date', value: new Date(plan.matures_at).toLocaleDateString() },
          { label: 'Expected Interest', value: formatBalance(plan.expected_interest), color: 'text-emerald-500' },
          { label: 'Pledge Status', value: plan.status, color: 'text-blue-500' },
          { label: 'Principal', value: formatBalance(plan.amount) },
        ]" :key="item.label" 
          class="flex justify-between items-center p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5"
        >
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ item.label }}</span>
          <span class="text-xs font-black uppercase tracking-tight" :class="item.color || 'text-slate-800 dark:text-white'">{{ item.value }}</span>
        </div>
      </div>

      <!-- Info Box -->
      <div class="p-6 rounded-[2rem] bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 flex gap-4">
        <div class="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0">ℹ️</div>
        <p class="text-[10px] font-semibold text-blue-800 dark:text-blue-300 leading-relaxed uppercase tracking-wider">
          Your funds are being invested in high-yield treasury assets. Maturity payouts are processed automatically into your <span class="text-blue-500 font-black">BlocFlex</span> vault on the maturity date.
        </p>
      </div>

      <!-- Break Button -->
      <div class="pt-4">
        <button 
          @click="confirmBreak"
          class="w-full h-16 rounded-[1.5rem] bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
        >
          Break Lock Early
        </button>
      </div>

    </div>

    <!-- Error State -->
    <div v-else class="py-20 text-center space-y-4">
      <div class="text-4xl">🔎</div>
      <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Plan not found</p>
      <button @click="router.push('/app/savings/lock')" class="text-primary font-black uppercase tracking-widest text-[10px]">Back to list</button>
    </div>

    <!-- Break PIN Sheet -->
    <Transition name="sheet">
      <div v-if="showBreak" class="fixed inset-0 z-[150] flex flex-col justify-end">
        <div class="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" @click="showBreak = false"></div>
        <div class="relative bg-white dark:bg-slate-900 rounded-t-[2.5rem] p-8 space-y-8 shadow-2xl border-t border-white/10">
          
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-black text-slate-800 dark:text-white">Confirm Early Break</h3>
              <p class="text-[10px] text-rose-500 font-bold uppercase tracking-widest">Forfeiting {{ formatBalance(plan?.expected_interest) }}</p>
            </div>
            <button @click="showBreak = false" class="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          <div v-if="successMessage" class="py-10 flex flex-col items-center gap-4 text-emerald-500">
            <div class="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-3xl">✓</div>
            <p class="text-[10px] font-black uppercase tracking-widest">{{ successMessage }}</p>
          </div>

          <div v-else class="space-y-8">
            <PinInput v-model="pin" label="Enter PIN to Break Lock" @complete="handleBreak" />
            
            <p v-if="errorMessage" class="text-[10px] text-red-500 font-bold text-center uppercase tracking-widest">{{ errorMessage }}</p>
            
            <div class="space-y-3">
              <button 
                @click="handleBreak" 
                :disabled="isBreaking"
                class="w-full h-16 bg-rose-500 text-white text-[10px] font-black rounded-2xl uppercase tracking-widest active:scale-95 transition-all shadow-xl disabled:opacity-50"
              >
                {{ isBreaking ? 'Processing...' : 'Break & Return Principal' }}
              </button>
              <button @click="showBreak = false" class="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest">Keep This Plan</button>
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

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../../components/layout/AppShell.vue'
import { useSavingsStore } from '../../stores/savings'
import { formatBalance, transactionIcon, transactionDisplayName, formatTransactionAmount } from '../../utils/transaction'

const router = useRouter()
const savingsStore = useSavingsStore()

// ─── State ──────────────────────────────────────────────────────────────────

const isLoading = ref(false)
const showModePicker = ref(false)

// ─── Computed ───────────────────────────────────────────────────────────────

const rule = computed(() => savingsStore.roundRule)
const transactions = computed(() => savingsStore.transactions.data || [])
const isTxLoading = computed(() => savingsStore.transactions.loading)

const triggers = [
  { id: 'transfer_out', name: 'Transfers Out', icon: '📤', desc: 'Bank & P2P transfers' },
  { id: 'bill_payment', name: 'Bill Payments', icon: '🧾', desc: 'Utility & TV bills' },
  { id: 'card_spend', name: 'Card Spending', icon: '💳', desc: 'POS & Web payments' },
  { id: 'inflow', name: 'Wallet Inflow', icon: '📥', desc: 'Incoming transfers' },
]

const roundingModes = [
  { id: 'nearest_100', name: 'Nearest ₦100', desc: 'Round ₦450 to ₦500' },
  { id: 'nearest_500', name: 'Nearest ₦500', desc: 'Round ₦4,600 to ₦5,000' },
  { id: 'fixed_amount', name: 'Fixed Amount', desc: 'Save a flat ₦50 per tx' },
  { id: 'percentage', name: 'Percentage', desc: 'Save 1% of transaction' },
]

// ─── Methods ────────────────────────────────────────────────────────────────

const toggleMaster = async () => {
  try {
    await savingsStore.toggleRoundRule()
  } catch (err) {}
}

const toggleTrigger = async (triggerId) => {
  try {
    await savingsStore.toggleRoundTrigger(triggerId)
  } catch (err) {}
}

const updateMode = async (mode) => {
  try {
    await savingsStore.updateRoundRule({ rounding_mode: mode })
    showModePicker.value = false
  } catch (err) {}
}

const isTriggerEnabled = (id) => {
  if (!rule.value) return false
  return rule.value[`${id}_enabled`]
}

onMounted(() => {
  savingsStore.fetchRoundRule()
  savingsStore.fetchTransactions(1, { product_code: 'blocround' })
})
</script>

<template>
  <AppShell title="BlocRound" @back="router.push('/app/savings')">
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 px-4">
      
      <!-- Premium Hero Card -->
      <div class="rounded-[2.5rem] bg-slate-900 border border-white/10 p-8 shadow-2xl relative overflow-hidden">
        <div class="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div class="relative z-10 flex flex-col items-center text-center space-y-4">
          <div class="w-20 h-20 rounded-[2rem] bg-amber-500 text-white flex items-center justify-center text-4xl shadow-xl shadow-amber-500/20">
            🔄
          </div>
          <div>
            <h2 class="text-xl font-black text-white tracking-tight">Save as you spend</h2>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Automatic spare change savings</p>
          </div>
          
          <!-- Master Toggle Button -->
          <button 
            @click="toggleMaster"
            class="w-full h-14 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
            :class="rule?.is_enabled ? 'bg-emerald-500 text-white' : 'bg-white/5 border border-white/10 text-slate-400'"
          >
            <span class="text-[10px] font-black uppercase tracking-[0.2em]">{{ rule?.is_enabled ? 'BlocRound is ON' : 'Turn ON BlocRound' }}</span>
            <div class="w-10 h-5 rounded-full relative transition-colors" :class="rule?.is_enabled ? 'bg-white/20' : 'bg-slate-700'">
               <div class="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-md" :class="rule?.is_enabled ? 'left-5.5' : 'left-0.5'"></div>
            </div>
          </button>
        </div>
      </div>

      <!-- Rounding Settings -->
      <div v-if="rule?.is_enabled" class="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
        <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Configuration</h3>
        
        <div @click="showModePicker = true" class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-between shadow-sm active:scale-[0.98] transition-all">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl">📐</div>
            <div>
              <h4 class="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">Rounding Mode</h4>
              <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{{ rule.rounding_mode?.replace('_', ' ') || 'Nearest ₦100' }}</p>
            </div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-slate-300"><path d="m9 18 6-6-6-6"/></svg>
        </div>

        <!-- Trigger Toggles Grid -->
        <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 pt-2">Active Triggers</h3>
        <div class="grid grid-cols-2 gap-4">
          <div 
            v-for="t in triggers" 
            :key="t.id"
            @click="toggleTrigger(t.id)"
            class="p-5 rounded-3xl border transition-all duration-300 relative overflow-hidden active:scale-95"
            :class="isTriggerEnabled(t.id) 
              ? 'bg-white dark:bg-slate-900 border-emerald-500/50 shadow-md' 
              : 'bg-slate-50 dark:bg-white/5 border-transparent opacity-60'"
          >
             <div class="flex flex-col gap-3 relative z-10">
               <div class="flex justify-between items-start">
                 <span class="text-xl">{{ t.icon }}</span>
                 <div class="w-8 h-4 rounded-full relative transition-colors" :class="isTriggerEnabled(t.id) ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'">
                    <div class="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all shadow-sm" :class="isTriggerEnabled(t.id) ? 'left-4.5' : 'left-0.5'"></div>
                 </div>
               </div>
               <div>
                 <p class="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tight">{{ t.name }}</p>
                 <p class="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">{{ t.desc }}</p>
               </div>
             </div>
          </div>
        </div>

        <!-- Caps Configuration (NEW) -->
        <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 pt-2">Savings Limits</h3>
        <div class="grid grid-cols-2 gap-4">
            <div class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 space-y-2">
                <label class="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Daily Cap</label>
                <div class="relative">
                    <span class="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300 text-xs font-black">₦</span>
                    <input 
                        type="number" 
                        v-model="rule.daily_cap" 
                        @change="savingsStore.updateRoundRule({ daily_cap: rule.daily_cap })"
                        placeholder="Unlimited"
                        class="w-full bg-transparent border-0 pl-3 text-xs font-black text-slate-800 dark:text-white focus:ring-0 p-0"
                    />
                </div>
            </div>
            <div class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 space-y-2">
                <label class="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Monthly Cap</label>
                <div class="relative">
                    <span class="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300 text-xs font-black">₦</span>
                    <input 
                        type="number" 
                        v-model="rule.monthly_cap" 
                        @change="savingsStore.updateRoundRule({ monthly_cap: rule.monthly_cap })"
                        placeholder="Unlimited"
                        class="w-full bg-transparent border-0 pl-3 text-xs font-black text-slate-800 dark:text-white focus:ring-0 p-0"
                    />
                </div>
            </div>
        </div>
      </div>

      <!-- Round-up History -->
      <div v-if="rule?.is_enabled" class="space-y-4">
        <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Round-up History</h3>
        
        <div v-if="isTxLoading && transactions.length === 0" class="space-y-3">
          <div v-for="i in 3" :key="i" class="h-16 rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse"></div>
        </div>

        <div v-else-if="transactions.length > 0" class="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden">
          <div v-for="tx in transactions" :key="tx.id" class="flex items-center justify-between p-5 border-b border-slate-100 dark:border-white/5 last:border-0 border-l-4" :class="tx.direction === 'credit' ? 'border-l-emerald-500' : 'border-l-transparent'">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-slate-100 dark:bg-white/5">
                {{ transactionIcon(tx.type) }}
              </div>
              <div>
                <h4 class="text-xs font-black text-slate-800 dark:text-white">{{ transactionDisplayName(tx) }}</h4>
                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{{ new Date(tx.created_at).toLocaleString() }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-xs font-black text-emerald-500 tracking-tight">+{{ formatBalance(tx.amount) }}</p>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="py-16 text-center space-y-4 bg-white/30 dark:bg-slate-900/30 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-white/5">
          <div class="text-3xl opacity-20">🪙</div>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-8">Your spare change will appear here as you spend.</p>
        </div>
      </div>

    </div>

    <!-- Mode Picker Sheet -->
    <Transition name="sheet">
      <div v-if="showModePicker" class="fixed inset-0 z-[150] flex flex-col justify-end">
        <div class="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" @click="showModePicker = false"></div>
        <div class="relative bg-white dark:bg-slate-900 rounded-t-[2.5rem] p-8 space-y-6 shadow-2xl border-t border-white/10">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-black text-slate-800 dark:text-white tracking-tight">Rounding Policy</h3>
            <button @click="showModePicker = false" class="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          <div class="grid gap-3 pt-2">
            <button 
              v-for="m in roundingModes" 
              :key="m.id"
              @click="updateMode(m.id)"
              class="flex items-center justify-between p-5 rounded-2xl border transition-all active:scale-[0.98]"
              :class="rule.rounding_mode === m.id ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-500' : 'bg-slate-50 dark:bg-white/5 border-transparent'"
            >
              <div class="text-left">
                <p class="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">{{ m.name }}</p>
                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{{ m.desc }}</p>
              </div>
              <div v-if="rule.rounding_mode === m.id" class="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center">
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </div>
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

.left-5.5 { left: 1.375rem; }
.left-4.5 { left: 1.125rem; }
</style>

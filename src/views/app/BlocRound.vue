<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../../components/layout/AppShell.vue'
import { useSavingsStore } from '../../stores/savings'
import { formatBalance, transactionIcon, transactionDisplayName } from '../../utils/transaction'

const router = useRouter()
const savingsStore = useSavingsStore()

// ─── State ──────────────────────────────────────────────────────────────────

const isToggling   = ref(false)
const toggling     = ref(null)   // which trigger id is currently toggling
const showModePicker = ref(false)

// ─── Computed ───────────────────────────────────────────────────────────────

const rule         = computed(() => savingsStore.roundRule)
const transactions = computed(() => savingsStore.transactions.data || [])
const isTxLoading  = computed(() => savingsStore.transactions.loading)
const isEnabled    = computed(() => rule.value?.is_enabled)

const triggers = [
  { id: 'transfer_out', name: 'Transfers Out',  icon: '📤', desc: 'Bank & P2P transfers'   },
  { id: 'bill_payment', name: 'Bill Payments',  icon: '🧾', desc: 'Utility & TV bills'      },
  { id: 'card_spend',   name: 'Card Spending',  icon: '💳', desc: 'POS & web payments'      },
  { id: 'inflow',       name: 'Wallet Inflow',  icon: '📥', desc: 'Incoming transfers'      },
]

const roundingModes = [
  { id: 'nearest_100',  name: 'Nearest ₦100',  desc: 'Round ₦450 → ₦500'    },
  { id: 'nearest_500',  name: 'Nearest ₦500',  desc: 'Round ₦4,600 → ₦5,000' },
  { id: 'fixed_amount', name: 'Fixed Amount',   desc: 'Flat ₦50 per transaction' },
  { id: 'percentage',   name: 'Percentage',     desc: 'Save 1% of each tx'    },
]

// ─── Methods ────────────────────────────────────────────────────────────────

const toggleMaster = async () => {
  if (isToggling.value) return
  isToggling.value = true
  try {
    await savingsStore.toggleRoundRule()
  } catch (err) {
    console.error(err)
  } finally {
    isToggling.value = false
  }
}

const toggleTrigger = async (triggerId) => {
  if (toggling.value === triggerId) return
  toggling.value = triggerId
  try {
    await savingsStore.toggleRoundTrigger(triggerId)
  } catch (err) {
    console.error(err)
  } finally {
    toggling.value = null
  }
}

const updateMode = async (mode) => {
  try {
    await savingsStore.updateRoundRule({ rounding_mode: mode })
    showModePicker.value = false
  } catch (err) {}
}

const isTriggerEnabled = (id) => {
  if (!rule.value || !rule.value.triggers) return false
  return !!rule.value.triggers[id]
}

onMounted(() => {
  savingsStore.fetchRoundRule()
  savingsStore.fetchTransactions(1, { product_code: 'blocround' })
})
</script>

<template>
  <AppShell title="BlocRound" @back="router.push('/app/savings')">
    <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 px-4">

      <!-- Hero Master Switch Card -->
      <div
        class="rounded-[2.5rem] relative overflow-hidden shadow-2xl transition-all duration-500"
        :class="isEnabled ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-slate-900 border border-white/10'"
      >
        <div class="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl pointer-events-none"
          :class="isEnabled ? 'bg-white/10' : 'bg-amber-500/10'"></div>

        <div class="relative z-10 p-8 space-y-6">
          <!-- Icon + Title -->
          <div class="flex items-center gap-4">
            <div
              class="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-xl transition-all duration-500"
              :class="isEnabled ? 'bg-white/20' : 'bg-amber-500/20'"
            >🔄</div>
            <div>
              <h2 class="text-xl font-black tracking-tight" :class="isEnabled ? 'text-white' : 'text-white'">BlocRound</h2>
              <p class="text-[10px] font-bold uppercase tracking-widest" :class="isEnabled ? 'text-white/60' : 'text-slate-400'">
                {{ isEnabled ? 'Actively saving spare change' : 'Automatic spare change savings' }}
              </p>
            </div>
          </div>

          <!-- Big Animated Toggle -->
          <button
            @click="toggleMaster"
            :disabled="isToggling"
            class="w-full flex items-center justify-between p-5 rounded-2xl transition-all duration-300 active:scale-[0.97]"
            :class="isEnabled ? 'bg-white/10 border border-white/20' : 'bg-white/5 border border-white/10'"
          >
            <div class="flex flex-col items-start gap-0.5">
              <span class="text-[10px] font-black uppercase tracking-[0.2em]"
                :class="isEnabled ? 'text-white' : 'text-slate-400'">
                {{ isToggling ? 'Updating…' : isEnabled ? 'BlocRound is ON' : 'Turn ON BlocRound' }}
              </span>
              <span class="text-[9px] font-bold uppercase tracking-widest"
                :class="isEnabled ? 'text-white/50' : 'text-slate-600'">
                {{ isEnabled ? 'Tap to disable' : 'Start saving automatically' }}
              </span>
            </div>

            <!-- Pill Toggle -->
            <div
              class="w-16 h-8 rounded-full relative transition-all duration-500 flex-shrink-0"
              :class="isEnabled ? 'bg-white' : 'bg-slate-700/80'"
            >
              <div
                class="absolute top-1 w-6 h-6 rounded-full shadow-md transition-all duration-500"
                :class="isEnabled ? 'left-9 bg-amber-500' : 'left-1 bg-slate-500'"
              ></div>
            </div>
          </button>
        </div>
      </div>

      <!-- Settings Panel (only when enabled) -->
      <div v-if="isEnabled" class="space-y-5 animate-in fade-in slide-in-from-top-2 duration-400">

        <!-- Rounding Mode Selector -->
        <div class="space-y-2">
          <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Rounding Policy</h3>
          <button
            @click="showModePicker = true"
            class="w-full p-5 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-between shadow-sm active:scale-[0.98] transition-all"
          >
            <div class="flex items-center gap-4">
              <div class="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl">📐</div>
              <div class="text-left">
                <h4 class="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">Rounding Mode</h4>
                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  {{ rule?.rounding_mode?.replaceAll('_', ' ') || 'Nearest ₦100' }}
                </p>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
              class="text-slate-300">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>

        <!-- Trigger Toggles — full width rows -->
        <div class="space-y-2">
          <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Active Triggers</h3>
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[1.5rem] overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-white/5">
            <button
              v-for="t in triggers"
              :key="t.id"
              @click="toggleTrigger(t.id)"
              :disabled="toggling === t.id"
              class="w-full flex items-center justify-between p-4 transition-all active:bg-slate-50 dark:active:bg-white/5"
            >
              <div class="flex items-center gap-4">
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-300"
                  :class="isTriggerEnabled(t.id) ? 'bg-amber-500/10' : 'bg-slate-100 dark:bg-white/5'"
                >{{ t.icon }}</div>
                <div class="text-left">
                  <p class="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">{{ t.name }}</p>
                  <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{{ t.desc }}</p>
                </div>
              </div>

              <!-- Animated mini toggle or spinner -->
              <div v-if="toggling === t.id" class="w-10 h-5 flex items-center justify-center">
                <div class="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div v-else
                class="w-11 h-6 rounded-full relative transition-all duration-300 flex-shrink-0"
                :class="isTriggerEnabled(t.id) ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'"
              >
                <div
                  class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300"
                  :class="isTriggerEnabled(t.id) ? 'left-5.5' : 'left-0.5'"
                ></div>
              </div>
            </button>
          </div>
        </div>

        <!-- Savings Caps -->
        <div class="space-y-2">
          <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Savings Limits</h3>
          <div class="grid grid-cols-2 gap-3">
            <div class="p-4 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 space-y-1.5">
              <label class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Daily Cap</label>
              <div class="relative flex items-center">
                <span class="text-slate-300 text-sm font-black mr-1">₦</span>
                <input
                  type="number"
                  v-model="rule.daily_cap"
                  @change="savingsStore.updateRoundRule({ daily_cap: rule.daily_cap })"
                  placeholder="Unlimited"
                  class="w-full bg-transparent border-0 text-xs font-black text-slate-800 dark:text-white focus:ring-0 p-0 placeholder:text-slate-300"
                />
              </div>
            </div>
            <div class="p-4 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 space-y-1.5">
              <label class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Monthly Cap</label>
              <div class="relative flex items-center">
                <span class="text-slate-300 text-sm font-black mr-1">₦</span>
                <input
                  type="number"
                  v-model="rule.monthly_cap"
                  @change="savingsStore.updateRoundRule({ monthly_cap: rule.monthly_cap })"
                  placeholder="Unlimited"
                  class="w-full bg-transparent border-0 text-xs font-black text-slate-800 dark:text-white focus:ring-0 p-0 placeholder:text-slate-300"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Round-up History -->
        <div class="space-y-2">
          <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Round-up History</h3>

          <div v-if="isTxLoading && transactions.length === 0" class="space-y-3">
            <div v-for="i in 3" :key="i" class="h-16 rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse"></div>
          </div>

          <div v-else-if="transactions.length > 0"
            class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[1.5rem] overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-white/5">
            <div
              v-for="tx in transactions"
              :key="tx.id"
              class="flex items-center justify-between p-4"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-lg">
                  {{ transactionIcon(tx.type) }}
                </div>
                <div>
                  <h4 class="text-xs font-black text-slate-800 dark:text-white">{{ transactionDisplayName(tx) }}</h4>
                  <p class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                    {{ new Date(tx.created_at).toLocaleString() }}
                  </p>
                </div>
              </div>
              <p class="text-xs font-black text-amber-500 tracking-tight">+{{ formatBalance(tx.amount) }}</p>
            </div>
          </div>

          <div v-else class="py-12 text-center space-y-3 bg-white/30 dark:bg-slate-900/30 rounded-[1.5rem] border-2 border-dashed border-slate-200 dark:border-white/5">
            <div class="text-3xl opacity-20">🪙</div>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-8">Your spare change will appear here as you spend.</p>
          </div>
        </div>
      </div>

      <!-- Info when disabled -->
      <div v-if="!isEnabled" class="p-6 rounded-[2rem] bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 space-y-3">
        <p class="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">How it works</p>
        <div class="space-y-2">
          <div v-for="tip in [
            { icon: '💸', text: 'You make a ₦1,450 transfer' },
            { icon: '🔄', text: 'We round it up to ₦1,500' },
            { icon: '💰', text: '₦50 drops into your BlocFlex vault' },
          ]" :key="tip.text" class="flex items-center gap-3">
            <span class="text-lg">{{ tip.icon }}</span>
            <p class="text-xs font-semibold text-amber-800 dark:text-amber-300">{{ tip.text }}</p>
          </div>
        </div>
      </div>

    </div>

    <!-- Mode Picker Sheet -->
    <Transition name="sheet">
      <div v-if="showModePicker" class="fixed inset-0 z-[150] flex flex-col justify-end">
        <div class="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" @click="showModePicker = false"></div>
        <div class="relative bg-white dark:bg-slate-900 rounded-t-[2.5rem] p-8 space-y-5 shadow-2xl border-t border-white/10">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-black text-slate-800 dark:text-white tracking-tight">Rounding Policy</h3>
            <button @click="showModePicker = false" class="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          <div class="grid gap-3">
            <button
              v-for="m in roundingModes"
              :key="m.id"
              @click="updateMode(m.id)"
              class="flex items-center justify-between p-4 rounded-2xl border transition-all active:scale-[0.98]"
              :class="rule?.rounding_mode === m.id
                ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-500'
                : 'bg-slate-50 dark:bg-white/5 border-transparent'"
            >
              <div class="text-left">
                <p class="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">{{ m.name }}</p>
                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{{ m.desc }}</p>
              </div>
              <div v-if="rule?.rounding_mode === m.id"
                class="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
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
.left-5\.5 { left: 1.375rem; }
</style>

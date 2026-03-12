<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../../components/layout/AppShell.vue'
import { useSavingsStore } from '../../stores/savings'

const router = useRouter()
const savingsStore = useSavingsStore()

// ─── Computed Stats ──────────────────────────────────────────────────────────

const totalBalance = computed(() => savingsStore.overview?.total_balance || 0)
const totalInterest = computed(() => savingsStore.overview?.total_interest_earned || 0)
const activeVaultsCount = computed(() => savingsStore.overview?.active_vaults_count || 0)

// ─── Product Cards Configuration ──────────────────────────────────────────────

const products = [
  {
    code: 'blocflex',
    name: 'BlocFlex',
    description: 'Liquid savings with daily interest. Withdraw anytime.',
    icon: '💧',
    color: 'bg-blue-500',
    gradient: 'from-blue-500 to-cyan-400',
    route: '/app/savings/flex'
  },
  {
    code: 'bloclock',
    name: 'BlocLock',
    description: 'Fixed-term savings for higher returns.',
    icon: '🔒',
    color: 'bg-indigo-600',
    gradient: 'from-indigo-600 to-purple-500',
    route: '/app/savings/lock'
  },
  {
    code: 'blocgoal',
    name: 'BlocGoal',
    description: 'Save toward specific life goals and milestones.',
    icon: '🎯',
    color: 'bg-emerald-500',
    gradient: 'from-emerald-500 to-teal-400',
    route: '/app/savings/goal'
  },
  {
    code: 'blocround',
    name: 'BlocRound',
    description: 'Automatically save your spare change as you spend.',
    icon: '🔄',
    color: 'bg-amber-500',
    gradient: 'from-amber-500 to-orange-400',
    route: '/app/savings/round'
  }
]

const getProductRate = (code) => {
  const p = savingsStore.products.find(item => item.code === code)
  if (!p) return null
  return (p.interest_rate * 100).toFixed(0) + '%'
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(async () => {
  savingsStore.fetchOverview()
  savingsStore.fetchProducts()
  savingsStore.fetchVaults()
})
</script>

<template>
  <AppShell title="BlocSave">
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 px-4">
      
      <!-- Summary Header Card -->
      <div class="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-white/10 p-8 shadow-2xl">
        <div class="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
        <div class="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <div class="relative z-10 space-y-6">
          <div class="flex justify-between items-start">
            <div class="space-y-1">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Savings Balance</p>
              <h2 class="text-4xl font-black text-white tracking-tighter leading-none">
                ₦{{ totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
              </h2>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl">
              💰
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
            <div class="space-y-1">
              <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Interest Earned</p>
              <p class="text-sm font-bold text-emerald-400 tracking-tight">+₦{{ totalInterest.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</p>
            </div>
            <div class="space-y-1">
              <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Plans</p>
              <p class="text-sm font-bold text-white tracking-tight">{{ activeVaultsCount }} Plans</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Products Grid -->
      <div class="space-y-4">
        <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
          <span class="w-1 h-1 rounded-full bg-primary animate-pulse"></span>
          Saving Products
        </h3>
        
        <div class="grid gap-4">
          <div 
            v-for="p in products" 
            :key="p.code"
            @click="router.push(p.route)"
            class="group relative overflow-hidden rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer active:scale-[0.98]"
          >
            <!-- Background Glow on Hover -->
            <div 
              class="absolute inset-0 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity bg-gradient-to-br"
              :class="p.gradient"
            ></div>

            <div class="relative z-10 flex items-center gap-5">
              <!-- Icon Base -->
              <div 
                class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg shrink-0 group-hover:scale-110 transition-transform duration-500"
                :class="[p.color, 'text-white']"
              >
                {{ p.icon }}
              </div>

              <!-- Content -->
              <div class="flex-1 space-y-1">
                <div class="flex items-center justify-between">
                  <h4 class="text-sm font-black text-slate-800 dark:text-white tracking-tight">{{ p.name }}</h4>
                  <div 
                    v-if="getProductRate(p.code)"
                    class="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-black tracking-widest uppercase border border-emerald-500/20"
                  >
                    Up to {{ getProductRate(p.code) }} PA
                  </div>
                </div>
                <p class="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{{ p.description }}</p>
              </div>

              <!-- Chevron -->
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-700 group-hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Tips / Knowledge Section -->
      <div class="rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-6 space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4Z"/></svg>
          </div>
          <div>
            <h5 class="text-xs font-black text-slate-800 dark:text-white tracking-tight">Smart Saving Tips</h5>
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Maximize your returns</p>
          </div>
        </div>
        
        <p class="text-[10px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic">
          "Did you know? Enabling <b>BlocRound</b> on transfer transactions can help you save up to ₦15,000 monthly without even trying."
        </p>

        <button @click="router.push('/app/support')" class="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5 hover:gap-2 transition-all">
          Learn more about BlocSave
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
      </div>

    </div>
  </AppShell>
</template>

<style scoped>
.animate-in {
  animation-duration: 0.7s;
}
</style>

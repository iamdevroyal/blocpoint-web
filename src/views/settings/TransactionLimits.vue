<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../../components/layout/AppShell.vue'

const router = useRouter()
const limits = [
  { name: 'Daily Sending', limit: '₦500,000.00', used: '₦12,500.00', color: 'bg-primary' },
  { name: 'Daily Receiving', limit: '₦1,000,000.00', used: '₦45,000.00', color: 'bg-indigo-500' },
  { name: 'Monthly Limits', limit: '₦5,000,000.00', used: '₦320,000.00', color: 'bg-emerald-500' },
]

const getPercent = (used, limit) => {
  const u = parseFloat(used.replace(/[^0-9.]/g, ''))
  const l = parseFloat(limit.replace(/[^0-9.]/g, ''))
  return (u / l * 100)
}
</script>

<template>
  <AppShell title="Transaction Limits">
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 px-2">
      
      <!-- Warning Banner -->
      <div class="p-6 bg-amber-500/10 border border-amber-500/20 rounded-[2.5rem] flex items-start gap-4 ring-1 ring-amber-500/5">
        <div class="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20 shrink-0">⚠️</div>
        <div class="space-y-1">
          <h3 class="text-sm font-bold text-amber-600 dark:text-amber-400 tracking-tight">Limits Reminder</h3>
          <p class="text-[10px] font-medium text-amber-700/70 dark:text-amber-400/60 leading-relaxed uppercase tracking-widest">Upgrade your account to Level 3 to access unlimited transactions and professional settlements.</p>
        </div>
      </div>

      <!-- Limit Progress -->
      <div class="space-y-6">
        <div v-for="lim in limits" :key="lim.name" class="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl space-y-6">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">{{ lim.name }}</h4>
            <span class="text-[10px] font-black text-primary uppercase tracking-widest">{{ lim.limit }} Max</span>
          </div>

          <div class="space-y-3">
            <div class="h-3 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner border border-black/5 dark:border-white/5">
              <div 
                class="h-full rounded-full transition-all duration-1000"
                :class="lim.color"
                :style="{ width: getPercent(lim.used, lim.limit) + '%' }"
              ></div>
            </div>
            <div class="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
              <span class="text-slate-400">Used: {{ lim.used }}</span>
              <span class="text-slate-800 dark:text-white">{{ getPercent(lim.used, lim.limit).toFixed(1) }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Upgrade Link -->
      <div class="px-4">
        <button 
          @click="router.push('/app/settings/kyc')"
          class="w-full h-14 bg-primary text-white text-[10px] font-bold rounded-2xl active:scale-95 transition-all uppercase tracking-[0.2em] shadow-xl shadow-primary/20"
        >
          Increase Limits
        </button>
      </div>

    </div>
  </AppShell>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../components/layout/AppShell.vue'

const router = useRouter()
const activeFilter = ref('All')
const filters = ['All', 'Inflow', 'Outflow', 'Bills']

const transactions = [
  { id: 1, type: 'Outbound', name: 'Michael Scott', amount: '-₦5,000.00', time: '10:45 AM', date: 'Today', status: 'Completed', icon: '📤', category: 'Outflow' },
  { id: 2, type: 'Deposit', name: 'Wallet Top-up', amount: '+₦20,000.00', time: '08:20 AM', date: 'Yesterday', status: 'Completed', icon: '📥', category: 'Inflow' },
  { id: 3, type: 'Bill', name: 'Airtel Airtime', amount: '-₦2,000.00', time: '04:15 PM', date: '2 days ago', status: 'Completed', icon: '📱', category: 'Bills' },
  { id: 4, type: 'Payment', name: 'Netflix Subscription', amount: '-₦4,400.00', time: '11:00 AM', date: 'Last week', status: 'Completed', icon: '🎬', category: 'Outflow' },
  { id: 5, type: 'Deposit', name: 'Transfer from Mom', amount: '+₦50,000.00', time: '09:00 AM', date: 'Last week', status: 'Completed', icon: '📥', category: 'Inflow' },
]

const goBack = () => router.back()
</script>

<template>
  <AppShell title="Transactions">
    <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <!-- Header -->
      <div class="flex items-center justify-between px-2">
        <div class="flex items-center gap-4">
          <button @click="goBack" class="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm active:scale-90 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div>
            <h2 class="text-lg font-bold text-slate-800 dark:text-white">Recent Activity</h2>
            <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">History & Statements</p>
          </div>
        </div>
        <button class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center active:scale-90 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </button>
      </div>

      <!-- Filters -->
      <div class="flex gap-2 overflow-x-auto scrollbar-hide px-2">
        <button 
          v-for="filter in filters" 
          :key="filter"
          @click="activeFilter = filter"
          class="px-5 py-2.5 rounded-full text-[11px] font-bold transition-all whitespace-nowrap border"
          :class="activeFilter === filter ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30' : 'bg-white/50 dark:bg-slate-900/50 text-slate-500 border-slate-200 dark:border-white/10'"
        >
          {{ filter }}
        </button>
      </div>

      <!-- Transactions List -->
      <div class="space-y-4">
        <div class="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden">
          <div v-for="(tx, idx) in transactions" :key="tx.id" 
            class="flex items-center justify-between p-5 transition-colors hover:bg-slate-50 dark:hover:bg-white/5 group ring-inset"
            :class="{ 'border-b border-slate-100 dark:border-white/5': idx !== transactions.length - 1 }"
          >
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-2xl shadow-sm border border-black/5 dark:border-white/5 group-hover:scale-110 transition-transform">
                {{ tx.icon }}
              </div>
              <div>
                <h4 class="text-sm font-bold text-slate-800 dark:text-white">{{ tx.name }}</h4>
                <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter">{{ tx.time }} • {{ tx.date }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-bold tracking-tight" :class="tx.amount.startsWith('+') ? 'text-emerald-500' : 'text-slate-800 dark:text-white'">{{ tx.amount }}</p>
              <p class="text-[9px] font-bold text-emerald-500/70 uppercase tracking-widest">{{ tx.status }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppShell>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../components/layout/AppShell.vue'

const router = useRouter()
const depositMethods = [
  { 
    id: 'bank', 
    name: 'Bank Transfer', 
    desc: 'Transfer to your BlocPoint account', 
    icon: '🏦', 
    details: 'Wema Bank • 7035148792',
    color: 'bg-blue-500/10 text-blue-500'
  },
  { 
    id: 'card', 
    name: 'Debit Card', 
    desc: 'Top up instantly with your card', 
    icon: '💳', 
    details: 'Visa, Mastercard, Verve',
    color: 'bg-purple-500/10 text-purple-500' 
  },
  { 
    id: 'ussd', 
    name: 'USSD', 
    desc: 'Top up using your bank\'s USSD code', 
    icon: '📱', 
    details: '*737#, *901#, etc.',
    color: 'bg-orange-500/10 text-orange-500'
  },
]

const goBack = () => router.back()
</script>

<template>
  <AppShell title="Add Money">
    <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <!-- Header with Back Button -->
      <div class="flex items-center gap-4 px-2">
        <button @click="goBack" class="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm active:scale-90 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div>
          <h2 class="text-lg font-bold text-slate-800 dark:text-white">Fund Wallet</h2>
          <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Select a payment method</p>
        </div>
      </div>

      <!-- Methods Grid -->
      <div class="space-y-4">
        <button 
          v-for="method in depositMethods" 
          :key="method.id"
          class="w-full flex items-center justify-between p-5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2rem] text-left transition-all active:scale-[0.98] group"
        >
          <div class="flex items-center gap-5">
            <div :class="[method.color, 'w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-black/5 dark:border-white/5 group-hover:scale-110 transition-transform']">
              {{ method.icon }}
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-800 dark:text-white">{{ method.name }}</h3>
              <p class="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">{{ method.desc }}</p>
              <p class="text-[9px] font-bold text-primary dark:text-primary/80 uppercase tracking-wider mt-1">{{ method.details }}</p>
            </div>
          </div>
          <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400"><path d="m9 18 6-6-6-6"/></svg>
          </div>
        </button>
      </div>

      <!-- Promo Section -->
      <div class="p-6 bg-gradient-to-br from-primary/10 to-indigo-500/10 border border-primary/20 rounded-[2.5rem] relative overflow-hidden">
        <div class="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
        <div class="relative z-10 space-y-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">🛡️</span>
            <h3 class="text-xs font-bold text-primary uppercase tracking-widest">Secure Payments</h3>
          </div>
          <p class="text-[11px] font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
            All transactions are encrypted and secured by BlocPoint’s multi-layer protection system. Your financial data is never shared with third parties.
          </p>
        </div>
      </div>
    </div>
  </AppShell>
</template>

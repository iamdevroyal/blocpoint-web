<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../components/layout/AppShell.vue'

const router = useRouter()
const stats = [
  { label: 'Available Limit', value: '₦500,000', icon: '💰' },
  { label: 'Active Loans', value: '0', icon: '📄' },
  { label: 'Credit Score', value: '780', icon: '📈' },
]

const goBack = () => router.back()
</script>

<template>
  <AppShell title="Loans">
    <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <!-- Header -->
      <div class="flex items-center gap-4 px-2">
        <button @click="goBack" class="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm active:scale-90 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div>
          <h2 class="text-lg font-bold text-slate-800 dark:text-white">Quick Cash</h2>
          <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Micro Lending & Credit</p>
        </div>
      </div>

      <!-- Credit Stats -->
      <div class="grid grid-cols-3 gap-3 px-2">
        <div v-for="stat in stats" :key="stat.label" class="p-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-3xl text-center">
          <span class="text-xl mb-2 block">{{ stat.icon }}</span>
          <p class="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mb-1">{{ stat.label }}</p>
          <p class="text-[10px] font-black text-slate-800 dark:text-white">{{ stat.value }}</p>
        </div>
      </div>

      <!-- Main Loan Card -->
      <div class="mx-2 p-8 bg-slate-950 text-white rounded-[2.5rem] relative overflow-hidden shadow-2xl">
        <div class="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div class="relative z-10 text-center space-y-6">
          <div class="space-y-2">
            <h3 class="text-xs font-bold text-primary uppercase tracking-[0.2em]">Ready for Withdrawal</h3>
            <p class="text-4xl font-black tracking-tighter">₦100,000</p>
            <p class="text-[10px] font-medium text-white/50">Instant approval • 5% Monthly Interest</p>
          </div>
          
          <button class="w-full h-14 bg-primary text-white text-xs font-bold rounded-2xl shadow-lg shadow-primary/30 active:scale-95 transition-all uppercase tracking-widest">
            Apply Now
          </button>
        </div>
      </div>

      <!-- Requirements Section -->
      <div class="space-y-4 px-2">
        <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">How it works</h4>
        <div class="space-y-3">
          <div v-for="(step, idx) in ['Fill out basic info', 'Verify identity', 'Get instant approval', 'Disbursement in 5 mins']" :key="idx" class="flex items-center gap-4 p-4 bg-white/5 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/5">
            <div class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black">{{ idx + 1 }}</div>
            <span class="text-xs font-medium text-slate-600 dark:text-slate-300">{{ step }}</span>
          </div>
        </div>
      </div>
    </div>
  </AppShell>
</template>

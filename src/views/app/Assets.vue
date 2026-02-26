<script setup>
import { useRouter } from 'vue-router'
import AppShell from '../../components/layout/AppShell.vue'

const router = useRouter()
const go = (path) => router.push(path)

const assetTypes = [
  {
    id: 'giftcard',
    name: 'Gift Cards',
    description: 'Buy & sell global gift cards at the best rates. Netflix, Steam, Amazon and 2000+ more.',
    icon: '🎁',
    path: '/app/gift-cards',
    color: 'from-indigo-600 to-indigo-900',
    accent: 'bg-indigo-500/20',
    tag: 'Global Catalog'
  },
  {
    id: 'stablecoins',
    name: 'Stablecoins',
    description: 'Compliant access to USD stablecoins. Trade USDT and USDC with instant settlement.',
    icon: '🔗',
    path: '/app/stablecoins',
    color: 'from-amber-600 to-amber-900',
    accent: 'bg-amber-500/20',
    tag: 'Tier 3 Feature'
  }
]
</script>

<template>
  <AppShell title="Digital Assets">
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 px-2">
      <!-- Header Section -->
      <div class="space-y-2">
        <h2 class="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Select Asset Type</h2>
        <p class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Manage Your Digital Portfolio</p>
      </div>

      <!-- Asset Selection Cards -->
      <div class="grid grid-cols-1 gap-6">
        <button 
          v-for="asset in assetTypes" 
          :key="asset.id"
          @click="go(asset.path)"
          class="relative w-full overflow-hidden rounded-[2.5rem] text-left transition-all active:scale-[0.98] group"
        >
          <!-- Background Gradient & Glass -->
          <div :class="['absolute inset-0 bg-gradient-to-br opacity-90 dark:opacity-100', asset.color]"></div>
          <div class="absolute inset-0 bg-white/5 backdrop-blur-sm border border-white/10"></div>
          
          <div class="relative p-8 flex flex-col justify-between min-h-[220px]">
            <!-- Top Row -->
            <div class="flex justify-between items-start">
              <div :class="['w-14 h-14 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-2xl border border-white/20 transition-transform group-hover:rotate-12', asset.accent]">
                {{ asset.icon }}
              </div>
              <span class="text-[9px] font-bold text-white/60 uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-full border border-white/10">{{ asset.tag }}</span>
            </div>

            <!-- Bottom Row -->
            <div class="space-y-2 mt-auto">
              <h3 class="text-2xl font-bold text-white tracking-tight">{{ asset.name }}</h3>
              <p class="text-xs font-medium text-white/70 leading-relaxed max-w-[80%] pb-1">
                {{ asset.description }}
              </p>
            </div>

            <!-- Decorative Elements -->
            <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div class="absolute bottom-10 right-8 text-white/10 group-hover:translate-x-2 transition-transform duration-500">
               <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>
          </div>
        </button>
      </div>

      <!-- Info Footer -->
      <div class="p-6 bg-slate-900/5 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/5">
        <div class="flex gap-4 items-center">
          <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">💡</div>
          <p class="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-normal">
            Digital assets allow you to diversify your income. BlocPoint provides a secure gateway for both custodial and non-custodial asset management.
          </p>
        </div>
      </div>
    </div>
  </AppShell>
</template>

<style scoped>
.group:hover .bg-white\/5 {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>

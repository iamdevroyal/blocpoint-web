<script setup>
import { ref } from 'vue'

const props = defineProps({
  show: Boolean,
  order: Object
})

const emit = defineEmits(['close'])
const showCode = ref(false)

const shareToWhatsApp = () => {
  const text = `*BlocPoint Asset Delivery* 🛍️\n\nAsset: ${props.order?.name}\nValue: ₦${props.order?.amount.toLocaleString()}\nCode: BP-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}\n\n_Redeem your asset now on the BlocPoint app._`
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
}
</script>

<template>
  <Transition name="drawer-left">
    <div v-if="show" class="fixed inset-0 z-[150] flex">
      <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" @click="emit('close')"></div>
      
      <div class="relative w-[85%] max-w-sm h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-r border-slate-200 dark:border-white/5 overflow-hidden">
        <div class="h-1.5 w-full bg-primary"></div>

        <div class="p-8 space-y-8 flex-1 overflow-y-auto no-scrollbar">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div class="space-y-1">
              <h2 class="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Order Details</h2>
              <p class="text-[9px] font-bold text-primary uppercase tracking-[0.2em]">Transaction Audit</p>
            </div>
            <button @click="emit('close')" class="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
          </div>

          <!-- Status Highlight -->
          <div class="p-6 bg-emerald-500/5 rounded-[2rem] border border-emerald-500/10 flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-xl shadow-inner border border-emerald-500/10">✅</div>
            <div>
              <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Asset Status</p>
              <p class="text-sm font-bold text-emerald-500 uppercase tracking-widest text-balance">Delivered & Ready</p>
            </div>
          </div>

          <!-- Asset Info -->
          <div class="space-y-6">
            <div class="flex items-center gap-5">
              <div class="w-20 h-20 rounded-[2rem] bg-slate-50 dark:bg-white/5 p-4 border border-black/5 flex items-center justify-center shadow-xl">
                 <span class="text-4xl">🛍️</span>
              </div>
              <div class="space-y-1">
                <h3 class="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">{{ order?.name }}</h3>
                <p class="text-xl font-bold text-primary tracking-tight">₦ {{ order?.amount.toLocaleString() }}</p>
              </div>
            </div>

            <!-- Code Section -->
            <div class="space-y-3 pt-4">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Redemption Code</p>
              <div class="relative group">
                <div class="absolute inset-0 bg-primary/5 rounded-2xl border-2 border-primary/20 transition-all group-hover:bg-primary/10"></div>
                <div class="relative p-6 flex flex-col items-center gap-3">
                  <p 
                    class="text-2xl font-bold tracking-[0.3em] font-mono transition-all duration-300"
                    :class="showCode ? 'text-primary' : 'blur-md select-none scale-90'"
                  >
                    BP-{{ Math.random().toString(36).substr(2, 4).toUpperCase() }}-{{ Math.random().toString(36).substr(2, 4).toUpperCase() }}
                  </p>
                  <button 
                    @click="showCode = !showCode"
                    class="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] underline decoration-primary/30 decoration-2 underline-offset-4"
                  >
                    {{ showCode ? 'Hide Code' : 'Tap To Reveal' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Metadata Grid -->
            <div class="grid grid-cols-1 gap-6 pt-6 border-t border-slate-100 dark:border-white/5">
              <div v-for="(item, key) in {
                'Order ID': 'TX-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
                'Purchase Date': 'Feb 26, 2026',
                'Method': 'Agent Wallet',
                'Asset Type': 'Digital Voucher',
                'Expires': 'Feb 26, 2027'
              }" :key="key" class="flex justify-between items-center group">
                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{{ key }}</span>
                <span class="text-[10px] font-bold text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors text-balance">{{ item }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-8 pt-0 mt-auto">
          <button 
            @click="shareToWhatsApp"
            class="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest"
          >
            Send To WhatsApp
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.drawer-left-enter-active, .drawer-left-leave-active { transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
.drawer-left-enter-from, .drawer-left-leave-to { opacity: 0; transform: translateX(-100%); }
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>

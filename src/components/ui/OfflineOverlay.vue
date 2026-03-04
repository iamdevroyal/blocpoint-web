<script setup>
import { useUIStore } from '../../stores/ui'
import { WifiOffIcon, Loader2Icon } from 'lucide-vue-next'

const ui = useUIStore()
</script>

<template>
  <Transition
    enter-active-class="transition duration-500 ease-out"
    enter-from-class="opacity-0 translate-y-10 scale-90"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition duration-500 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 translate-y-10 scale-90"
  >
    <div 
      v-if="ui.isOffline" 
      class="fixed bottom-24 left-6 z-[100] animate-soft-bounce"
    >
      <div 
        class="group flex items-center gap-3 p-2 pr-5 rounded-full bg-white dark:bg-slate-900 border border-rose-500/20 shadow-2xl shadow-rose-500/30 dark:shadow-rose-500/20 hover:border-rose-500 transition-all duration-300 backdrop-blur-xl"
      >
        <!-- Animated Icon Container -->
        <div class="relative flex-shrink-0 w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center relative overflow-hidden">
          <WifiOffIcon class="w-5 h-5 text-rose-500 transition-opacity duration-300" />
          
          <!-- Searching Pulse -->
          <div class="absolute inset-0 flex items-center justify-center">
            <Loader2Icon class="w-8 h-8 text-rose-500/20 animate-spin" />
          </div>
          
          <!-- Slash Overlay -->
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-0.5 bg-rose-500 rotate-45 rounded-full shadow-lg shadow-rose-500/40"></div>
        </div>

        <div class="flex flex-col">
          <span class="text-[10px] font-black text-rose-500 uppercase tracking-widest leading-none">Offline</span>
          <span class="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">Searching...</span>
        </div>
      </div>
      
      <!-- Glow effect -->
      <div class="absolute inset-0 rounded-full bg-rose-500/20 blur-xl -z-10 animate-pulse"></div>
    </div>
  </Transition>
</template>

<style scoped>
.animate-soft-bounce {
  animation: soft-bounce 3s ease-in-out infinite;
}

@keyframes soft-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
</style>

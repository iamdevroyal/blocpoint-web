<script setup>
import { useUIStore } from '../../stores/ui'

const ui = useUIStore()
</script>

<template>
  <Transition
    enter-active-class="transition duration-500 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-500 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div 
      v-if="ui.isOffline" 
      class="fixed inset-0 z-[100] bg-slate-50 dark:bg-dark flex flex-col items-center justify-center p-6 text-center animate-in fade-in transition-all duration-700"
    >
      <!-- Background Decorators -->
      <div class="absolute inset-0 bg-gradient-to-b from-rose-500/5 to-transparent dark:from-rose-500/10 z-0 pointer-events-none"></div>
      
      <div class="relative z-10 max-w-sm w-full space-y-8">
        <!-- Animated Icon Container -->
        <div class="relative flex justify-center">
          <div class="w-24 h-24 rounded-[2.5rem] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-4xl shadow-inner relative">
            <span class="animate-pulse">📶</span>
            <!-- Slash Overlay -->
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-1 bg-rose-500 rotate-45 rounded-full shadow-lg shadow-rose-500/40"></div>
          </div>
          
          <!-- Pulse Ring -->
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-[2.5rem] border-2 border-rose-500 animate-ping opacity-20 pointer-events-none"></div>
        </div>

        <div class="space-y-4">
          <h2 class="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Offline Connection</h2>
          <p class="text-[12px] font-bold text-slate-400 uppercase tracking-widest leading-loose max-w-[280px] mx-auto">
            You've been disconnected from our servers. Please check your internet connection and try again.
          </p>
        </div>

        <div class="pt-8">
          <div class="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl">
            <div class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse"></div>
            <span class="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Awaiting Signal...</span>
          </div>
        </div>
      </div>
      
      <!-- Logo Footer -->
      <div class="absolute bottom-12 left-0 right-0 flex justify-center opacity-30">
        <img v-if="ui.isDark" src="/blocpoint-white.png" alt="BlocPoint" class="h-5 auto" />
        <img v-else src="/blocpoint-white.png" alt="BlocPoint" class="h-5 auto filter invert" />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.tracking-tight {
  letter-spacing: -0.025em;
}
</style>

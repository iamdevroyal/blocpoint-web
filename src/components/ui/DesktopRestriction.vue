<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useUIStore } from '../../stores/ui'

const ui = useUIStore()
const isDesktop = ref(window.innerWidth > 768)

const checkScreenSize = () => {
  isDesktop.value = window.innerWidth > 768
}

onMounted(() => {
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})
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
      v-if="isDesktop" 
      class="fixed inset-0 z-[200] bg-slate-900 flex flex-col items-center justify-center p-8 text-center"
    >
      <!-- Background Decorators -->
      <div class="absolute inset-0 bg-[url('/bg-pattern.png')] opacity-5 pointer-events-none"></div>
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50"></div>
      
      <div class="relative z-10 max-w-md w-full space-y-10">
        <!-- Logo -->
        <div class="flex justify-center mb-8">
          <img src="/blocpoint-white.png" alt="BlocPoint" class="h-8 auto" />
        </div>

        <!-- Phone Illustration -->
        <div class="relative flex justify-center">
          <div class="w-24 h-48 rounded-[2.5rem] border-[6px] border-white/20 bg-slate-800 relative shadow-2xl overflow-hidden animate-bounce-slow">
            <div class="absolute top-0 inset-x-0 h-4 bg-white/10 rounded-b-xl mx-4"></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-12 h-1 bg-primary/40 rounded-full animate-pulse"></div>
            </div>
            <!-- Glow -->
            <div class="absolute -inset-2 bg-primary/20 blur-xl opacity-50"></div>
          </div>
          
          <!-- Scan Lines -->
          <div class="absolute -right-8 top-1/2 -translate-y-1/2 space-y-2">
            <div class="w-8 h-1 bg-emerald-500/40 rounded-full animate-[pulse_1.5s_infinite_0.1s]"></div>
            <div class="w-12 h-1 bg-emerald-500/40 rounded-full animate-[pulse_1.5s_infinite_0.2s]"></div>
            <div class="w-10 h-1 bg-emerald-500/40 rounded-full animate-[pulse_1.5s_infinite_0.3s]"></div>
          </div>
        </div>

        <div class="space-y-4">
          <h2 class="text-3xl font-black text-white tracking-tight leading-none uppercase">Mobile Devices Only</h2>
          <p class="text-[12px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-loose max-w-[320px] mx-auto">
            Blocpoint is optimized for mobile devices. Please access this application using a mobile device or a small screen browser.
          </p>
        </div>

        <div class="pt-6">
          <div class="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4 text-left">
            <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">📱</div>
            <div>
              <p class="text-[10px] font-black text-white uppercase tracking-widest">How to access?</p>
              <p class="text-[9px] font-medium text-slate-500 uppercase tracking-tighter">Kindly open the application on mobile</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}
.animate-bounce-slow {
  animation: bounce-slow 4s ease-in-out infinite;
}
.tracking-tight {
  letter-spacing: -0.025em;
}
</style>

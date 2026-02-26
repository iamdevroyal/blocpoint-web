<script setup>
import { ref, onMounted } from 'vue'

const show = ref(false)

const isIOS = () => {
  return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform)
  // iPad on iOS 13 detection
  || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}

const isStandalone = () => {
  return ('standalone' in window.navigator) && window.navigator.standalone
}

const dismiss = () => {
  show.value = false
  localStorage.setItem('bp_ios_pwa_dismissed', 'true')
}

onMounted(() => {
  const dismissed = localStorage.getItem('bp_ios_pwa_dismissed') === 'true'
  if (isIOS() && !isStandalone() && !dismissed) {
    // Delay slightly to not annoy user immediately on boot
    setTimeout(() => {
      show.value = true
    }, 4000)
  }
})
</script>

<template>
  <Transition name="slide-up">
    <div v-if="show" class="fixed bottom-24 inset-x-4 z-[60] animate-in fade-in slide-in-from-bottom-10 duration-700">
      <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 shadow-2xl overflow-hidden relative group">
        <!-- Decoration -->
        <div class="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-1000"></div>
        
        <div class="relative z-10 space-y-6">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center p-2.5 shadow-sm">
                <img src="/blocpoint-fav.png" alt="BlocPoint" class="w-full h-full object-contain" />
              </div>
              <div>
                <h3 class="text-sm font-black text-slate-800 dark:text-white tracking-tight">Install BlocPoint</h3>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Add to your Home Screen</p>
              </div>
            </div>
            <button @click="dismiss" class="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
              ✕
            </button>
          </div>

          <div class="space-y-4">
            <p class="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              Install BlocPoint on your iPhone for a faster, premium experience with native-style features.
            </p>

            <div class="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 space-y-3">
              <div class="flex items-center gap-4">
                <div class="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                </div>
                <p class="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide">1. Tap the <span class="text-primary">Share</span> icon below</p>
              </div>
              <div class="flex items-center gap-4">
                <div class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                </div>
                <p class="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide">2. Select <span class="text-primary">Add to Home Screen</span></p>
              </div>
            </div>
          </div>

          <button 
            @click="dismiss"
            class="w-full h-12 bg-primary text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all"
          >
            I'll do it later
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-up-enter-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-leave-active {
  transition: all 0.4s ease-in;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(100px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100px);
}
</style>

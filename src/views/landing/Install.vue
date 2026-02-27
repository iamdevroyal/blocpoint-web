<script setup>
import { useUIStore } from '../../stores/ui'
import { ref, onMounted, onUnmounted } from 'vue'

const uiStore = useUIStore()

// State for PWA install context
const deferredPrompt = ref(null)
const isInstalled = ref(false)
let checkInterval = null

const handleInstallPrompt = (e) => {
  e.preventDefault()
  deferredPrompt.value = e
  window.deferredPWAInstallPrompt = e
}

onMounted(() => {
  window.addEventListener('beforeinstallprompt', handleInstallPrompt)
  
  // Check if current display mode is standalone (installed)
  if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone) {
    isInstalled.value = true
  }

  // Check for globally captured prompt
  checkInterval = setInterval(() => {
    if (window.deferredPWAInstallPrompt && !deferredPrompt.value) {
      deferredPrompt.value = window.deferredPWAInstallPrompt
    }
  }, 500)
})

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
  if (checkInterval) clearInterval(checkInterval)
})

const handleInstallClick = async () => {
  if (isInstalled.value) {
    uiStore.showToast('App is already installed!', 'info')
    return
  }

  if (!deferredPrompt.value) {
    uiStore.showToast('Install feature not available on this device or already installed.', 'warning')
    return
  }

  // Show the native prompt
  deferredPrompt.value.prompt()

  // Intercept user choice
  const { outcome } = await deferredPrompt.value.userChoice

  if (outcome === 'accepted') {
    uiStore.showToast('Installation accepted!', 'success')
    isInstalled.value = true
  } else {
    uiStore.showToast('Installation was cancelled.', 'info')
  }

  // Event can only be used once
  deferredPrompt.value = null
  window.deferredPWAInstallPrompt = null
}
</script>

<template>
  <div class="min-h-[100dvh] flex flex-col justify-between py-8 px-6 transition-colors duration-500 bg-slate-50 dark:bg-dark text-slate-900 dark:text-white relative overflow-hidden">
    
    <!-- Background Decorators -->
    <div class="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-900/10 z-0 pointer-events-none transition-colors duration-500"></div>
    <div class="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 dark:bg-primary/20 rounded-full blur-3xl z-0 pointer-events-none transition-colors duration-700"></div>
    <div class="absolute top-40 -left-20 w-72 h-72 bg-emerald-500/10 dark:bg-accent/10 rounded-full blur-3xl z-0 pointer-events-none transition-colors duration-700"></div>

    <!-- Top Area: Logo & Theme Toggle -->
    <header class="w-full max-w-lg mx-auto flex items-center justify-between relative z-10">
      <div class="flex items-center gap-2">
        <img v-if="uiStore.isDark" src="/blocpoint-white.png" alt="BlocPoint" class="h-8 auto block" />
        <img v-else src="/blocpoint-white.png" alt="BlocPoint" class="h-8 auto block filter invert opacity-90" />
        <span class="bg-indigo-100 dark:bg-slate-800 text-indigo-700 dark:text-slate-300 text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full uppercase transition-colors">User App</span>
      </div>

      <button 
        @click="uiStore.toggleTheme()" 
        class="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-800/50 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-white/5 shadow-sm hover:scale-105 active:scale-95 transition-all"
        aria-label="Toggle theme"
      >
        <svg v-if="uiStore.isDark" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
      </button>
    </header>

    <!-- Main Installation Card -->
    <main class="w-full max-w-sm mx-auto flex flex-col items-center flex-1 justify-center z-10 my-8">

      <!-- Copy -->
      <div class="text-center space-y-3 mb-10 w-full px-2">
        <h1 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">
          Install Blocpoint
        </h1>
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed transition-colors">
          The ultimate financial app for seamless transfers, secure wallet management, digital assets, cross-border payments and easy tax compliance.
        </p>
      </div>

      <!-- Action Area -->
      <div class="w-full space-y-4">
        <!-- Install Button -->
        <button
          @click="handleInstallClick"
          :disabled="isInstalled"
          class="relative w-full py-4 px-6 rounded-2xl font-semibold text-base transition-all overflow-hidden flex items-center justify-center gap-2"
          :class="[
            isInstalled 
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 shadow-none' 
              : 'bg-primary hover:bg-indigo-500 text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98]'
          ]"
        >
          <!-- Shimmer effect for non-installed state -->
          <div v-if="!isInstalled" class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[200%] animate-[shimmer_2s_infinite]"></div>
          
          <template v-if="isInstalled">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
            Installed Successfully
          </template>
          <template v-else>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Install Blocpoint
          </template>
        </button>
      </div>
    </main>

    <!-- Footer -->
    <footer class="w-full text-center relative z-10 pt-4">
      <div class="text-[11px] font-medium text-slate-400 dark:text-slate-500 transition-colors">
        Powered by Blocpoint Inc.
      </div>
    </footer>

  </div>
</template>

<style scoped>
@keyframes shimmer {
  100% { transform: translateX(200%); }
}
</style>

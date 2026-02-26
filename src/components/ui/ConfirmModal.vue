<script setup>
import { useUIStore } from '../../stores/ui'

const uiStore = useUIStore()

const handleConfirm = () => {
  uiStore.closeConfirm(true)
}

const handleCancel = () => {
  uiStore.closeConfirm(false)
}
</script>

<template>
  <Transition name="fade">
    <div v-if="uiStore.confirm.show" class="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" @click="handleCancel"></div>
      
      <!-- Modal Content -->
      <div class="relative w-full max-w-xs bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in duration-300">
        
        <div class="p-8 text-center space-y-6">
          <!-- Icon -->
          <div class="w-16 h-16 rounded-[1.5rem] bg-rose-500/10 dark:bg-rose-500/20 text-rose-500 flex items-center justify-center text-3xl mx-auto shadow-inner">
            ❓
          </div>

          <!-- Text -->
          <div class="space-y-2">
            <h3 class="text-xl font-black text-slate-800 dark:text-white tracking-tight uppercase tracking-wider">
              {{ uiStore.confirm.title }}
            </h3>
            <p v-if="uiStore.confirm.message" class="text-[10px] font-bold text-slate-400 dark:text-slate-500 leading-relaxed uppercase tracking-widest leading-loose">
              {{ uiStore.confirm.message }}
            </p>
          </div>

          <!-- Actions -->
          <div class="space-y-3 pt-2">
            <button 
              @click="handleConfirm"
              class="w-full h-14 bg-rose-500 text-white text-[10px] font-black rounded-2xl uppercase tracking-[0.2em] shadow-xl shadow-rose-500/20 active:scale-95 transition-all"
            >
              {{ uiStore.confirm.confirmText }}
            </button>
            <button 
              @click="handleCancel"
              class="w-full h-14 bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-white text-[10px] font-black rounded-2xl uppercase tracking-[0.2em] active:scale-95 transition-all"
            >
              {{ uiStore.confirm.cancelText }}
            </button>
          </div>
        </div>

      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>

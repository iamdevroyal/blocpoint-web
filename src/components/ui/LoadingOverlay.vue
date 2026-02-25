<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: 'Processing...'
  }
})
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 dark:bg-slate-950/60 backdrop-blur-md">
      <div class="flex flex-col items-center gap-6 p-10 rounded-[2.5rem] animate-in zoom-in-95 duration-300">
        <!-- Premium Loader -->
        <div class="relative w-20 h-20">
          <div class="absolute inset-0 rounded-full border-4 border-primary/20"></div>
          <div class="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <div class="absolute inset-4 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <span class="text-xl">⚡</span>
          </div>
        </div>
        
        <div class="text-center space-y-1">
          <p class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-widest">{{ message }}</p>
          <p class="text-[10px] font-medium text-slate-400">Please wait a moment</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

<script setup>
import { onMounted, watch } from 'vue'
import confetti from 'canvas-confetti'

const props = defineProps({
  show: Boolean,
  type: {
    type: String,
    default: 'success' // 'success' or 'error'
  },
  title: String,
  message: String,
  amount: String,
  details: Array // [{ label: '', value: '' }]
})

const emit = defineEmits(['close', 'action'])

const triggerConfetti = () => {
  if (props.type !== 'success') return

  const duration = 3 * 1000
  const animationEnd = Date.now() + duration
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 2000 }

  const randomInRange = (min, max) => Math.random() * (max - min) + min

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now()

    if (timeLeft <= 0) {
      return clearInterval(interval)
    }

    const particleCount = 50 * (timeLeft / duration)
    // since particles fall down, start a bit higher than random
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
  }, 250)
}

watch(() => props.show, (newVal) => {
  if (newVal && props.type === 'success') {
    setTimeout(triggerConfetti, 400)
  }
})

onMounted(() => {
  if (props.show && props.type === 'success') {
    setTimeout(triggerConfetti, 400)
  }
})
</script>

<template>
  <Transition name="modal-bounce">
    <div v-if="show" class="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" @click="emit('close')"></div>
      
      <div class="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-white/5 animate-in slide-in-from-bottom-10 duration-500">
        <!-- Top Gradient Strip -->
        <div :class="[type === 'success' ? 'bg-emerald-500' : 'bg-rose-500', 'h-2 w-full']"></div>
        
        <div class="p-8 text-center space-y-6">
          <!-- Icon Area -->
          <div class="flex justify-center">
            <div :class="[
              type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500',
              'w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-inner'
            ]">
              <template v-if="type === 'success'">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="animate-in zoom-in duration-500"><polyline points="20 6 9 17 4 12"/></svg>
              </template>
              <template v-else>
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </template>
            </div>
          </div>

          <!-- Text Content -->
          <div class="space-y-2">
            <h3 class="text-xl font-bold text-slate-800 dark:text-white">{{ title || (type === 'success' ? 'Transaction Successful' : 'Transaction Failed') }}</h3>
            <p class="text-sm font-medium text-slate-500 dark:text-slate-400">{{ message }}</p>
          </div>

          <!-- Amount Display -->
          <div v-if="amount" class="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
            <p class="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">{{ amount }}</p>
          </div>

          <!-- Details List -->
          <div v-if="details && details.length" class="space-y-3 pt-2">
            <div v-for="item in details" :key="item.label" class="flex justify-between items-center px-2">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ item.label }}</span>
              <span class="text-xs font-bold text-slate-700 dark:text-slate-200">{{ item.value }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-3 pt-4">
            <button 
              @click="emit('action')"
              :class="[
                type === 'success' ? 'bg-primary shadow-primary/30' : 'bg-slate-800 shadow-slate-900/30',
                'w-full h-14 text-white text-xs font-bold rounded-2xl shadow-lg active:scale-95 transition-all uppercase tracking-widest'
              ]"
            >
              {{ type === 'success' ? 'Done' : 'Try Again' }}
            </button>
            <button 
              v-if="type === 'success'"
              class="w-full h-14 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-2xl active:scale-95 transition-all uppercase tracking-widest"
            >
              Share Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-bounce-enter-active { animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.modal-bounce-leave-active { transition: all 0.3s ease; }
.modal-bounce-leave-to { opacity: 0; transform: scale(0.9); }

@keyframes bounce-in {
  from { opacity: 0; transform: translateY(30px) scale(0.9); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>

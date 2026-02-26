<script setup>
import { ref, computed } from 'vue'
import LoadingOverlay from './LoadingOverlay.vue'

const props = defineProps({
  show: Boolean,
  transactionData: Object
})

const emit = defineEmits(['close'])

const step = ref(1) // 1: Selection, 2: Generating
const selectedFormat = ref('pdf')
const isGenerating = ref(false)

const platforms = [
  { id: 'whatsapp', name: 'WhatsApp', icon: '💬', color: 'bg-[#25D366]' },
  { id: 'telegram', name: 'Telegram', icon: '✈️', color: 'bg-[#0088cc]' },
  { id: 'email', name: 'Email', icon: '✉️', color: 'bg-primary' }
]

const handleShare = (platform) => {
  step.value = 2
  isGenerating.value = true
  
  // Simulate generation and sharing
  setTimeout(() => {
    isGenerating.value = false
    emit('close')
    // In a real app, this would trigger the native sharing or specific API
    step.value = 1
  }, 3000)
}
</script>

<template>
  <Transition name="modal-fade">
    <div v-if="show" class="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-md" @click="emit('close')"></div>
      
      <div class="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-white/5 animate-in slide-in-from-bottom-10 duration-500">
        <!-- Close Button -->
        <button @click="emit('close')" class="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors z-10">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div class="p-8 space-y-8">
          <div v-if="step === 1" class="space-y-8 animate-in fade-in duration-500">
            <div class="text-center space-y-2">
              <h3 class="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Share Receipt</h3>
              <p class="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Select platform and format</p>
            </div>

            <!-- Format Selection -->
            <div class="space-y-3">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">File Format</label>
              <div class="bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl flex gap-1">
                <button 
                  @click="selectedFormat = 'pdf'"
                  class="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  :class="selectedFormat === 'pdf' ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'"
                >
                  PDF Document
                </button>
                <button 
                  @click="selectedFormat = 'image'"
                  class="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  :class="selectedFormat === 'image' ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'"
                >
                  HD Image
                </button>
              </div>
            </div>

            <!-- Platform Grid -->
            <div class="grid grid-cols-1 gap-3">
              <button 
                v-for="p in platforms" 
                :key="p.id"
                @click="handleShare(p.id)"
                class="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl transition-all active:scale-[0.98] group"
              >
                <div class="flex items-center gap-4">
                  <div :class="[p.color, 'w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-black/5 group-hover:scale-110 transition-transform']">
                    {{ p.icon }}
                  </div>
                  <span class="text-xs font-bold text-slate-700 dark:text-slate-200">{{ p.name }}</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-slate-300 group-hover:text-primary transition-colors"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
          </div>

          <!-- Generation Animation -->
          <div v-else class="py-12 text-center space-y-8 animate-in zoom-in-95 duration-500">
            <div class="relative flex justify-center">
              <div class="w-24 h-24 rounded-[2rem] bg-primary/10 border-4 border-primary/20 flex items-center justify-center relative overflow-hidden group">
                <div class="absolute inset-0 bg-primary/20 animate-pulse"></div>
                <span class="text-4xl relative z-10 drop-shadow-lg">📄</span>
              </div>
              <!-- Orbiting Dots -->
              <div class="absolute inset-0 border-4 border-primary/5 rounded-full animate-[spin_3s_linear_infinite]">
                 <div class="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--color-primary),0.5)]"></div>
              </div>
            </div>
            
            <div class="space-y-2">
              <h3 class="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">Generating Receipt</h3>
              <p class="text-[10px] font-black text-primary uppercase tracking-[0.2em] animate-pulse">Preparing your {{ selectedFormat.toUpperCase() }}...</p>
            </div>

            <div class="w-full bg-slate-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div class="h-full bg-primary animate-[loading_3s_ease-in-out]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

@keyframes loading {
  0% { width: 0%; }
  100% { width: 100%; }
}
</style>

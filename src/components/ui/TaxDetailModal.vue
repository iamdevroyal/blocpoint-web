<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  show: Boolean,
  record: Object
})

const emit = defineEmits(['close'])

const isDownloading = ref(false)
const downloadProgress = ref(0)
const downloadComplete = ref(false)

const handleDownload = () => {
  isDownloading.value = true
  downloadProgress.value = 0
  downloadComplete.value = false
  
  const interval = setInterval(() => {
    downloadProgress.value += 10
    if (downloadProgress.value >= 100) {
      clearInterval(interval)
      setTimeout(() => {
        isDownloading.value = false
        downloadComplete.value = true
        setTimeout(() => (downloadComplete.value = false), 3000)
      }, 500)
    }
  }, 200)
}
</script>

<template>
  <Transition name="drawer-left">
    <div v-if="show" class="fixed inset-0 z-[120] flex">
      <!-- Backdrop -->
      <div 
        class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" 
        @click="emit('close')"
      ></div>
      
      <!-- Modal Content -->
      <div class="relative w-[85%] max-w-sm h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-r border-slate-200 dark:border-white/5 overflow-hidden">
        <!-- Top Gradient Strip -->
        <div class="h-1.5 w-full bg-primary shadow-[0_0_15px_rgba(var(--color-primary),0.3)]"></div>

        <div class="p-8 space-y-8 flex-1 overflow-y-auto no-scrollbar">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div class="space-y-1">
              <h2 class="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Record Detail</h2>
              <p class="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{{ record?.type || 'Tax Payment' }}</p>
            </div>
            <button 
              @click="emit('close')"
              class="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 active:scale-90 transition-all border border-black/5 dark:border-white/5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
          </div>

          <!-- Status Card -->
          <div class="p-6 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 relative overflow-hidden group">
            <div class="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-1000"></div>
            <div class="relative z-10 flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-xl shadow-inner border border-emerald-500/10">
                ✅
              </div>
              <div>
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Payment Status</p>
                <p class="text-sm font-black text-emerald-500 uppercase tracking-widest">Compliant & Paid</p>
              </div>
            </div>
          </div>

          <!-- Details Grid -->
          <div class="space-y-6">
            <div class="space-y-1 px-1">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Amount</p>
              <p class="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">₦ {{ record?.amount.toLocaleString() }}</p>
            </div>

            <div class="grid grid-cols-1 gap-6 pt-6 border-t border-slate-100 dark:border-white/5">
              <div v-for="(item, key) in {
                'Remittance ID': record?.id || 'BP-TAX-772910',
                'Tax Period': record?.date,
                'Payment Date': '15th ' + (record?.date || 'Feb 2026'),
                'Tax Type': 'Personal Income Tax (PIT)',
                'FIRS Ref': 'FIR-' + Math.random().toString(36).substr(2, 8).toUpperCase()
              }" :key="key" class="flex justify-between items-center group">
                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ key }}</span>
                <span class="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors">{{ item }}</span>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="space-y-3 pt-4 px-1">
            <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compliance Note</h4>
            <div class="p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <p class="text-[11px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                This transaction was processed automatically based on your monthly income threshold. Your certificate for this period is now available for download.
              </p>
            </div>
          </div>
        </div>

        <!-- Footer Action -->
        <div class="p-8 pt-0 mt-auto relative">
          <!-- Download Progress Overlay -->
          <Transition name="fade">
            <div v-if="isDownloading" class="absolute inset-x-8 top-0 -translate-y-full pb-4 space-y-2">
              <div class="flex justify-between items-center text-[9px] font-black text-primary uppercase tracking-widest">
                <span>Generating PDF</span>
                <span>{{ downloadProgress }}%</span>
              </div>
              <div class="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-primary transition-all duration-300" 
                  :style="{ width: downloadProgress + '%' }"
                ></div>
              </div>
            </div>
          </Transition>

          <button 
            @click="handleDownload"
            :disabled="isDownloading"
            class="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-[0.2em] relative overflow-hidden group disabled:opacity-50"
          >
            <span v-if="!isDownloading && !downloadComplete" class="relative z-10">Download Receipt</span>
            <span v-else-if="isDownloading" class="relative z-10">Processing...</span>
            <span v-else class="relative z-10 flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Saved To Device
            </span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-5px); }

.drawer-left-enter-active, .drawer-left-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer-left-enter-from {
  opacity: 0;
  transform: translateX(-100%);
}

.drawer-left-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

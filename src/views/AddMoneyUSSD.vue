<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../components/layout/AppShell.vue'

const router = useRouter()
const step = ref(1) // 1: Bank selection, 2: Final code display
const amount = ref('')
const selectedBank = ref(null)

const banks = [
  { name: 'GTBank', code: '737' },
  { name: 'Zenith', code: '966' },
  { name: 'UBA', code: '919' },
  { name: 'Access', code: '901' },
  { name: 'Fidelity', code: '770' },
  { name: 'FirstBank', code: '894' }
]

const ussdCode = computed(() => {
  if (!selectedBank.value || !amount.value) return ''
  return `*${selectedBank.value.code}*000*${amount.value}#`
})

const handleAmountInput = (event) => {
  amount.value = event.target.value.replace(/\D/g, '')
}

const handleDial = () => {
  if (ussdCode.value) {
    window.location.href = `tel:${encodeURIComponent(ussdCode.value)}`
  }
}

const goBack = () => {
  if (step.value > 1) step.value--
  else router.back()
}
</script>

<template>
  <AppShell title="USSD Top-up">
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 px-2">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <button @click="goBack" class="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm active:scale-90 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div>
          <h2 class="text-lg font-extrabold text-slate-800 dark:text-white uppercase tracking-tight">USSD Method</h2>
          <p class="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Dial to fund account</p>
        </div>
      </div>

      <!-- Content -->
      <div v-if="step === 1" class="space-y-8">
        <div class="space-y-4">
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Top-up Amount</label>
          <div class="relative">
            <span class="absolute left-8 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300 dark:text-white/20">₦</span>
            <input 
              v-model="amount"
              type="tel" 
              inputmode="numeric"
              pattern="[0-9]*"
              placeholder="0.00" 
              class="w-full h-20 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-white/10 rounded-3xl pl-16 pr-8 text-3xl font-black text-slate-800 dark:text-white focus:border-primary focus:ring-8 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-white/5"
              @input="handleAmountInput"
            />
          </div>
        </div>

        <div class="space-y-4">
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Select Bank</label>
          <div class="grid grid-cols-2 gap-4">
            <button 
              v-for="bank in banks" :key="bank.name"
              @click="selectedBank = bank"
              class="p-5 rounded-3xl border-2 transition-all flex flex-col items-center gap-1 active:scale-95 shadow-sm"
              :class="selectedBank?.name === bank.name ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5'"
            >
              <h4 class="text-xs font-black text-slate-800 dark:text-white">{{ bank.name }}</h4>
              <p class="text-[10px] font-bold text-slate-400">*{{ bank.code }}#</p>
            </button>
          </div>
        </div>

        <button 
          @click="step = 2"
          :disabled="!amount || !selectedBank"
          class="w-full h-16 bg-primary text-white text-xs font-black rounded-3xl shadow-lg shadow-primary/30 active:scale-95 transition-all uppercase tracking-[0.2em] mt-4 disabled:opacity-50"
        >
          Generate Code
        </button>
      </div>

      <!-- Step 2: Dial Display -->
      <div v-if="step === 2" class="space-y-8 text-center animate-in zoom-in-95 duration-500">
        <div class="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-white dark:border-white/5 rounded-[3rem] p-10 shadow-2xl space-y-8 relative overflow-hidden group">
          <div class="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
          
          <div class="space-y-4 relative z-10">
            <h3 class="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Generated USSD Code</h3>
            <div class="bg-slate-100 dark:bg-white/5 rounded-3xl p-6 border border-black/5 dark:border-white/5 overflow-hidden">
              <span class="text-2xl font-black text-primary tracking-wider break-all leading-tight">{{ ussdCode }}</span>
            </div>
          </div>

          <div class="space-y-2 relative z-10">
            <p class="text-xs font-medium text-slate-500 dark:text-slate-400 px-4">
              Click dial below or dial this code from your registered <span class="text-slate-800 dark:text-white font-bold">{{ selectedBank?.name }}</span> phone number.
            </p>
          </div>

          <button 
            @click="handleDial"
            class="w-full h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black rounded-3xl shadow-xl active:scale-95 transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="opacity-80"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            Dial Now
          </button>
        </div>

        <button @click="step = 1" class="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">Start Over</button>
      </div>
    </div>
  </AppShell>
</template>

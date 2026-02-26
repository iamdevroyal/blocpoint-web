<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../components/layout/AppShell.vue'
import LoadingOverlay from '../components/ui/LoadingOverlay.vue'
import TransactionStatusModal from '../components/ui/TransactionStatusModal.vue'

const router = useRouter()
const step = ref(1) // 1: Input, 2: PIN
const fromCurrency = ref('NGN')
const toCurrency = ref('USD')
const fromAmount = ref('')
const isProcessing = ref(false)
const showStatus = ref(false)
const pin = ref(['', '', '', ''])
const pinInputs = ref([])

const currencies = [
  { code: 'NGN', name: 'Naira', symbol: '₦', flag: '🇳🇬', balance: '54,200.00' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', balance: '1,250.00' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵', flag: '🇬🇭', balance: '8,400.00' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', flag: '🇰🇪', balance: '150,000.00' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', balance: '450.00' },
]

const exchangeRates = {
  'NGN_USD': 0.00065,
  'NGN_GHS': 0.0082,
  'NGN_KES': 0.085,
  'NGN_GBP': 0.00051,
  'USD_NGN': 1540.00,
  // Simplification for demo
}

const currentRate = computed(() => {
  const pair = `${fromCurrency.value}_${toCurrency.value}`
  return exchangeRates[pair] || 1.15 // Default fallback
})

const toAmount = computed(() => {
  if (!fromAmount.value) return '0.00'
  return (parseFloat(fromAmount.value) * currentRate.value).toFixed(2)
})

const fee = computed(() => {
  if (!fromAmount.value) return '0.00'
  return (parseFloat(fromAmount.value) * 0.005).toFixed(2) // 0.5% fee
})

const filterNumeric = (event) => {
  fromAmount.value = event.target.value.replace(/[^\d.]/g, '')
}

const handleContinue = () => {
  if (!fromAmount.value || parseFloat(fromAmount.value) <= 0) return
  step.value = 2
}

const handlePinInput = (index, event) => {
  const val = event.target.value
  const char = val.slice(-1)
  
  if (char && /^[0-9]$/.test(char)) {
    pin.value[index] = char
    if (index < 3) {
      pinInputs.value[index + 1]?.focus()
    }
  } else {
    pin.value[index] = ''
  }
}

const handleBackspace = (index, event) => {
  if (event.key === 'Backspace') {
    if (!pin.value[index] && index > 0) {
      pinInputs.value[index - 1]?.focus()
    } else {
      pin.value[index] = ''
    }
  }
}

const processConversion = () => {
  isProcessing.value = true
  // Mock API call
  setTimeout(() => {
    isProcessing.value = false
    showStatus.value = true
  }, 2000)
}

const swapCurrencies = () => {
  const temp = fromCurrency.value
  fromCurrency.value = toCurrency.value
  toCurrency.value = temp
}

const goBack = () => {
  if (step.value === 2) step.value = 1
  else router.back()
}
</script>

<template>
  <AppShell title="Convert Currency">
    <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <!-- Header -->
      <div class="flex items-center gap-4 px-2">
        <button @click="goBack" class="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm active:scale-90 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div>
          <h2 class="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-tight">
            {{ step === 1 ? 'Currency Exchange' : 'Confirm Order' }}
          </h2>
          <p class="text-[10px] font-bold text-primary uppercase tracking-widest">
            {{ step === 1 ? 'Swap between your wallets' : 'Enter PIN to finalize' }}
          </p>
        </div>
      </div>

      <!-- Step 1: Exchange UI -->
      <div v-if="step === 1" class="px-2 space-y-6">
        <!-- From -->
        <div class="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] shadow-sm space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">You Send</span>
            <span class="text-[10px] font-bold text-slate-400">Balance: {{ currencies.find(c => c.code === fromCurrency).balance }}</span>
          </div>
          <div class="flex items-center gap-4">
            <div class="relative min-w-[120px]">
              <select v-model="fromCurrency" class="w-full bg-slate-50 dark:bg-white/10 border border-slate-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 appearance-none text-slate-900 dark:text-white cursor-pointer">
                <option v-for="c in currencies" :key="c.code" :value="c.code" class="bg-white dark:bg-slate-900">{{ c.flag }} {{ c.code }}</option>
              </select>
              <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
            <div class="flex-1 flex flex-col items-end overflow-hidden">
              <input 
                v-model="fromAmount"
                type="text"
                inputmode="decimal"
                placeholder="0.00"
                class="w-full text-right text-3xl font-bold bg-transparent border-0 outline-none p-0 focus:ring-0 placeholder:text-slate-300 dark:placeholder:text-white/10 text-slate-900 dark:text-white"
                @input="filterNumeric"
              />
            </div>
          </div>
        </div>

        <!-- Swap Icon -->
        <div class="flex justify-center -my-8 relative z-10">
          <button @click="swapCurrencies" class="w-12 h-12 bg-primary text-white rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-center active:rotate-180 transition-transform duration-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11V7a5 5 0 0 1 10 0v4"/><path d="M11 21v-4a5 5 0 0 1 10 0v4"/><path d="m15 19 2 2-2 2"/><path d="m7 5-2-2 2-2"/></svg>
          </button>
        </div>

        <!-- To -->
        <div class="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] shadow-sm space-y-4">
          <div class="flex justify-between items-center">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">You Receive</span>
              <span class="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Est. instant</span>
          </div>
          <div class="flex items-center gap-4">
            <div class="relative min-w-[120px]">
              <select v-model="toCurrency" class="w-full bg-slate-50 dark:bg-white/10 border border-slate-100 dark:border-white/5 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 appearance-none text-slate-900 dark:text-white cursor-pointer">
                <option v-for="c in currencies" :key="c.code" :value="c.code" class="bg-white dark:bg-slate-900">{{ c.flag }} {{ c.code }}</option>
              </select>
              <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
            <div class="flex-1 text-right text-3xl font-bold text-emerald-500 overflow-hidden truncate">
              {{ toAmount }}
            </div>
          </div>
        </div>

        <!-- Rate & Details -->
        <div class="bg-slate-100/50 dark:bg-white/5 rounded-3xl p-5 space-y-3">
          <div class="flex justify-between text-[11px] font-bold">
            <span class="text-slate-400 uppercase tracking-wider">Exchange Rate</span>
            <span class="text-slate-800 dark:text-white">1 {{ fromCurrency }} = {{ currentRate }} {{ toCurrency }}</span>
          </div>
          <div class="flex justify-between text-[11px] font-bold">
            <span class="text-slate-400 uppercase tracking-wider">Transaction Fee</span>
            <span class="text-slate-800 dark:text-white">{{ currencies.find(c => c.code === fromCurrency).symbol }}{{ fee }}</span>
          </div>
        </div>

        <button @click="handleContinue" class="w-full h-16 bg-primary text-white text-xs font-bold rounded-3xl shadow-xl shadow-primary/30 active:scale-95 transition-all uppercase tracking-widest">
          Confirm Quote
        </button>
      </div>

      <!-- Step 2: PIN Confirmation -->
      <div v-if="step === 2" class="px-2 space-y-12">
        <div class="text-center space-y-4">
          <div class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20">
            <span class="text-3xl text-primary font-black">?</span>
          </div>
          <div class="space-y-1">
            <h3 class="text-2xl font-bold text-slate-800 dark:text-white uppercase tracking-tight">Authorize Swap</h3>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enter your 4-digit security PIN</p>
          </div>
        </div>

        <!-- Conversion Summary -->
        <div class="mx-auto max-w-xs p-6 bg-slate-900 rounded-[2rem] border border-white/10 shadow-2xl space-y-4">
          <div class="flex justify-center items-center gap-4">
            <div class="text-center">
              <p class="text-2xl font-bold text-white">{{ fromAmount }}</p>
              <p class="text-[9px] font-bold text-white/50 uppercase">{{ fromCurrency }}</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="m9 18 6-6-6-6"/></svg>
            <div class="text-center">
              <p class="text-2xl font-bold text-emerald-400">{{ toAmount }}</p>
              <p class="text-[9px] font-bold text-white/50 uppercase">{{ toCurrency }}</p>
            </div>
          </div>
        </div>

        <!-- PIN Input -->
        <div class="flex justify-center gap-5">
          <input 
            v-for="(n, i) in 4" :key="i"
            :ref="el => { if (el) pinInputs[i] = el }"
            v-model="pin[i]"
            type="password"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="1"
            class="w-16 h-16 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-white/10 rounded-[1.5rem] text-center text-3xl font-bold focus:border-primary focus:ring-8 focus:ring-primary/10 outline-none transition-all shadow-lg"
            @input="handlePinInput(i, $event)"
            @keydown="handleBackspace(i, $event)"
          />
        </div>

        <button @click="processConversion" class="w-full h-16 bg-primary text-white text-xs font-bold rounded-3xl shadow-xl active:scale-95 transition-all uppercase tracking-widest">
          Finalize Conversion
        </button>
      </div>

      <!-- Overlays -->
      <LoadingOverlay :show="isProcessing" message="Securing best market rates..." />
      <TransactionStatusModal 
        :show="showStatus"
        title="Conversion Successful"
        :amount="toCurrency + ' ' + toAmount"
        :message="'You have successfully swapped ' + fromAmount + ' ' + fromCurrency + ' for ' + toAmount + ' ' + toCurrency + '. Your wallets have been updated instantly.'"
        :details="[
          { label: 'Rate', value: '1 ' + fromCurrency + ' = ' + currentRate + ' ' + toCurrency },
          { label: 'Fee', value: fromCurrency + ' ' + fee },
          { label: 'Ref No', value: 'BPW-' + Math.random().toString(36).substr(2, 9).toUpperCase() }
        ]"
        @action="router.push('/app/wallet')"
        @close="showStatus = false"
      />
    </div>
  </AppShell>
</template>

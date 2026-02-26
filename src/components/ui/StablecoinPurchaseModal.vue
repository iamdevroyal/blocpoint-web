<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  side: String, // 'buy' or 'sell'
  selectedCoin: Object
})

const emit = defineEmits(['close', 'success'])

const step = ref(1) // 1: Amount, 2: Quote, 3: PIN
const amount = ref('')
const isProcessing = ref(false)
const pin = ref(['', '', '', ''])
const pinInputs = ref([])

const exchangeRate = 1450 // Indicative NGN/$
const feeRate = 0.005 // 0.5%

const cryptoAmount = computed(() => {
  if (!amount.value) return 0
  return (parseFloat(amount.value) / exchangeRate).toFixed(2)
})

const platformFee = computed(() => {
  if (!amount.value) return 0
  return (parseFloat(amount.value) * feeRate).toFixed(2)
})

const totalDebit = computed(() => {
  if (!amount.value) return 0
  return (parseFloat(amount.value) + parseFloat(platformFee.value)).toFixed(2)
})

const handlePinInput = (index, event) => {
  const val = event.target.value
  const char = val.slice(-1)
  if (char && /^[0-9]$/.test(char)) {
    pin.value[index] = char
    if (index < 3) pinInputs.value[index + 1]?.focus()
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

const confirmTrade = () => {
  isProcessing.value = true
  setTimeout(() => {
    isProcessing.value = false
    emit('success', { 
      amount: amount.value, 
      coin: props.selectedCoin?.symbol,
      side: props.side 
    })
  }, 2500)
}

const reset = () => {
  step.value = 1
  amount.value = ''
  pin.value = ['', '', '', '']
}

watch(() => props.show, (val) => {
  if (!val) setTimeout(reset, 500)
})
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-[150] flex items-end md:items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-md" @click="emit('close')"></div>
      
      <div class="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
        <div class="h-1.5 w-full bg-primary">
          <div 
            class="h-full bg-primary-soft transition-all duration-500" 
            :style="{ width: (step / 3) * 100 + '%' }"
          ></div>
        </div>

        <div class="p-8 space-y-8">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-2xl border border-black/5">
                 {{ selectedCoin?.icon }}
              </div>
              <div class="space-y-0.5">
                <h3 class="text-xl font-bold text-slate-800 dark:text-white tracking-tight">{{ side === 'buy' ? 'Buy' : 'Sell' }} {{ selectedCoin?.symbol }}</h3>
                <p class="text-[9px] font-bold text-primary uppercase tracking-[0.2em]">Step {{ step }} of 3</p>
              </div>
            </div>
            <button @click="emit('close')" class="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18 M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Step 1: Amount -->
          <div v-if="step === 1" class="space-y-6">
            <div class="space-y-4">
              <div class="space-y-2">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Amount In NGN</label>
                <div class="relative group">
                  <span class="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">₦</span>
                  <input 
                    v-model="amount"
                    type="number"
                    placeholder="0.00"
                    class="w-full h-20 bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 rounded-2xl pl-12 pr-6 text-2xl font-bold focus:border-primary outline-none transition-all dark:text-white"
                  />
                </div>
              </div>

              <div class="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="text-lg">📉</span>
                  <div>
                    <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Indicative Receive</p>
                    <p class="text-sm font-bold text-primary">{{ cryptoAmount }} {{ selectedCoin?.symbol }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Rate</p>
                  <p class="text-[10px] font-bold text-slate-600 dark:text-slate-300">₦{{ exchangeRate }}/$</p>
                </div>
              </div>
            </div>

            <button 
              @click="step = 2" 
              :disabled="!amount || amount <= 0"
              class="w-full h-14 bg-primary text-white text-[10px] font-bold rounded-2xl disabled:opacity-50 active:scale-95 transition-all uppercase tracking-widest"
            >
              Get Settlement Quote
            </button>
          </div>

          <!-- Step 2: Quote Review -->
          <div v-if="step === 2" class="space-y-6">
            <div class="p-6 bg-slate-50 dark:bg-white/5 rounded-[2rem] space-y-4 border border-slate-100 dark:border-white/5">
              <div class="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Transaction Type</span>
                <span class="text-slate-800 dark:text-white">{{ side === 'buy' ? 'Buy' : 'Sell' }} {{ selectedCoin?.name }}</span>
              </div>
              <div class="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Asset Value</span>
                <span class="text-slate-800 dark:text-white">₦ {{ parseFloat(amount).toLocaleString() }}</span>
              </div>
              <div class="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Platform Fee (0.5%)</span>
                <span class="text-slate-800 dark:text-white">₦ {{ parseFloat(platformFee).toLocaleString() }}</span>
              </div>
              <div class="h-px bg-slate-200 dark:bg-white/10"></div>
              <div class="flex justify-between items-center">
                 <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Settlement</span>
                 <span class="text-xl font-bold text-primary tracking-tight">₦ {{ parseFloat(totalDebit).toLocaleString() }}</span>
              </div>
            </div>
            
            <div class="flex items-center gap-3 px-2">
              <div class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
              <p class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Quote Expires in 45s</p>
            </div>

            <div class="flex gap-4">
              <button @click="step = 1" class="flex-1 h-14 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white text-[10px] font-bold rounded-2xl active:scale-95 transition-all uppercase tracking-widest">Back</button>
              <button @click="step = 3" class="flex-[2] h-14 bg-primary text-white text-[10px] font-bold rounded-2xl active:scale-95 transition-all uppercase tracking-widest">Accept Quote</button>
            </div>
          </div>

          <!-- Step 3: PIN -->
          <div v-if="step === 3" class="space-y-8">
            <div class="text-center space-y-1">
              <h4 class="text-xl font-bold text-slate-800 dark:text-white">Trade Authorization</h4>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-balance">Enter Your 4-Digit PIN To Confirm Execution</p>
            </div>
            <div class="flex justify-center gap-4">
              <input 
                v-for="(n, i) in 4" :key="i"
                :ref="el => { if (el) pinInputs[i] = el }"
                v-model="pin[i]"
                type="password"
                maxlength="1"
                inputmode="numeric"
                class="w-14 h-14 bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 rounded-2xl text-center text-2xl font-bold focus:border-primary outline-none transition-all dark:text-white"
                @input="handlePinInput(i, $event)"
                @keydown="handleBackspace(i, $event)"
              />
            </div>
            <button 
              @click="confirmTrade"
              :disabled="pin.join('').length < 4 || isProcessing"
              class="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold rounded-2xl disabled:opacity-50 active:scale-95 transition-all uppercase tracking-widest relative"
            >
              <span v-if="!isProcessing">Finalize Settlement</span>
              <span v-else class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Processing...
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

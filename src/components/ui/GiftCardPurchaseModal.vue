<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  card: Object
})

const emit = defineEmits(['close', 'success'])

const step = ref(1) // 1: Denomination, 2: Review, 3: PIN
const selectedAmount = ref(null)
const isProcessing = ref(false)
const pin = ref(['', '', '', ''])
const pinInputs = ref([])

const denominations = [5000, 10000, 25000, 50000, 100000]

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

const confirmPurchase = () => {
  isProcessing.value = true
  setTimeout(() => {
    isProcessing.value = false
    emit('success', { amount: selectedAmount.value, card: props.card })
  }, 2000)
}

const reset = () => {
  step.value = 1
  selectedAmount.value = null
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
        <!-- Progress Bar -->
        <div class="h-1.5 w-full bg-slate-100 dark:bg-white/5">
          <div 
            class="h-full bg-primary transition-all duration-500" 
            :style="{ width: (step / 3) * 100 + '%' }"
          ></div>
        </div>

        <div class="p-8 space-y-8">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 p-2 border border-black/5">
                 <img v-if="card" :src="card.image" class="w-full h-full object-contain" />
              </div>
              <div class="space-y-0.5">
                <h3 class="text-xl font-bold text-slate-800 dark:text-white tracking-tight">{{ card?.name }} Asset</h3>
                <p class="text-[9px] font-bold text-primary uppercase tracking-[0.2em]">Step {{ step }} of 3</p>
              </div>
            </div>
            <button @click="emit('close')" class="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18 M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Step 1: Denomination -->
          <div v-if="step === 1" class="space-y-6">
            <div class="space-y-1">
              <h4 class="text-sm font-bold text-slate-800 dark:text-white tracking-tight">Select Amount</h4>
              <p class="text-[10px] font-medium text-slate-400 leading-relaxed pb-1">Choose a denomination to purchase for this asset.</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <button 
                v-for="amt in denominations" 
                :key="amt"
                @click="selectedAmount = amt"
                :class="[
                  'h-16 rounded-2xl border-2 font-black transition-all active:scale-95',
                  selectedAmount === amt 
                    ? 'bg-primary border-primary text-white shadow-xl shadow-primary/30' 
                    : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-700 dark:text-slate-300'
                ]"
              >
                ₦ {{ amt.toLocaleString() }}
              </button>
            </div>
            <button 
              @click="step = 2" 
              :disabled="!selectedAmount"
              class="w-full h-14 bg-primary text-white text-[10px] font-bold rounded-2xl disabled:opacity-50 active:scale-95 transition-all uppercase tracking-widest"
            >
              Continue To Review
            </button>
          </div>

          <!-- Step 2: Review -->
          <div v-if="step === 2" class="space-y-6">
            <div class="p-6 bg-slate-50 dark:bg-white/5 rounded-[2rem] space-y-4 border border-slate-100 dark:border-white/5">
              <div class="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Asset Item</span>
                <span class="text-slate-800 dark:text-white text-balance">{{ card?.name }}</span>
              </div>
              <div class="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Value</span>
                <span class="text-slate-800 dark:text-white">₦ {{ selectedAmount.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Processing Fee</span>
                <span class="text-emerald-500">₦ 0.00 (Free)</span>
              </div>
              <div class="h-px bg-slate-200 dark:bg-white/10"></div>
              <div class="flex justify-between items-center">
                 <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Cost</span>
                 <span class="text-xl font-bold text-primary tracking-tight">₦ {{ selectedAmount.toLocaleString() }}</span>
              </div>
            </div>
            <div class="flex gap-4">
              <button @click="step = 1" class="flex-1 h-14 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white text-[10px] font-bold rounded-2xl active:scale-95 transition-all uppercase tracking-widest">Back</button>
              <button @click="step = 3" class="flex-[2] h-14 bg-primary text-white text-[10px] font-bold rounded-2xl active:scale-95 transition-all uppercase tracking-widest">Confirm & Pay</button>
            </div>
          </div>

          <!-- Step 3: PIN -->
          <div v-if="step === 3" class="space-y-8">
            <div class="text-center space-y-1">
              <h4 class="text-xl font-bold text-slate-800 dark:text-white">Security Verification</h4>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enter Your 4-Digit PIN To Authorize</p>
            </div>
            <div class="flex justify-center gap-4">
              <input 
                v-for="(n, i) in 4" :key="i"
                :ref="el => { if (el) pinInputs[i] = el }"
                v-model="pin[i]"
                type="password"
                maxlength="1"
                inputmode="numeric"
                class="w-14 h-14 bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 rounded-2xl text-center text-2xl font-black focus:border-primary outline-none transition-all"
                @input="handlePinInput(i, $event)"
                @keydown="handleBackspace(i, $event)"
              />
            </div>
            <button 
              @click="confirmPurchase"
              :disabled="pin.join('').length < 4 || isProcessing"
              class="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black rounded-2xl disabled:opacity-50 active:scale-95 transition-all uppercase tracking-widest relative"
            >
              <span v-if="!isProcessing">Authorize Purchase</span>
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

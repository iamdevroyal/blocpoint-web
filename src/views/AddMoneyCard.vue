<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../components/layout/AppShell.vue'
import LoadingOverlay from '../components/ui/LoadingOverlay.vue'
import TransactionStatusModal from '../components/ui/TransactionStatusModal.vue'

const router = useRouter()
const step = ref(1) // 1: Amount, 2: Card details, 3: Processing/Success
const amount = ref('')
const isProcessing = ref(false)
const showStatus = ref(false)

const cardForm = ref({
  number: '',
  expiry: '',
  cvv: '',
  pin: ''
})

const handleAmountInput = (event) => {
  amount.value = event.target.value.replace(/\D/g, '')
}

const handleCardNumberInput = (event) => {
  let val = event.target.value.replace(/\D/g, '')
  if (val.length > 16) val = val.substring(0, 16)
  cardForm.value.number = val.replace(/(\d{4})(?=\d)/g, '$1 ')
}

const handleExpiryInput = (event) => {
  let val = event.target.value.replace(/\D/g, '')
  if (val.length > 4) val = val.substring(0, 4)
  if (val.length >= 2) {
    cardForm.value.expiry = val.substring(0, 2) + '/' + val.substring(2)
  } else {
    cardForm.value.expiry = val
  }
}

const handleCVVInput = (event) => {
  cardForm.value.cvv = event.target.value.replace(/\D/g, '').substring(0, 3)
}

const handleNext = () => {
  if (step.value === 1 && amount.value) {
    step.value = 2
  } else if (step.value === 2) {
    isProcessing.value = true
    setTimeout(() => {
      isProcessing.value = false
      showStatus.value = true
    }, 3000)
  }
}

const goBack = () => {
  if (step.value > 1) step.value--
  else router.back()
}
</script>

<template>
  <AppShell title="Debit Card">
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 px-2">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <button @click="goBack" class="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm active:scale-90 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div>
          <h2 class="text-lg font-extrabold text-slate-800 dark:text-white uppercase tracking-tight">
            {{ step === 1 ? 'Top Up' : 'Card Details' }}
          </h2>
          <p class="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
            {{ step === 1 ? 'Enter amount to add' : 'Enter debit card info' }}
          </p>
        </div>
      </div>

      <!-- Step 1: Amount -->
      <div v-if="step === 1" class="space-y-8">
        <div class="space-y-4">
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Top-up Amount</label>
          <div class="relative">
            <span class="absolute left-8 top-1/2 -translate-y-1/2 text-3xl font-black text-slate-300 dark:text-white/20">₦</span>
            <input 
              v-model="amount"
              type="tel" 
              inputmode="numeric"
              pattern="[0-9]*"
              placeholder="0.00" 
              class="w-full h-24 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-white/10 rounded-[2.5rem] pl-16 pr-8 text-4xl font-black text-slate-800 dark:text-white focus:border-primary focus:ring-8 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none"
              @input="handleAmountInput"
            />
          </div>
        </div>

        <button 
          @click="handleNext"
          :disabled="!amount"
          class="w-full h-16 bg-primary text-white text-xs font-black rounded-3xl shadow-lg shadow-primary/30 active:scale-95 transition-all uppercase tracking-[0.2em] disabled:opacity-50"
        >
          Continue
        </button>
      </div>

      <!-- Step 2: Card Details -->
      <div v-if="step === 2" class="space-y-8">
        <!-- Visual Card Decoration -->
        <div class="relative w-full aspect-[1.6/1] rounded-[2rem] bg-gradient-to-br from-slate-800 to-slate-950 p-8 text-white shadow-2xl overflow-hidden border border-white/10 mx-auto max-w-sm">
          <div class="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
          <div class="relative z-10 h-full flex flex-col justify-between">
            <div class="flex justify-between items-start">
              <div class="w-12 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg opacity-80 border border-white/10"></div>
              <span class="font-black italic opacity-50">VISA</span>
            </div>
            
            <div class="space-y-1">
              <span class="text-[10px] font-black opacity-40 uppercase tracking-widest">Card Number</span>
              <p class="text-xl font-black tracking-[0.15em]">{{ cardForm.number || '•••• •••• •••• ••••' }}</p>
            </div>

            <div class="flex gap-12">
              <div class="space-y-0.5">
                <span class="text-[8px] font-black opacity-40 uppercase tracking-widest">Expiry</span>
                <p class="text-sm font-black">{{ cardForm.expiry || 'MM/YY' }}</p>
              </div>
              <div class="space-y-0.5">
                <span class="text-[8px] font-black opacity-40 uppercase tracking-widest">CVV</span>
                <p class="text-sm font-black">{{ cardForm.cvv ? '***' : '•••' }}</p>
              </div>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleNext" class="space-y-5">
          <div class="space-y-1.5">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Card Number</label>
            <input 
              v-model="cardForm.number"
              type="tel" 
              inputmode="numeric"
              placeholder="0000 0000 0000 0000"
              class="w-full h-14 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-2xl px-5 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
              @input="handleCardNumberInput"
              required
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Expiry Date</label>
              <input 
                v-model="cardForm.expiry"
                type="tel" 
                inputmode="numeric"
                placeholder="MM/YY"
                class="w-full h-14 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-2xl px-5 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                @input="handleExpiryInput"
                required
              />
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">CVV</label>
              <input 
                v-model="cardForm.cvv"
                type="password" 
                inputmode="numeric"
                placeholder="000"
                class="w-full h-14 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-2xl px-5 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all text-center"
                @input="handleCVVInput"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            class="w-full h-16 bg-primary text-white text-xs font-black rounded-3xl shadow-lg shadow-primary/30 active:scale-95 transition-all uppercase tracking-[0.2em] mt-4"
          >
            Pay ₦{{ amount }}
          </button>
        </form>
      </div>

      <LoadingOverlay :show="isProcessing" message="Verifying card..." />
      <TransactionStatusModal 
        :show="showStatus"
        :amount="'₦' + amount"
        title="Payment Successful"
        message="Your wallet has been credited instantly via card deposit."
        @action="router.push('/app/dashboard')"
        @close="showStatus = false"
      />
    </div>
  </AppShell>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../components/layout/AppShell.vue'
import LoadingOverlay from '../components/ui/LoadingOverlay.vue'
import TransactionStatusModal from '../components/ui/TransactionStatusModal.vue'

const router = useRouter()
const step = ref(1) // 1: Details, 2: PIN
const phone = ref('')
const amount = ref('')
const selectedNetwork = ref(null)
const isProcessing = ref(false)
const showStatus = ref(false)

const handlePhoneInput = (event) => {
  const val = event.target.value.replace(/\D/g, '')
  phone.value = val
  event.target.value = val
}

const handleAmountInput = (event) => {
  const val = event.target.value.replace(/\D/g, '')
  amount.value = val
  event.target.value = val
}
const pin = ref(['', '', '', ''])
const pinInputs = ref([])

const networks = [
  { name: 'MTN', color: 'bg-yellow-400', logo: '🇳🇬' },
  { name: 'Airtel', color: 'bg-red-500', logo: '🇳🇬' },
  { name: 'Glo', color: 'bg-emerald-500', logo: '🇳🇬' },
  { name: '9mobile', color: 'bg-emerald-950', logo: '🇳🇬' },
]

const handlePurchaseReq = () => {
  if (!phone.value || !amount.value || !selectedNetwork.value) return
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

const handlePurchase = () => {
  isProcessing.value = true
  setTimeout(() => {
    isProcessing.value = false
    showStatus.value = true
  }, 2000)
}

const goBack = () => {
  if (step.value > 1) {
    step.value--
  } else {
    router.back()
  }
}
</script>

<template>
  <AppShell title="Buy Airtime">
    <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <!-- Header -->
      <div class="flex items-center gap-4 px-2">
        <button @click="goBack" class="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm active:scale-90 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div>
          <h2 class="text-lg font-bold text-slate-800 dark:text-white">{{ step === 1 ? 'Mobile Airtime' : 'Authorize Recharge' }}</h2>
          <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{{ step === 1 ? 'Instant recharge' : 'Enter PIN to confirm' }}</p>
        </div>
      </div>

      <!-- Step 1: Details -->
      <div v-if="step === 1" class="space-y-6">
        <!-- Network Selection -->
        <div class="space-y-4 px-2">
          <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">Choose Network</label>
          <div class="grid grid-cols-4 gap-4">
            <button 
              v-for="network in networks" 
              :key="network.name" 
              @click="selectedNetwork = network"
              class="flex flex-col items-center gap-2 group"
            >
              <div class="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 border-2 flex items-center justify-center p-3 shadow-sm group-active:scale-90 transition-all relative overflow-hidden"
                :class="selectedNetwork?.name === network.name ? 'border-primary ring-4 ring-primary/10' : 'border-slate-200 dark:border-white/10'"
              >
                <div :class="[network.color, 'w-full h-full rounded-lg opacity-20 blur-[1px] absolute top-0 left-0']"></div>
                <span class="text-[10px] font-black z-10 text-slate-800 dark:text-white">{{ network.name }}</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Phone Input -->
        <div class="space-y-4 px-2">
          <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">Phone Number</label>
          <input 
            v-model="phone"
            type="tel" 
            inputmode="numeric"
            pattern="[0-9]*"
            placeholder="080 1234 5678" 
            class="w-full h-14 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl px-5 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            @input="handlePhoneInput"
          />
        </div>

        <!-- Amount Input -->
        <div class="space-y-4 px-2">
          <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">Select Amount</label>
          <div class="grid grid-cols-3 gap-3">
            <button v-for="amt in ['100', '200', '500', '1000', '2000', '5000']" :key="amt" 
              @click="amount = amt"
              class="h-12 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center text-[11px] font-bold transition-all"
              :class="amount === amt ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400'"
            >
              ₦{{ amt }}
            </button>
          </div>
          <div class="relative mt-4">
            <span class="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">₦</span>
            <input 
              v-model="amount"
              type="number" 
              inputmode="numeric"
              pattern="[0-9]*"
              placeholder="Other amount" 
              class="w-full h-14 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl pl-10 pr-5 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              @input="handleAmountInput"
            />
          </div>
        </div>

        <button 
          @click="handlePurchaseReq"
          :disabled="!phone || !amount || !selectedNetwork"
          class="mx-2 w-[calc(100%-1rem)] h-14 bg-primary text-white text-xs font-bold rounded-2xl shadow-lg shadow-primary/30 active:scale-95 transition-all uppercase tracking-widest mt-4 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <!-- Step 2: PIN -->
      <div v-if="step === 2" class="space-y-8 px-2 animate-in slide-in-from-right-4 duration-500">
        <div class="text-center space-y-2">
          <h3 class="text-lg font-extrabold text-slate-800 dark:text-white">Confirm Purchase</h3>
          <p class="text-xs font-medium text-slate-500 dark:text-slate-400">You are about to buy <span class="text-slate-800 dark:text-white font-black">₦{{ amount }}</span> {{ selectedNetwork?.name }} airtime for {{ phone }}</p>
        </div>

        <div class="flex justify-center gap-4">
          <input 
            v-for="(n, i) in 4" :key="i"
            :ref="el => { if (el) pinInputs[i] = el }"
            v-model="pin[i]"
            type="password"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="1"
            class="w-14 h-14 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-white/10 rounded-2xl text-center text-xl font-black focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
            @input="handlePinInput(i, $event)"
            @keydown="handleBackspace(i, $event)"
          />
        </div>

        <button @click="handlePurchase" class="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest">
          Complete Purchase
        </button>
      </div>

      <LoadingOverlay :show="isProcessing" message="Purchasing..." />
      <TransactionStatusModal 
        :show="showStatus"
        :amount="'₦' + amount"
        title="Recharge Successful"
        message="Your airtime has been sent directly to your phone."
        :details="[
          { label: 'Number', value: phone },
          { label: 'Network', value: selectedNetwork?.name },
          { label: 'Reference', value: '#' + Math.random().toString(36).substr(2, 9).toUpperCase() }
        ]"
        @action="router.push('/app/dashboard')"
        @close="showStatus = false"
      />
    </div>
  </AppShell>
</template>

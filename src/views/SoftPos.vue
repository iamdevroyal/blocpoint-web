<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../components/layout/AppShell.vue'
import LoadingOverlay from '../components/ui/LoadingOverlay.vue'
import TransactionStatusModal from '../components/ui/TransactionStatusModal.vue'

const router = useRouter()
const step = ref(1) // 1: Amount, 2: Tap to Pay, 3: PIN
const amount = ref('')
const fee = computed(() => {
  const val = parseFloat(amount.value || 0)
  return val * 0.005
})
const isProcessing = ref(false)
const showStatus = ref(false)
const pin = ref(['', '', '', ''])
const pinInputs = ref([])
const showNetwork = ref(false)

const banksNetwork = [
  { name: 'GTBank', status: 'High', strength: 95, color: 'text-emerald-500' },
  { name: 'Zenith', status: 'High', strength: 90, color: 'text-emerald-500' },
  { name: 'UBA', status: 'Medium', strength: 65, color: 'text-amber-500' },
  { name: 'Access', status: 'High', strength: 88, color: 'text-emerald-500' },
  { name: 'FirstBank', status: 'Low', strength: 30, color: 'text-rose-500' },
  { name: 'Kuda', status: 'High', strength: 98, color: 'text-emerald-500' },
  { name: 'Opay', status: 'High', strength: 96, color: 'text-emerald-500' },
  { name: 'Moniepoint', status: 'High', strength: 97, color: 'text-emerald-500' },
  { name: 'Fidelity', status: 'Medium', strength: 70, color: 'text-amber-500' },
  { name: 'Palmpay', status: 'High', strength: 94, color: 'text-emerald-500' }
]

const handleAmountInput = (event) => {
  const val = event.target.value.replace(/\D/g, '')
  amount.value = val
  event.target.value = val
}

const handleAmountNext = () => {
  if (!amount.value) return
  step.value = 2
}

const simulateTap = () => {
  isProcessing.value = true
  setTimeout(() => {
    isProcessing.value = false
    step.value = 3
  }, 3000)
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

const completeTransaction = () => {
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

<style scoped>
.expand-enter-active, .expand-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 500px;
}
.expand-enter-from, .expand-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

<template>
  <AppShell title="SoftPOS - Tap to Pay">
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <!-- Header -->
      <div class="flex items-center gap-4 px-2">
        <button @click="goBack" class="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm active:scale-90 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div>
          <h2 class="text-lg font-extrabold text-slate-800 dark:text-white tracking-tight">
            {{ step === 1 ? 'Collect Payment' : step === 2 ? 'Card Reader' : 'Authorize' }}
          </h2>
          <p class="text-[10px] font-black text-primary tracking-[0.2em]">
            {{ step === 1 ? 'Enter Amount To Charge' : step === 2 ? 'Hold Card Near Phone' : 'Input Cardholder PIN' }}
          </p>
        </div>
      </div>

      <!-- Step 1: Amount Input -->
      <div v-if="step === 1" class="space-y-8 px-2">
        <div class="space-y-4">
          <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Payment Amount</label>
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

        <div class="grid grid-cols-2 gap-4">
          <div class="p-5 bg-slate-100 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10">
            <p class="text-[9px] font-black text-slate-400 tracking-widest mb-1">Transaction Fee</p>
            <p class="text-sm font-black text-slate-800 dark:text-white">
              ₦{{ fee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} 
              <span v-if="fee === 0" class="text-[10px] font-bold text-emerald-500 ml-1">Free</span>
              <span v-else class="text-[10px] font-bold text-primary ml-1">0.5%</span>
            </p>
          </div>
          <div class="p-5 bg-slate-100 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10">
            <p class="text-[9px] font-black text-slate-400 tracking-widest mb-1">Settlement</p>
            <p class="text-sm font-black text-slate-800 dark:text-white">Instant</p>
          </div>
        </div>

        <!-- Bank Network Strength Section -->
        <div class="space-y-4">
          <button 
            @click="showNetwork = !showNetwork"
            class="flex items-center gap-2 px-2 group transition-all"
          >
            <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span class="text-[10px] font-black text-slate-400 group-hover:text-primary tracking-widest transition-colors uppercase">Check Banks Network Strength</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" :class="['text-slate-300 transition-transform duration-300', showNetwork ? 'rotate-180' : '']"><path d="m6 9 6 6 6-6"/></svg>
          </button>

          <Transition name="expand">
            <div v-if="showNetwork" class="overflow-hidden">
              <div class="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory px-1 pb-4">
                <div 
                  v-for="bank in banksNetwork" 
                  :key="bank.name"
                  class="flex-shrink-0 w-[160px] p-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-white/5 rounded-3xl space-y-2 group hover:border-primary/30 transition-all shadow-sm snap-start"
                >
                  <div class="flex justify-between items-center">
                    <span class="text-[10px] font-bold text-slate-500">{{ bank.name }}</span>
                    <div class="flex gap-0.5 items-end h-3">
                      <div class="w-1 rounded-full bg-slate-200 dark:bg-white/10" :class="[bank.strength >= 20 ? 'bg-primary' : '', 'h-[20%]']"></div>
                      <div class="w-1 rounded-full bg-slate-200 dark:bg-white/10" :class="[bank.strength >= 40 ? 'bg-primary' : '', 'h-[50%]']"></div>
                      <div class="w-1 rounded-full bg-slate-200 dark:bg-white/10" :class="[bank.strength >= 70 ? 'bg-primary' : '', 'h-[80%]']"></div>
                      <div class="w-1 rounded-full bg-slate-200 dark:bg-white/10" :class="[bank.strength >= 90 ? 'bg-primary' : '', 'h-[100%]']"></div>
                    </div>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-[8px] font-black uppercase tracking-tighter text-slate-400">Status</span>
                    <span :class="['text-[9px] font-black uppercase tracking-tighter', bank.color]">{{ bank.status }}</span>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <button @click="handleAmountNext" class="w-full h-16 bg-primary text-white text-xs font-black rounded-3xl shadow-xl shadow-primary/30 active:scale-95 transition-all tracking-widest">
          Continue To Pos
        </button>
      </div>

      <!-- Step 2: Tap Card (ATM Style Interface) -->
      <div v-if="step === 2" class="px-2 space-y-12">
        <!-- ATM Card Interface -->
        <div class="relative w-full aspect-[1.6/1] bg-gradient-to-br from-slate-800 to-slate-950 rounded-[2.5rem] border border-white/20 shadow-2xl overflow-hidden p-8 flex flex-col justify-between">
          <div class="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-32 -mt-32"></div>
          
          <div class="flex justify-between items-start">
            <div class="space-y-1">
              <h3 class="text-xs font-black text-white/40 tracking-[0.2em]">Contactless POS</h3>
              <p class="text-lg font-black text-white">Blocpoint SoftPOS</p>
            </div>
            <div class="w-12 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center border border-white/20">
              <div class="w-8 h-6 border border-black/10 rounded flex flex-col gap-1 p-1">
                <div class="w-full h-0.5 bg-black/20"></div>
                <div class="w-full h-0.5 bg-black/20"></div>
                <div class="w-full h-0.5 bg-black/20"></div>
              </div>
            </div>
          </div>

          <div class="flex flex-col items-center gap-6 py-4">
             <!-- Tap Asset -->
             <div class="relative group cursor-pointer" @click="simulateTap">
                <div class="absolute inset-0 animate-ping bg-primary/20 rounded-full blur-2xl"></div>
                <div class="relative w-40 h-40 md:w-48 md:h-48 flex items-center justify-center">
                  <img 
                    src="/tap.png" 
                    alt="Tap To Pay" 
                    class="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(99,102,241,0.5)] group-active:scale-90 transition-transform duration-300"
                  />
                </div>
             </div>
             <div class="text-center space-y-1">
               <h4 class="text-2xl font-black text-white px-2">Tap Your Card</h4>
               <p class="text-[10px] font-black text-white/50 tracking-[0.3em]">Ready To Receive ₦{{ parseInt(amount).toLocaleString() }}</p>
             </div>
          </div>

          <div class="flex justify-between items-end">
            <div class="flex gap-2">
              <div class="w-8 h-5 bg-white/10 rounded-md"></div>
              <div class="w-8 h-5 bg-white/10 rounded-md"></div>
            </div>
            <p class="text-[10px] font-black text-white/30">PCI MPoC Compliant</p>
          </div>
        </div>

        <!-- Waiting Indicator & Interaction -->
        <div class="space-y-6">
          <div class="flex flex-col items-center gap-4">
            <div class="flex gap-1.5">
              <div class="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
              <div class="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
              <div class="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
            </div>
            <p class="text-[10px] font-black text-slate-400 tracking-widest italic animate-pulse">Waiting For Card Detection...</p>
          </div>

          <button @click="simulateTap" class="w-full h-16 bg-white dark:bg-slate-900 border-2 border-primary text-primary text-xs font-black rounded-3xl active:scale-95 transition-all tracking-widest">
            Simulate Tap (Prototype)
          </button>
        </div>
      </div>

      <!-- Step 3: Authorize (PIN) -->
      <div v-if="step === 3" class="space-y-12 px-2">
        <div class="text-center space-y-4">
          <div class="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/20">
            <span class="text-3xl">✅</span>
          </div>
          <div class="space-y-1">
            <h3 class="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Enter Card PIN</h3>
            <p class="text-[10px] font-black text-slate-400 tracking-[0.2em]">Ask The Customer To Input Their Card PIN</p>
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
            class="w-16 h-16 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-white/10 rounded-[1.5rem] text-center text-3xl font-black focus:border-primary focus:ring-8 focus:ring-primary/10 outline-none transition-all shadow-lg"
            @input="handlePinInput(i, $event)"
            @keydown="handleBackspace(i, $event)"
          />
        </div>

        <button @click="completeTransaction" class="w-full h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black rounded-3xl shadow-2xl active:scale-95 transition-all tracking-widest">
          Complete Pos Action
        </button>
      </div>

      <!-- Overlays -->
      <LoadingOverlay :show="isProcessing" message="Reading Card Data..." />
      <TransactionStatusModal 
        :show="showStatus"
        title="POS Payment Successful"
        :amount="'₦' + parseInt(amount).toLocaleString()"
        message="The Card Transaction Was Successful. Funds Have Been Settled Into Your Agent Wallet."
        :details="[
          { label: 'Type', value: 'Domestic Card' },
          { label: 'Network', value: 'Mastercard' },
          { label: 'Approval Code', value: '772910' },
          { label: 'TID', value: 'BP-' + Math.random().toString(36).substr(2, 6).toUpperCase() }
        ]"
        @action="router.push('/app/dashboard')"
        @close="showStatus = false"
      />
    </div>
  </AppShell>
</template>

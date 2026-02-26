<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../components/layout/AppShell.vue'
import LoadingOverlay from '../components/ui/LoadingOverlay.vue'
import TransactionStatusModal from '../components/ui/TransactionStatusModal.vue'

const router = useRouter()
const step = ref(1) // 1: Details, 2: PIN
const smartCard = ref('')
const selectedProvider = ref(null)
const selectedPlan = ref(null)
const isProcessing = ref(false)
const showStatus = ref(false)

const handleSmartCardInput = (event) => {
  const val = event.target.value.replace(/\D/g, '')
  smartCard.value = val
  event.target.value = val
}
const pin = ref(['', '', '', ''])
const pinInputs = ref([])

const providers = [
  { name: 'DSTV', icon: '📡' },
  { name: 'GOTV', icon: '📡' },
  { name: 'StarTimes', icon: '📡' },
]

const plans = [
  { id: 1, label: 'Compact Plus', price: '12,400' },
  { id: 2, label: 'Compact', price: '9,000' },
  { id: 3, label: 'Confam', price: '5,300' },
  { id: 4, label: 'Yanga', price: '3,500' },
]

const handlePurchaseReq = () => {
  if (!smartCard.value || !selectedProvider.value || !selectedPlan.value) return
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
  <AppShell title="Cable TV">
    <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <!-- Header -->
      <div class="flex items-center gap-4 px-2">
        <button @click="goBack" class="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm active:scale-90 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div>
          <h2 class="text-lg font-bold text-slate-800 dark:text-white">{{ step === 1 ? 'TV Subscription' : 'Authorize Renewal' }}</h2>
          <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{{ step === 1 ? 'Renew your subscription' : 'Enter PIN to confirm' }}</p>
        </div>
      </div>

      <!-- Step 1: Details -->
      <div v-if="step === 1" class="space-y-6 px-2">
        <!-- Provider Selection -->
        <div class="space-y-4">
          <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">Select Provider</label>
          <div class="grid grid-cols-3 gap-4">
            <button 
              v-for="p in providers" :key="p.name"
              @click="selectedProvider = p"
              class="flex flex-col items-center gap-3 p-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-2 rounded-3xl transition-all"
              :class="selectedProvider?.name === p.name ? 'border-primary ring-4 ring-primary/10' : 'border-slate-100 dark:border-white/5'"
            >
              <span class="text-2xl">{{ p.icon }}</span>
              <span class="text-[10px] font-black text-slate-800 dark:text-white">{{ p.name }}</span>
            </button>
          </div>
        </div>

        <!-- SmartCard Number -->
        <div class="space-y-4">
          <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">Smartcard Number</label>
          <input 
            v-model="smartCard"
            type="number" 
            inputmode="numeric"
            pattern="[0-9]*"
            placeholder="Enter IUC / SmartCard No" 
            class="w-full h-14 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl px-5 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            @input="handleSmartCardInput"
          />
        </div>

        <!-- Plan Selection -->
        <div class="space-y-4">
          <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">Choose Plan</label>
          <div class="space-y-3">
            <button 
              v-for="plan in plans" :key="plan.id"
              @click="selectedPlan = plan"
              class="w-full flex items-center justify-between p-5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-2 rounded-2xl transition-all"
              :class="selectedPlan?.id === plan.id ? 'border-primary ring-4 ring-primary/10' : 'border-slate-100 dark:border-white/5'"
            >
              <div class="text-left">
                <h4 class="text-xs font-bold text-slate-800 dark:text-white">{{ plan.label }}</h4>
                <p class="text-[10px] font-bold text-primary mt-0.5">₦{{ plan.price }}</p>
              </div>
              <div v-if="selectedPlan?.id === plan.id" class="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </button>
          </div>
        </div>

        <button 
          @click="handlePurchaseReq"
          :disabled="!smartCard || !selectedProvider || !selectedPlan"
          class="w-full h-14 bg-primary text-white text-xs font-bold rounded-2xl shadow-lg shadow-primary/30 active:scale-95 transition-all uppercase tracking-widest mt-4 disabled:opacity-50"
        >
          Renew Now
        </button>
      </div>

      <!-- Step 2: PIN -->
      <div v-if="step === 2" class="space-y-8 px-2 animate-in slide-in-from-right-4 duration-500">
        <div class="text-center space-y-2">
          <h3 class="text-lg font-extrabold text-slate-800 dark:text-white">Authorize Renewal</h3>
          <p class="text-xs font-medium text-slate-500 dark:text-slate-400">You are about to pay <span class="text-slate-800 dark:text-white font-black">₦{{ selectedPlan?.price }}</span> for {{ selectedProvider?.name }} renewal ({{ smartCard }})</p>
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
          Complete Renewal
        </button>
      </div>

      <LoadingOverlay :show="isProcessing" />
      <TransactionStatusModal 
        :show="showStatus"
        :amount="'₦' + selectedPlan?.price"
        title="Subscription Renewed"
        message="Your cable TV subscription has been successfully updated. Restart your decoder if needed."
        :details="[
          { label: 'Smartcard', value: smartCard },
          { label: 'Provider', value: selectedProvider?.name },
          { label: 'Plan', value: selectedPlan?.label },
          { label: 'Reference', value: '#' + Math.random().toString(36).substr(2, 9).toUpperCase() }
        ]"
        @action="router.push('/app/dashboard')"
        @close="showStatus = false"
      />
    </div>
  </AppShell>
</template>

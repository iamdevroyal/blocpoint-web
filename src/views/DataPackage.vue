<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../components/layout/AppShell.vue'
import LoadingOverlay from '../components/ui/LoadingOverlay.vue'
import TransactionStatusModal from '../components/ui/TransactionStatusModal.vue'

const router = useRouter()
const step = ref(1) // 1: Details, 2: PIN
const phone = ref('')
const selectedPlan = ref(null)
const selectedNetwork = ref(null)
const isProcessing = ref(false)
const showStatus = ref(false)
const pin = ref(['', '', '', ''])
const pinInputs = ref([])

const networks = [
  { name: 'MTN', color: 'bg-yellow-400' },
  { name: 'Airtel', color: 'bg-red-500' },
  { name: 'Glo', color: 'bg-emerald-500' },
  { name: '9mobile', color: 'bg-emerald-950' },
]

const plans = [
  { id: 1, label: '1.5GB', price: '1,000', validity: '30 Days' },
  { id: 2, label: '3GB', price: '1,500', validity: '30 Days' },
  { id: 3, label: '10GB', price: '3,000', validity: '30 Days' },
  { id: 4, label: '20GB', price: '5,000', validity: '30 Days' },
  { id: 5, label: '40GB', price: '10,000', validity: '30 Days' },
  { id: 6, label: 'Unlimited', price: '18,000', validity: '30 Days' },
]

const handlePurchaseReq = () => {
  if (!phone.value || !selectedPlan.value || !selectedNetwork.value) return
  step.value = 2
}

const handlePinInput = (index, event) => {
  const val = event.target.value
  if (val && index < 3) {
    pinInputs.value[index + 1]?.focus()
  }
}

const handleBackspace = (index, event) => {
  if (event.key === 'Backspace' && !pin.value[index] && index > 0) {
    pinInputs.value[index - 1]?.focus()
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
  <AppShell title="Buy Data">
    <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <!-- Header -->
      <div class="flex items-center gap-4 px-2">
        <button @click="goBack" class="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm active:scale-90 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div>
          <h2 class="text-lg font-bold text-slate-800 dark:text-white">{{ step === 1 ? 'Mobile Data' : 'Authorize Purchase' }}</h2>
          <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{{ step === 1 ? 'Select a data bundle' : 'Enter PIN to confirm' }}</p>
        </div>
      </div>

      <!-- Step 1: Details -->
      <div v-if="step === 1" class="space-y-6 px-2">
        <!-- Network Selection -->
        <div class="space-y-4">
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

        <!-- Plan Selection -->
        <div class="space-y-4">
          <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">Select Bundle</label>
          <div class="grid grid-cols-2 gap-4">
            <button 
              v-for="plan in plans" :key="plan.id"
              @click="selectedPlan = plan"
              class="p-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-2 rounded-3xl text-left transition-all"
              :class="selectedPlan?.id === plan.id ? 'border-primary ring-4 ring-primary/10' : 'border-slate-100 dark:border-white/5'"
            >
              <h4 class="text-xs font-black text-slate-800 dark:text-white">{{ plan.label }}</h4>
              <p class="text-[10px] font-bold text-primary mt-1">₦{{ plan.price }}</p>
              <p class="text-[8px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">{{ plan.validity }}</p>
            </button>
          </div>
        </div>

        <!-- Phone Input -->
        <div class="space-y-4">
          <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">Receiver's Phone</label>
          <input 
            v-model="phone"
            type="tel" 
            placeholder="080 1234 5678" 
            class="w-full h-14 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl px-5 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>

        <button 
          @click="handlePurchaseReq"
          :disabled="!phone || !selectedPlan || !selectedNetwork"
          class="w-full h-14 bg-primary text-white text-xs font-bold rounded-2xl shadow-lg shadow-primary/30 active:scale-95 transition-all uppercase tracking-widest mt-4 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <!-- Step 2: PIN -->
      <div v-if="step === 2" class="space-y-8 px-2 animate-in slide-in-from-right-4 duration-500">
        <div class="text-center space-y-2">
          <h3 class="text-lg font-extrabold text-slate-800 dark:text-white">Confirm Data Activation</h3>
          <p class="text-xs font-medium text-slate-500 dark:text-slate-400">You are about to activate <span class="text-slate-800 dark:text-white font-black">{{ selectedPlan?.label }}</span> data bundle for {{ phone }}</p>
        </div>

        <div class="flex justify-center gap-4">
          <input 
            v-for="(n, i) in 4" :key="i"
            ref="pinInputs"
            v-model="pin[i]"
            type="password"
            maxlength="1"
            class="w-14 h-14 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-white/10 rounded-2xl text-center text-xl font-black focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
            @input="handlePinInput(i, $event)"
            @keydown="handleBackspace(i, $event)"
          />
        </div>

        <button @click="handlePurchase" class="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest">
          Pay ₦{{ selectedPlan?.price }}
        </button>
      </div>

      <LoadingOverlay :show="isProcessing" />
      <TransactionStatusModal 
        :show="showStatus"
        :amount="'₦' + selectedPlan?.price"
        title="Data Activated"
        message="Your data bundle has been successfully activated on the target number."
        :details="[
          { label: 'Number', value: phone },
          { label: 'Network', value: selectedNetwork?.name },
          { label: 'Bundle', value: selectedPlan?.label },
          { label: 'Reference', value: '#' + Math.random().toString(36).substr(2, 9).toUpperCase() }
        ]"
        @action="router.push('/app/dashboard')"
        @close="showStatus = false"
      />
    </div>
  </AppShell>
</template>

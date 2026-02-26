<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../components/layout/AppShell.vue'
import LoadingOverlay from '../components/ui/LoadingOverlay.vue'
import TransactionStatusModal from '../components/ui/TransactionStatusModal.vue'

const router = useRouter()
const step = ref(1) // 1: Acc No & Bank, 2: Amount & Confirm, 3: PIN
const accountNo = ref('')
const selectedBank = ref(null)
const showBankModal = ref(false)
const isSearching = ref(false)
const amount = ref('')
const remark = ref('')
const showStatus = ref(false)

const handleAccountInput = (event) => {
  const val = event.target.value.replace(/\D/g, '')
  accountNo.value = val
  event.target.value = val
}

const handleAmountInput = (event) => {
  const val = event.target.value.replace(/\D/g, '')
  amount.value = val
  event.target.value = val
}
const pin = ref(['', '', '', ''])
const pinInputs = ref([])

const banks = [
  { id: 1, name: 'Access Bank', logo: '🏦' },
  { id: 2, name: 'First Bank', logo: '🏦' },
  { id: 3, name: 'GT Bank', logo: '🏦' },
  { id: 4, name: 'Zenith Bank', logo: '🏦' },
  { id: 5, name: 'Wema Bank', logo: '🏦' },
  { id: 6, name: 'Kuda Bank', logo: '🏦' },
  { id: 7, name: 'Opay', logo: '🏦' },
  { id: 8, name: 'Moniepoint', logo: '🏦' },
]

const validateAccount = () => {
  if (accountNo.value.length === 10 && selectedBank.value) {
    isSearching.value = true
    setTimeout(() => {
      isSearching.value = false
      step.value = 2
    }, 1500)
  }
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

const processTransfer = () => {
  isSearching.value = true
  setTimeout(() => {
    isSearching.value = false
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
  <AppShell title="To Other Bank">
    <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <!-- Header -->
      <div class="flex items-center gap-4 px-2">
        <button @click="goBack" class="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm active:scale-90 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div>
          <h2 class="text-lg font-bold text-slate-800 dark:text-white">
            {{ step === 1 ? 'Bank Details' : step === 2 ? 'Transfer Details' : 'Verify Transaction' }}
          </h2>
          <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            {{ step === 1 ? '10-digit account number' : step === 2 ? 'Set amount & remark' : 'Confirm with your PIN' }}
          </p>
        </div>
      </div>

      <!-- Step 1: Account & Bank -->
      <div v-if="step === 1" class="space-y-6 px-2">
        <div class="space-y-4">
          <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">Account Number</label>
          <input 
            v-model="accountNo"
            type="tel" 
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="10"
            placeholder="0123456789"
            class="w-full h-14 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl px-5 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            @input="handleAccountInput"
          />
        </div>

        <div class="space-y-4">
          <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">Select Bank</label>
          <button 
            @click="showBankModal = true"
            class="w-full h-14 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl px-5 flex items-center justify-between text-left"
          >
            <span class="text-sm font-bold" :class="selectedBank ? 'text-slate-800 dark:text-white' : 'text-slate-400'">
              {{ selectedBank ? selectedBank.name : 'Choose receiving bank' }}
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="opacity-50"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        </div>

        <button 
          @click="validateAccount"
          :disabled="accountNo.length !== 10 || !selectedBank"
          class="w-full h-14 bg-primary text-white text-xs font-bold rounded-2xl shadow-lg shadow-primary/30 active:scale-95 transition-all uppercase tracking-widest mt-4 disabled:opacity-50 disabled:pointer-events-none"
        >
          Verify Account
        </button>
      </div>

      <!-- Step 2: Amount & Confirm -->
      <div v-if="step === 2" class="space-y-6 px-2 animate-in slide-in-from-right-4 duration-500">
        <!-- Verified Acc Info -->
        <div class="p-5 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center gap-4">
          <div class="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-xl">👤</div>
          <div>
            <h4 class="text-sm font-extrabold text-slate-800 dark:text-white">Njoku Nnaemeka Royal</h4>
            <p class="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{{ selectedBank.name }} • 7035148792</p>
          </div>
        </div>

        <!-- Amount Input -->
        <div class="space-y-4">
          <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">Amount to Send</label>
          <div class="relative">
            <span class="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300 dark:text-white/20">₦</span>
            <input 
              v-model="amount"
              type="number" 
              inputmode="numeric"
              pattern="[0-9]*"
              placeholder="0.00" 
              class="w-full h-20 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2rem] pl-14 pr-6 text-3xl font-black text-slate-800 dark:text-white focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-white/5"
              @input="handleAmountInput"
            />
          </div>
        </div>

        <!-- Remark Input -->
        <div class="space-y-4">
          <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">Description</label>
          <input 
            v-model="remark"
            type="text" 
            placeholder="What's this for?" 
            class="w-full h-14 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl px-5 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>

        <button @click="step = 3" class="w-full h-14 bg-primary text-white text-xs font-bold rounded-2xl shadow-lg shadow-primary/30 active:scale-95 transition-all uppercase tracking-widest mt-4">
          Next
        </button>
      </div>

      <!-- Step 3: PIN -->
      <div v-if="step === 3" class="space-y-8 px-2 animate-in slide-in-from-right-4 duration-500">
        <div class="text-center space-y-2">
          <h3 class="text-lg font-extrabold text-slate-800 dark:text-white">Authorize Transfer</h3>
          <p class="text-xs font-medium text-slate-500 dark:text-slate-400">Total: <span class="text-slate-800 dark:text-white font-black">₦{{ parseInt(amount).toLocaleString() }}</span></p>
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

        <button @click="processTransfer" class="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest">
          Pay Now
        </button>
      </div>

      <!-- Bank Selection Modal -->
      <Transition name="fade">
        <div v-if="showBankModal" class="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" @click="showBankModal = false"></div>
          <div class="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div class="p-6 border-b border-slate-100 dark:border-white/5">
              <h3 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-widest">Select Bank</h3>
            </div>
            <div class="max-h-[60vh] overflow-y-auto p-2">
              <button 
                v-for="bank in banks" :key="bank.id"
                @click="selectedBank = bank; showBankModal = false"
                class="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-colors"
              >
                <div class="w-10 h-10 bg-slate-100 dark:bg-white/10 rounded-xl flex items-center justify-center text-xl">{{ bank.logo }}</div>
                <span class="text-sm font-bold text-slate-800 dark:text-white">{{ bank.name }}</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <LoadingOverlay :show="isSearching" />
      <TransactionStatusModal 
        :show="showStatus"
        :amount="'₦' + parseInt(amount).toLocaleString()"
        message="Your bank transfer is being processed by the switch."
        :details="[
          { label: 'Recipient', value: 'Njoku Nnaemeka Royal' },
          { label: 'Bank', value: selectedBank?.name },
          { label: 'Acc No', value: accountNo }
        ]"
        @action="router.push('/app/dashboard')"
        @close="showStatus = false"
      />
    </div>
  </AppShell>
</template>

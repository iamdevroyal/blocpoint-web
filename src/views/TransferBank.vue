
<script setup>
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../components/layout/AppShell.vue'
import LoadingOverlay from '../components/ui/LoadingOverlay.vue'
import TransactionStatusModal from '../components/ui/TransactionStatusModal.vue'

import { useWalletStore } from '../stores/wallet'
import { useSavingsStore } from '../stores/savings'

const router = useRouter()
const walletStore = useWalletStore()
const savingsStore = useSavingsStore()

const step = ref(1) // 1: Acc No & Bank, 2: Amount & Confirm
const accountNo = ref('')
const selectedBank = ref(null)
const verifiedName = ref('')
const showBankModal = ref(false)
const isSearching = ref(false)
const amount = ref('')
const remark = ref('')
const showStatus = ref(false)

// Added state for OPay Checkout UX & Pin
const showCheckout = ref(false)
const showPin = ref(false)

// Pricing & Rewards Logic
const mockRewardsBalance = ref(150.00) // Dummy accrued rewards map 1-1 to NGN
const useRewards = ref(false)
const paymentMethod = ref('wallet') // 'wallet' or 'blocflex'

const transferFee = computed(() => {
  return 25
})

const rewardsOffset = computed(() => {
  if (!useRewards.value) return 0
  return Math.min(transferFee.value, mockRewardsBalance.value)
})

const totalPayable = computed(() => {
  const base = parseFloat(amount.value) || 0
  return base + transferFee.value - rewardsOffset.value
})

const walletBalance = computed(() => walletStore.activeWallet?.available_balance || 0)
const flexBalance = computed(() => {
    const flex = savingsStore.overview?.breakdown?.find(v => v.product_code === 'blocflex')
    return flex ? flex.available_balance : 0
})

const handleAccountInput = (event) => {
  const val = event.target.value.replace(/\D/g, '')
  accountNo.value = val
  event.target.value = val
  
  // Clear verification if input changes
  verifiedName.value = ''
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

// Automated Verification Watcher
watch([accountNo, selectedBank], ([newAcc, newBank]) => {
  if (newAcc.length === 10 && newBank) {
    isSearching.value = true
    verifiedName.value = ''
    
    // Simulate API Verification
    setTimeout(() => {
      isSearching.value = false
      verifiedName.value = 'Njoku Nnaemeka Royal'
    }, 1500)
  } else {
    verifiedName.value = ''
  }
})

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
    showPin.value = false
    showCheckout.value = false
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

        <!-- Verification Detail Display -->
        <div v-if="verifiedName" class="p-5 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center gap-4 animate-in zoom-in-95 duration-500">
          <div class="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center text-lg">👤</div>
          <div>
            <h4 class="text-[11px] font-black text-emerald-500 uppercase tracking-widest">Account Verified</h4>
            <p class="text-sm font-extrabold text-slate-800 dark:text-white">{{ verifiedName }}</p>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isSearching" class="p-5 flex items-center justify-center gap-3 bg-slate-50 dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-white/10">
          <div class="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verifying Account...</span>
        </div>

        <button 
          @click="step = 2"
          :disabled="!verifiedName"
          class="w-full h-14 bg-primary text-white text-xs font-bold rounded-2xl shadow-lg shadow-primary/30 active:scale-95 transition-all uppercase tracking-widest mt-4 disabled:opacity-50 disabled:pointer-events-none"
        >
          Proceed
        </button>
      </div>

      <!-- Step 2: Amount & Confirm -->
      <div v-if="step === 2" class="space-y-6 px-2 animate-in slide-in-from-right-4 duration-500">
        <!-- Verified Acc Info -->
        <div class="p-5 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center gap-4">
          <div class="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-xl">👤</div>
          <div>
            <h4 class="text-sm font-extrabold text-slate-800 dark:text-white">{{ verifiedName }}</h4>
            <p class="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{{ selectedBank.name }} • {{ accountNo }}</p>
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

        <button @click="showCheckout = true" :disabled="!amount || amount <= 0" class="w-full h-14 bg-primary text-white text-xs font-bold rounded-2xl shadow-lg shadow-primary/30 active:scale-95 transition-all uppercase tracking-widest mt-4 disabled:opacity-50 disabled:pointer-events-none">
          Next
        </button>
      </div>

      <!-- OPay Style Checkout Bottom Sheet -->
      <Transition name="fade">
        <div v-if="showCheckout" class="fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-sm" @click="showCheckout = false"></div>
      </Transition>
      <Transition name="slide-up">
        <div v-if="showCheckout" class="fixed inset-x-0 bottom-0 z-[70] pointer-events-none flex flex-col justify-end h-full">
          <!-- Maximum height capped so it never covers the entire screen, but uses flex to manage inner overflow -->
          <div class="pointer-events-auto bg-slate-50 dark:bg-slate-950 rounded-t-[2rem] shadow-2xl animate-in slide-in-from-bottom-full duration-300 w-full flex flex-col max-h-[85vh]">
            
            <!-- Scrollable Content Viewport -->
            <div class="flex-1 overflow-y-auto px-4 pt-4 pb-2 relative">
              <!-- Header with Close -->
              <div class="flex items-center justify-between mb-2 sticky top-0 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-sm z-10 py-1">
                <button @click="showCheckout = false" class="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
              
              <!-- Hero Amount -->
              <div class="text-center mb-4">
                <h2 class="text-3xl font-black text-slate-800 dark:text-white mb-1">₦{{ totalPayable.toLocaleString('en-US', {minimumFractionDigits: 2}) }}</h2>
              </div>

              <!-- Transaction Details Table -->
              <div class="space-y-3 mb-4 text-xs">
                <div class="flex justify-between items-center">
                  <span class="text-slate-500">Bank</span>
                  <span class="font-bold flex items-center gap-1.5 text-slate-800 dark:text-white">
                    <div class="w-3 h-3 bg-primary/20 text-primary rounded flex items-center justify-center text-[8px]">🏦</div> 
                    {{ selectedBank?.name }}
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-slate-500">Account No</span>
                  <span class="font-bold text-slate-800 dark:text-white">{{ accountNo }}</span>
                </div>
                <div class="flex justify-between items-start">
                  <span class="text-slate-500">Name</span>
                  <span class="font-bold text-slate-800 dark:text-white text-right max-w-[65%] leading-tight">{{ verifiedName }}</span>
                </div>
                <div class="flex justify-between items-center pt-1.5 border-t border-slate-200 dark:border-white/10">
                  <span class="text-slate-500">Amount</span>
                  <span class="font-bold text-slate-800 dark:text-white">₦{{ parseFloat(amount).toLocaleString('en-US', {minimumFractionDigits: 2}) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-slate-500">Fee</span>
                  <span class="font-bold text-slate-800 dark:text-white">₦{{ transferFee.toLocaleString('en-US', {minimumFractionDigits: 2}) }}</span>
                </div>
                
                <!-- Rewards Toggle Strip -->
                <div class="flex justify-between items-center pt-1.5 border-t border-slate-200 dark:border-white/10">
                  <div class="flex items-center gap-2">
                    <span class="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Rewards Offset</span>
                    <p class="text-[9px] text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded-full">Available: ₦{{ mockRewardsBalance }}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <span v-if="rewardsOffset > 0" class="text-[10px] font-black text-emerald-500">-₦{{ rewardsOffset.toLocaleString('en-US', {minimumFractionDigits: 2}) }}</span>
                    <button @click="useRewards = !useRewards" :class="[useRewards ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700']" class="relative inline-flex h-4 w-8 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none">
                      <span :class="[useRewards ? 'translate-x-4 bg-white' : 'translate-x-0 bg-white']" class="pointer-events-none inline-block h-3 w-3 transform rounded-full shadow ring-0 transition duration-200 ease-in-out"></span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Payment Method Selector -->
              <div class="mb-2 relative">
                <label class="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 tracking-wider">Payment Method</label>
                <div class="relative">
                  <select v-model="paymentMethod" class="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                    <option value="wallet">💸 Main Wallet (₦{{ walletBalance.toLocaleString('en-US', {minimumFractionDigits: 2}) }})</option>
                    <option value="blocflex">🏦 BlocFlex (₦{{ flexBalance.toLocaleString('en-US', {minimumFractionDigits: 2}) }})</option>
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sticky Action Footer -->
            <div class="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-white/5 shrink-0 z-20 pb-safe">
              <button @click="showPin = true" class="w-full h-12 bg-primary text-white text-[13px] font-black rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all">
                Pay Securely
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Step 3: PIN Modal over Checkout -->
      <Transition name="fade">
        <div v-if="showPin" class="fixed inset-0 z-[80] bg-slate-950/40 backdrop-blur-sm" @click="showPin = false"></div>
      </Transition>
      <Transition name="slide-up">
        <div v-if="showPin" class="fixed inset-x-0 bottom-0 z-[90] pointer-events-none flex flex-col justify-end h-full">
          <div class="pointer-events-auto bg-white dark:bg-slate-900 rounded-t-[2.5rem] p-6 pt-10 pb-8 shadow-2xl animate-in slide-in-from-bottom-full duration-300 flex flex-col items-center">
            <div class="text-center space-y-2 mb-8 w-full">
              <h3 class="text-lg font-extrabold text-slate-800 dark:text-white">Authorize Transfer</h3>
              <p class="text-xs font-medium text-slate-500 dark:text-slate-400">Total: <span class="text-slate-800 dark:text-white font-black">₦{{ totalPayable.toLocaleString('en-US', {minimumFractionDigits: 2}) }}</span></p>
            </div>

            <div class="flex justify-center gap-4 mb-8 w-full">
              <input 
                v-for="(n, i) in 4" :key="i"
                :ref="el => { if (el) pinInputs[i] = el }"
                v-model="pin[i]"
                type="password"
                inputmode="numeric"
                pattern="[0-9]*"
                maxlength="1"
                class="w-14 h-14 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-white/10 rounded-2xl text-center text-xl font-black focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                @input="handlePinInput(i, $event)"
                @keydown="handleBackspace(i, $event)"
              />
            </div>

            <div class="w-full shrink-0">
              <button @click="processTransfer" class="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[15px] font-black rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest">
                Authorize securely
              </button>
            </div>
          </div>
        </div>
      </Transition>

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

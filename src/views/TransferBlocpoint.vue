<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../components/layout/AppShell.vue'
import LoadingOverlay from '../components/ui/LoadingOverlay.vue'
import TransactionStatusModal from '../components/ui/TransactionStatusModal.vue'

import { useWalletStore } from '../stores/wallet'
import { useSavingsStore } from '../stores/savings'

const router = useRouter()
const walletStore = useWalletStore()
const savingsStore = useSavingsStore()

const step = ref(1) // 1: Search, 2: Amount/Confirm
const searchQuery = ref('')
const activeTab = ref('Recents')
const isSearching = ref(false)
const amount = ref('')
const remark = ref('')
const showStatus = ref(false)

// OPay Checkout UX & Pin State
const showCheckout = ref(false)
const showPin = ref(false)

// Pricing & Rewards Logic
const mockRewardsBalance = ref(150.00) 
const useRewards = ref(false)
const paymentMethod = ref('wallet') // 'wallet' or 'blocflex'

// Internal transfers are completely free
const transferFee = computed(() => {
  return 0
})

const rewardsOffset = computed(() => {
  if (!useRewards.value) return 0
  return Math.min(transferFee.value, mockRewardsBalance.value) // Effectively 0 offset for free transfers, but logic remains intact if policies change
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

const handleSearchInput = (event) => {
  const val = event.target.value.replace(/\D/g, '')
  searchQuery.value = val
  event.target.value = val
}

const handleAmountInput = (event) => {
  const val = event.target.value.replace(/\D/g, '')
  amount.value = val
  event.target.value = val
}
const pin = ref(['', '', '', ''])
const pinInputs = ref([])

const recentTransfers = [
  { id: 1, name: 'Njoku Royal', acc: '7035148792', icon: '👤', color: 'bg-primary/10 text-primary' },
  { id: 2, name: 'Sarah Wilson', acc: '9012345678', icon: '👤', color: 'bg-indigo-500/10 text-indigo-500' },
  { id: 3, name: 'Dave Chappelle', acc: '8055554444', icon: '👤', color: 'bg-emerald-500/10 text-emerald-500' },
]

const favoriteTransfers = [
  { id: 4, name: 'Emma Stone', acc: '7022223333', icon: '⭐', color: 'bg-amber-500/10 text-amber-500' },
  { id: 5, name: 'Ryan Gosling', acc: '8099998888', icon: '⭐', color: 'bg-rose-500/10 text-rose-500' },
]

const displayedUsers = computed(() => {
  return activeTab.value === 'Recents' ? recentTransfers : favoriteTransfers
})

const searchAccount = () => {
  if (!searchQuery.value) return
  isSearching.value = true
  setTimeout(() => {
    isSearching.value = false
    step.value = 2
  }, 1500)
}

const selectUser = (user) => {
  searchQuery.value = user.acc
  step.value = 2
}

const confirmTransfer = () => {
  showCheckout.value = true
}

const handlePinInput = (index, event) => {
  const val = event.target.value
  // Keep only last character if multiple are entered (e.g. autofill)
  const char = val.slice(-1)
  
  if (char && /^[0-9]$/.test(char)) {
    pin.value[index] = char
    if (index < 3) {
      pinInputs.value[index + 1]?.focus()
    }
  } else {
    // If not a digit, clear it
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
  <AppShell title="Transfer to Blocpoint">
    <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <!-- Header -->
      <div class="flex items-center gap-4 px-2">
        <button @click="goBack" class="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm active:scale-90 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div>
          <h2 class="text-lg font-bold text-slate-800 dark:text-white">
            {{ step === 1 ? 'Find Friend' : step === 2 ? 'Transfer Details' : 'Verify Transaction' }}
          </h2>
          <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            {{ step === 1 ? 'Search by phone or account' : step === 2 ? 'Set amount & remark' : 'Confirm with your PIN' }}
          </p>
        </div>
      </div>

      <!-- Step 1: Search -->
      <div v-if="step === 1" class="space-y-6">
        <div class="px-2">
          <div class="relative">
              <input 
                v-model="searchQuery"
                @keyup.enter="searchAccount"
                type="text" 
                inputmode="numeric"
                pattern="[0-9]*"
                placeholder="Phone No / Account No / Name"
                class="w-full h-14 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl px-5 pr-14 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                @input="handleSearchInput"
              />
            <button @click="searchAccount" class="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
          </div>
        </div>

        <!-- Recents/Favourites -->
        <div class="space-y-4">
          <div class="flex p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl overflow-hidden mx-2">
            <button 
              v-for="tab in ['Recents', 'Favourites']" 
              :key="tab"
              @click="activeTab = tab"
              class="flex-1 py-2.5 text-[10px] font-bold rounded-xl transition-all uppercase tracking-widest"
              :class="activeTab === tab ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' : 'text-slate-500'"
            >
              {{ tab }}
            </button>
          </div>

          <div class="space-y-3 px-2">
            <button 
              v-for="user in displayedUsers" 
              :key="user.id"
              @click="selectUser(user)"
              class="w-full flex items-center gap-4 p-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl group transition-all active:scale-[0.98]"
            >
              <div :class="[user.color, 'w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform']">
                {{ user.icon }}
              </div>
              <div class="text-left">
                <h4 class="text-xs font-bold text-slate-800 dark:text-white">{{ user.name }}</h4>
                <p class="text-[10px] font-semibold text-slate-400 tracking-tighter">{{ user.acc }}</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Step 2: Amount & Confirm -->
      <div v-if="step === 2" class="space-y-6 px-2 animate-in slide-in-from-right-4 duration-500">
        <!-- Target Info -->
        <div class="p-5 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-3xl flex items-center gap-4">
          <div class="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center text-xl">👤</div>
          <div>
            <h4 class="text-sm font-extrabold text-slate-800 dark:text-white">Njoku Royal</h4>
            <p class="text-[10px] font-bold text-primary uppercase tracking-widest">7035148792 • Blocpoint</p>
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
          
          <div class="grid grid-cols-3 gap-3">
            <button v-for="amt in ['500', '1000', '2000', '5000', '10000', '20000']" :key="amt" 
              @click="amount = amt"
              class="h-12 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center text-[11px] font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
            >
              ₦{{ parseInt(amt).toLocaleString() }}
            </button>
          </div>
        </div>

        <!-- Remark Input -->
        <div class="space-y-4">
          <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">What's it for? (Optional)</label>
          <input 
            v-model="remark"
            type="text" 
            placeholder="e.g. For lunch, Rent" 
            class="w-full h-14 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl px-5 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>

        <button @click="confirmTransfer" :disabled="!amount || amount <= 0" class="w-full h-14 bg-primary text-white text-xs font-bold rounded-2xl shadow-lg shadow-primary/30 active:scale-95 transition-all uppercase tracking-widest mt-4 disabled:opacity-50 disabled:pointer-events-none">
          Next Step
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
                  <span class="text-slate-500">Destination</span>
                  <span class="font-bold flex items-center gap-1.5 text-slate-800 dark:text-white">
                    <div class="w-3 h-3 bg-primary/20 text-primary rounded flex items-center justify-center text-[8px]">BP</div> 
                    Blocpoint Internal
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-slate-500">Acc / Phone</span>
                  <span class="font-bold text-slate-800 dark:text-white">{{ searchQuery || '7035148792' }}</span>
                </div>
                <div class="flex justify-between items-start">
                  <span class="text-slate-500">Name</span>
                  <span class="font-bold text-slate-800 dark:text-white text-right max-w-[65%] leading-tight">Njoku Royal</span>
                </div>
                <div class="flex justify-between items-center pt-1.5 border-t border-slate-200 dark:border-white/10">
                  <span class="text-slate-500">Amount</span>
                  <span class="font-bold text-slate-800 dark:text-white">₦{{ parseFloat(amount).toLocaleString('en-US', {minimumFractionDigits: 2}) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-slate-500">Fee</span>
                  <span class="font-bold text-emerald-500 px-1.5 py-0.5 bg-emerald-500/10 rounded-md text-[10px]">Free</span>
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

      <!-- Multi-layer Overlays -->
      <LoadingOverlay :show="isSearching" message="Verifying..." />
      
      <TransactionStatusModal 
        :show="showStatus"
        type="success"
        :amount="'₦' + parseInt(amount).toLocaleString()"
        message="Your transfer has been processed successfully. The recipient should see it in a few moments."
        :details="[
          { label: 'Recipient', value: 'Njoku Royal' },
          { label: 'Bank', value: 'Blocpoint Account' },
          { label: 'Reference', value: '#' + Math.random().toString(36).substr(2, 9).toUpperCase() }
        ]"
        @action="router.push('/app/dashboard')"
        @close="showStatus = false"
      />
    </div>
  </AppShell>
</template>

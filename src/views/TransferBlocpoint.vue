<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../components/layout/AppShell.vue'
import LoadingOverlay from '../components/ui/LoadingOverlay.vue'
import TransactionStatusModal from '../components/ui/TransactionStatusModal.vue'

const router = useRouter()
const step = ref(1) // 1: Search, 2: Amount/Confirm, 3: PIN
const searchQuery = ref('')
const activeTab = ref('Recents')
const isSearching = ref(false)
const amount = ref('')
const remark = ref('')
const showStatus = ref(false)

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

const searchAccount = () => {
  if (!searchQuery.value) return
  isSearching.value = true
  setTimeout(() => {
    isSearching.value = false
    step.value = 2
  }, 1500)
}

const selectRecent = (user) => {
  searchQuery.value = user.acc
  step.value = 2
}

const confirmTransfer = () => {
  step.value = 3
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
  <AppShell title="Transfer to BlocPoint">
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
              v-for="user in recentTransfers" 
              :key="user.id"
              @click="selectRecent(user)"
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
            <p class="text-[10px] font-bold text-primary uppercase tracking-widest">7035148792 • BlocPoint</p>
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

        <button @click="confirmTransfer" class="w-full h-14 bg-primary text-white text-xs font-bold rounded-2xl shadow-lg shadow-primary/30 active:scale-95 transition-all uppercase tracking-widest mt-4">
          Next Step
        </button>
      </div>

      <!-- Step 3: PIN -->
      <div v-if="step === 3" class="space-y-8 px-2 animate-in slide-in-from-right-4 duration-500">
        <div class="text-center space-y-2">
          <h3 class="text-lg font-extrabold text-slate-800 dark:text-white">Confirm Transfer</h3>
          <p class="text-xs font-medium text-slate-500 dark:text-slate-400">Enter your 4-digit PIN to authorize the payment of <span class="text-slate-800 dark:text-white font-black">₦{{ parseInt(amount).toLocaleString() }}</span> to Njoku Royal</p>
        </div>

        <!-- PIN Input -->
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
          Complete Transfer
        </button>
      </div>

      <!-- Multi-layer Overlays -->
      <LoadingOverlay :show="isSearching" message="Verifying..." />
      
      <TransactionStatusModal 
        :show="showStatus"
        type="success"
        :amount="'₦' + parseInt(amount).toLocaleString()"
        message="Your transfer has been processed successfully. The recipient should see it in a few moments."
        :details="[
          { label: 'Recipient', value: 'Njoku Royal' },
          { label: 'Bank', value: 'BlocPoint Account' },
          { label: 'Reference', value: '#' + Math.random().toString(36).substr(2, 9).toUpperCase() }
        ]"
        @action="router.push('/app/dashboard')"
        @close="showStatus = false"
      />
    </div>
  </AppShell>
</template>

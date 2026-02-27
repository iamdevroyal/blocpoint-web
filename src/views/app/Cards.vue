<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../../components/layout/AppShell.vue'
import PinInput from '../../components/ui/PinInput.vue'

const router = useRouter()
const activeTab = ref('Virtual Card')
const showPinModal = ref(false)
const isRevealed = ref(false)
const selectedCard = ref(null)
const activeIndex = ref(0)
const showManageModal = ref(false)
const showFundModal = ref(false)
const showLockConfirm = ref(false)
const showDeleteConfirm = ref(false)
const fundAmount = ref('')
const isProcessing = ref(false)

const tabs = ['Virtual Card', 'My Cards']

const virtualDesigns = [
  { 
    id: 1, 
    name: 'BlocPoint Visa USD', 
    image: '/v-card-usd.png', 
    type: 'VISA', 
    currency: 'USD',
    features: [
      { icon: '🌎', title: 'Global USD Spending', desc: 'Shop on Amazon, Netflix, and more in USD.' },
      { icon: '🔒', title: 'Secure & Private', desc: 'Protected by Visa Secure and 3D authentication.' },
      { icon: '💰', title: 'Real-time Rates', desc: 'Get competitive FX rates updated instantly.' },
      { icon: '🆓', title: 'No Monthly Fees', desc: 'Enjoy zero maintenance fees on USD cards.' }
    ]
  },
  { 
    id: 2, 
    name: 'BlocPoint Mastercard EUR', 
    image: '/v-card-euro.png', 
    type: 'MASTERCARD', 
    currency: 'EUR',
    features: [
      { icon: '🇪🇺', title: 'European Compatibility', desc: 'Perfect for shopping across the Eurozone.' },
      { icon: '⚡', title: 'Instant EUR Issuance', desc: 'Get your Euro card active in seconds.' },
      { icon: '📊', title: 'Spending Analytics', desc: 'Track your Euro expenses with detailed insights.' },
      { icon: '🆓', title: 'Free Maintenance', desc: 'Zero cost for maintaining your Euro virtual asset.' }
    ]
  },
  { 
    id: 3, 
    name: 'BlocPoint Verve GBP', 
    image: '/v-card-pounds.png', 
    type: 'VERVE', 
    currency: 'GBP',
    features: [
      { icon: '🇬🇧', title: 'Pounds Sterling Hub', desc: 'Ideal for UK-based merchants and services.' },
      { icon: '💎', title: 'Premium Integration', desc: 'Integrates seamlessly with your GBP wallet.' },
      { icon: '🏠', title: 'Merchant Control', desc: 'Self-manage your transaction limits anytime.' },
      { icon: '🆓', title: 'No Hidden Costs', desc: 'Transparent pricing with zero monthly fees.' }
    ]
  },
]

const activeDesign = computed(() => virtualDesigns[activeIndex.value])

const handleScroll = (e) => {
  const container = e.target
  const scrollLeft = container.scrollLeft
  const itemWidth = container.offsetWidth * 0.8 // Width of 85% card + gap
  const newIndex = Math.min(Math.round(scrollLeft / itemWidth), virtualDesigns.length - 1)
  if (activeIndex.value !== newIndex) {
    activeIndex.value = newIndex
  }
}

// Mocked user cards
const myCards = ref([
  { 
    id: 1, 
    name: 'Visa Virtual Card', 
    design: 'bg-gradient-to-br from-slate-800 to-slate-900', 
    type: 'VISA', 
    number: '4532 11** **** 9012', 
    fullNumber: '4532 1121 8763 9012',
    expiry: '09/28', 
    cvv: '884',
    balance: '1,250.00',
    currency: 'USD',
    isLocked: false,
    accent: 'bg-indigo-500'
  },
  { 
    id: 2, 
    name: 'Mastercard Virtual', 
    design: 'bg-gradient-to-br from-emerald-600 to-emerald-900', 
    type: 'MASTERCARD', 
    number: '5241 88** **** 4421', 
    fullNumber: '5241 8892 0012 4421',
    expiry: '12/27', 
    cvv: '102',
    balance: '500,000.00',
    currency: 'NGN',
    isLocked: false,
    accent: 'bg-orange-500'
  }
])

const goBack = () => router.back()
const applyNow = () => router.push('/app/cards/apply')

const triggerReveal = (card) => {
  selectedCard.value = card
  showPinModal.value = true
}

const handlePinSuccess = () => {
  showPinModal.value = false
  isRevealed.value = true
  // In a real app, this would reveal details for a limited time
  setTimeout(() => {
    isRevealed.value = false
  }, 10000)
}

const openManage = (card) => {
  selectedCard.value = card
  showManageModal.value = true
}

const handleFund = () => {
  if (!fundAmount.value) return
  isProcessing.value = true
  // Simulate API call
  setTimeout(() => {
    isProcessing.value = false
    showFundModal.value = false
    // Update local balance mock
    if (selectedCard.value) {
      const currentVal = parseFloat(selectedCard.value.balance.replace(/,/g, ''))
      const addedVal = parseFloat(fundAmount.value)
      selectedCard.value.balance = (currentVal + addedVal).toLocaleString('en-US', { minimumFractionDigits: 2 })
    }
    fundAmount.value = ''
  }, 1500)
}

const handleLockConfirm = () => {
  isProcessing.value = true
  setTimeout(() => {
    if (selectedCard.value) {
      selectedCard.value.isLocked = !selectedCard.value.isLocked
    }
    isProcessing.value = false
    showLockConfirm.value = false
  }, 1200)
}

const confirmDelete = () => {
  isProcessing.value = true
  setTimeout(() => {
    myCards.value = myCards.value.filter(c => c.id !== selectedCard.value.id)
    isProcessing.value = false
    showDeleteConfirm.value = false
  }, 1500)
}
</script>

<template>
  <AppShell title="Cards">
    <div class="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <!-- Top Title & Q&A -->
      <div class="flex items-center justify-between px-2">
        <h2 class="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Cards</h2>
      </div>

      <!-- Tabs -->
      <div class="flex p-1 bg-slate-100 dark:bg-white/5 rounded-2xl">
        <button 
          v-for="tab in tabs" 
          :key="tab"
          @click="activeTab = tab"
          class="flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all"
          :class="activeTab === tab ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'"
        >
          {{ tab }}
        </button>
      </div>

      <!-- Virtual Card Tab -->
      <div v-if="activeTab === 'Virtual Card'" class="space-y-8 animate-in fade-in duration-500">

        <!-- Snap Carousel -->
        <div 
          @scroll="handleScroll"
          class="flex overflow-x-auto gap-2 snap-x scrollbar-hide px-6 pb-6 items-center"
        >
          <div v-for="(design, idx) in virtualDesigns" :key="design.id"
            class="min-w-[85%] snap-center h-52 p-2 rounded-[2rem] relative overflow-hidden shadow-2xl transition-all duration-500 bg-slate-100 dark:bg-white/5"
            :class="[activeIndex === idx ? 'scale-100 opacity-100 z-10' : 'scale-90 opacity-40']"
          >
            <img :src="design.image" class="w-full h-full object-contain rounded-[1.5rem]" />
          </div>
        </div>

        <!-- Selected Design Label -->
        <div class="text-center" :key="activeIndex">
            <span class="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-[11px] font-black uppercase tracking-widest shadow-2xl animate-in zoom-in duration-300">
                {{ activeDesign.name }}
            </span>
        </div>

        <!-- Features -->
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-white/5 space-y-8 min-h-[440px]">
          <div v-for="feat in activeDesign.features" :key="activeIndex + feat.title" class="flex gap-4 group animate-in slide-in-from-left-4 duration-500">
            <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
              {{ feat.icon }}
            </div>
            <div class="space-y-1">
              <h4 class="text-sm font-black text-slate-800 dark:text-white tracking-tight">{{ feat.title }}</h4>
              <p class="text-[10px] font-semibold text-slate-400 leading-relaxed">{{ feat.desc }}</p>
            </div>
          </div>

          <button 
            @click="applyNow"
            class="w-full h-16 bg-emerald-500 text-white text-xs font-black uppercase tracking-[0.2em] rounded-[1.25rem] shadow-xl shadow-emerald-500/30 active:scale-95 transition-all mt-4"
          >
            Get It Now
          </button>
        </div>
      </div>

      <!-- My Cards Tab -->
      <div v-else class="space-y-6 animate-in fade-in duration-500">
        <div v-for="card in myCards" :key="card.id" class="space-y-4">
            <!-- Card Visual -->
            <div :class="[card.design, 'h-[220px] rounded-[2.5rem] p-7 text-white flex flex-col justify-between relative overflow-hidden shadow-2xl transition-transform active:scale-[0.98]']">
                <!-- Lock Overlay -->
                <div v-if="card.isLocked" class="absolute inset-0 bg-slate-900/80 backdrop-blur-md z-20 flex flex-col items-center justify-center gap-3">
                    <div class="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-3xl shadow-inner border border-white/5">🔒</div>
                    <p class="text-[11px] font-black uppercase tracking-[0.2em] text-white/90">Temporary Locked</p>
                </div>

                <div class="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                <div class="absolute -left-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                
                <div class="flex justify-between items-start z-10">
                    <div class="flex flex-col gap-0.5">
                        <span class="text-lg font-black italic tracking-tighter leading-none">BlocPoint</span>
                        <span class="text-[8px] font-black uppercase tracking-[0.2em] opacity-50">{{ card.name }}</span>
                    </div>
                    <div class="flex flex-col items-end gap-1">
                        <div class="h-6 flex items-center">
                            <span v-if="card.type === 'VISA'" class="text-lg font-black italic tracking-tighter">VISA</span>
                            <div v-else class="flex -space-x-2">
                                <div class="w-5 h-5 rounded-full bg-rose-500/90"></div>
                                <div class="w-5 h-5 rounded-full bg-amber-500/90"></div>
                            </div>
                        </div>
                        <span class="text-[8px] font-black uppercase tracking-widest opacity-80">{{ card.type }} PLATINUM</span>
                    </div>
                </div>

                <div class="space-y-5 z-10">
                    <div class="space-y-1.5">
                        <p class="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Card Number</p>
                        <p class="text-lg font-black tracking-[0.25em] font-mono whitespace-nowrap overflow-hidden" :class="{ 'blur-md opacity-40 select-none': !isRevealed }">
                            {{ isRevealed ? card.fullNumber : card.number }}
                        </p>
                    </div>

                    <div class="flex gap-10">
                        <div class="space-y-1">
                            <p class="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">Valid Thru</p>
                            <p class="text-sm font-black tracking-widest" :class="{ 'blur-md opacity-40 select-none': !isRevealed }">{{ card.expiry }}</p>
                        </div>
                        <div class="space-y-1">
                            <p class="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">CVV</p>
                            <p class="text-sm font-black tracking-widest" :class="{ 'blur-md opacity-40 select-none': !isRevealed }">{{ card.cvv }}</p>
                        </div>
                    </div>
                </div>

                <div class="flex justify-between items-end z-10">
                    <div class="w-12 h-9 bg-gradient-to-br from-amber-400/90 to-amber-600 rounded-lg shadow-inner flex items-center justify-center border border-white/10">
                        <div class="w-full h-[1px] bg-black/10"></div>
                    </div>
                    <div class="text-right">
                        <p class="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Available Balance</p>
                        <p class="text-sm font-black tracking-tight">{{ card.currency }} {{ card.balance }}</p>
                    </div>
                </div>
            </div>

            <!-- Card Actions -->
            <div class="grid grid-cols-2 gap-4">
                <button 
                  @click="triggerReveal(card)"
                  class="h-14 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                    <span class="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                        {{ isRevealed ? 'Hide Details' : 'Show Details' }}
                    </span>
                </button>
                <button 
                  @click="openManage(card)"
                  class="h-14 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                    <span class="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">Manage Card</span>
                </button>
            </div>
        </div>

        <!-- Add Another Card -->
        <button 
          @click="activeTab = 'Virtual Card'"
          class="w-full p-6 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[2rem] flex flex-col items-center gap-2 group hover:border-primary/30 transition-colors"
        >
            <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            </div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Apply for another card</p>
        </button>
      </div>
    </div>

    <!-- PIN Modal for Detail Reveal -->
    <Transition name="fade">
        <div v-if="showPinModal" class="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-md" @click="showPinModal = false"></div>
            <div class="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div class="p-8 space-y-8 text-center">
                    <div class="space-y-2">
                        <div class="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">🔒</div>
                        <h3 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">Access PIN Required</h3>
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Enter your pin to reveal sensitive card details</p>
                    </div>

                    <PinInput @complete="handlePinSuccess" />

                    <button @click="showPinModal = false" class="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </Transition>

    <!-- Manage Card Menu Modal -->
    <Transition name="fade">
        <div v-if="showManageModal" class="fixed inset-0 z-[200] flex items-end justify-center">
            <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-md" @click="showManageModal = false"></div>
            <div class="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-t-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-500">
                <div class="p-8 pb-12 space-y-8">
                    <div class="flex justify-between items-center px-2">
                        <div class="space-y-1">
                            <h3 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">Manage Card</h3>
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ selectedCard?.name }} • {{ selectedCard?.currency }}</p>
                        </div>
                        <button @click="showManageModal = false" class="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                    </div>

                    <div class="grid grid-cols-1 gap-4">
                        <!-- Fund -->
                        <button 
                          @click="showManageModal = false; showFundModal = true"
                          class="flex items-center gap-4 p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 active:scale-[0.98] transition-all group"
                        >
                            <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">💰</div>
                            <div class="text-left">
                                <h4 class="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Fund Card</h4>
                                <p class="text-[10px] font-semibold text-slate-400">Add funds from your main wallet</p>
                            </div>
                        </button>

                        <!-- Lock -->
                        <button 
                          @click="showManageModal = false; showLockConfirm = true"
                          class="flex items-center gap-4 p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 active:scale-[0.98] transition-all group"
                        >
                            <div :class="[selectedCard?.isLocked ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-500/10 text-slate-500', 'w-12 h-12 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform']">
                                {{ selectedCard?.isLocked ? '🔓' : '🔒' }}
                            </div>
                            <div class="text-left">
                                <h4 class="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{{ selectedCard?.isLocked ? 'Unlock Card' : 'Lock Card' }}</h4>
                                <p class="text-[10px] font-semibold text-slate-400">{{ selectedCard?.isLocked ? 'Enable card for transactions' : 'Temporarily disable transactions' }}</p>
                            </div>
                        </button>

                        <!-- Delete -->
                        <button 
                          @click="showManageModal = false; showDeleteConfirm = true"
                          class="flex items-center gap-4 p-6 bg-rose-500/5 dark:bg-rose-500/10 rounded-3xl border border-rose-500/10 active:scale-[0.98] transition-all group"
                        >
                            <div class="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">🗑️</div>
                            <div class="text-left">
                                <h4 class="text-sm font-black text-rose-500 uppercase tracking-tight">Terminate Card</h4>
                                <p class="text-[10px] font-semibold text-rose-500/60">Permanently delete this virtual card</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Transition>

    <!-- Fund Card Modal -->
    <Transition name="fade">
        <div v-if="showFundModal" class="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" @click="showFundModal = false"></div>
            <div class="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div class="p-10 space-y-8 text-center">
                    <div class="space-y-4">
                        <div class="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center text-4xl mx-auto">💰</div>
                        <div class="space-y-1">
                            <h3 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">Fund Virtual Card</h3>
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enter amount to transfer</p>
                        </div>
                    </div>

                    <div class="relative">
                        <span class="absolute left-6 top-1/2 -translate-y-1/2 text-lg font-black text-slate-400">₦</span>
                        <input 
                          type="number" 
                          v-model="fundAmount"
                          placeholder="0.00"
                          class="w-full h-20 bg-slate-50 dark:bg-white/5 rounded-[1.5rem] pl-12 pr-6 text-2xl font-black text-slate-800 dark:text-white focus:ring-4 focus:ring-emerald-500/20 border-none transition-all placeholder:text-slate-300"
                        >
                    </div>

                    <div class="flex flex-col gap-3">
                        <button 
                          @click="handleFund"
                          :disabled="!fundAmount || isProcessing"
                          class="w-full h-16 bg-emerald-500 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                        >
                            <span v-if="isProcessing" class="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
                            <span v-else>Confirm Funding</span>
                        </button>
                        <button @click="showFundModal = false" class="text-[10px] font-black text-slate-400 uppercase tracking-widest py-2">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    </Transition>

    <!-- Lock Confirmation Modal -->
    <Transition name="fade">
        <div v-if="showLockConfirm" class="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" @click="showLockConfirm = false"></div>
            <div class="relative w-full max-sm bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div class="p-10 space-y-8 text-center">
                    <div class="space-y-4">
                        <div :class="[selectedCard?.isLocked ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-500/10 text-slate-500', 'w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto']">
                            {{ selectedCard?.isLocked ? '🔓' : '🔒' }}
                        </div>
                        <div class="space-y-2">
                            <h3 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">
                                {{ selectedCard?.isLocked ? 'Unlock Card?' : 'Lock Card?' }}
                            </h3>
                            <p class="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest px-4">
                                {{ selectedCard?.isLocked ? 'This will re-enable all transactions for this card.' : 'This will prevent all online and offline transactions with this card.' }}
                            </p>
                        </div>
                    </div>

                    <div class="flex flex-col gap-3">
                        <button 
                          @click="handleLockConfirm"
                          :disabled="isProcessing"
                          class="w-full h-16 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                          :class="selectedCard?.isLocked ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-amber-500 shadow-amber-500/30'"
                        >
                            <span v-if="isProcessing" class="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
                            <span v-else>{{ selectedCard?.isLocked ? 'Unlock Now' : 'Lock Card' }}</span>
                        </button>
                        <button @click="showLockConfirm = false" class="text-[10px] font-black text-slate-400 uppercase tracking-widest py-2">Go Back</button>
                    </div>
                </div>
            </div>
        </div>
    </Transition>

    <!-- Delete Confirmation Modal -->
    <Transition name="fade">
        <div v-if="showDeleteConfirm" class="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" @click="showDeleteConfirm = false"></div>
            <div class="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-rose-500/20">
                <div class="p-10 space-y-8 text-center">
                    <div class="space-y-4">
                        <div class="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center text-4xl mx-auto">⚠️</div>
                        <div class="space-y-2">
                            <h3 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">Delete Virtual Card?</h3>
                            <p class="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest px-4">This action is permanent and cannot be undone. Funds will be returned to your main wallet.</p>
                        </div>
                    </div>

                    <div class="flex flex-col gap-3">
                        <button 
                          @click="confirmDelete"
                          :disabled="isProcessing"
                          class="w-full h-16 bg-rose-500 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-rose-500/30 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                        >
                            <span v-if="isProcessing" class="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
                            <span v-else>Delete Permanently</span>
                        </button>
                        <button @click="showDeleteConfirm = false" class="text-[10px] font-black text-slate-400 uppercase tracking-widest py-2">Go Back</button>
                    </div>
                </div>
            </div>
        </div>
    </Transition>

  </AppShell>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

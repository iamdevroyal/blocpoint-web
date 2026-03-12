<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../../components/layout/AppShell.vue'
import PinInput from '../../components/ui/PinInput.vue'
import { useCardStore } from '../../stores/cards.js'

const router = useRouter()
const cardStore = useCardStore()

const activeTab = ref('Virtual Card')
const showPinModal = ref(false)
const revealedDetails = ref(null)   // { pan, cvv, expiry } from Evervault
const revealTimeout = ref(null)
const selectedCard = ref(null)
const activeIndex = ref(0)
const showManageModal = ref(false)
const showFundModal = ref(false)
const showLockConfirm = ref(false)
const showDeleteConfirm = ref(false)
const fundAmount = ref('')
const isProcessing = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// FX rate from store (live from backend)
const convertedAmount = computed(() => {
  if (!fundAmount.value || !cardStore.fxRate) return '0.00'
  const rate = (cardStore.fxRate.rate || 154000) / 100 // kobo to naira
  return (parseFloat(fundAmount.value) / rate).toFixed(2)
})

const fxRateDisplay = computed(() =>
  cardStore.fxRate?.display || 'Loading rate...'
)

const tabs = ['Virtual Card', 'My Cards']

const virtualDesigns = [
  { 
    id: 1, 
    name: 'Blocpoint Mastercard USD', 
    image: '/v-card-usd.png', 
    type: 'MASTERCARD', 
    currency: 'USD',
    comingSoon: false,
    features: [
      { icon: '🌎', title: 'Global USD Spending', desc: 'Shop on Amazon, Netflix, and more in USD.' },
      { icon: '🔒', title: 'Secure & Private', desc: 'Protected by Mastercard & 3D Secure authentication.' },
      { icon: '💰', title: 'Real-time FX Rates', desc: 'Get competitive NGN/USD rates updated every minute.' },
      { icon: '⚡', title: 'Instant Issuance', desc: 'Card ready in seconds after KYC verification.' }
    ]
  },
  { 
    id: 2, 
    name: 'Blocpoint Mastercard EUR', 
    image: '/v-card-euro.png', 
    type: 'MASTERCARD', 
    currency: 'EUR',
    comingSoon: true,
    features: [
      { icon: '🇪🇺', title: 'European Compatibility', desc: 'Perfect for shopping across the Eurozone.' },
      { icon: '⚡', title: 'Instant EUR Issuance', desc: 'Join the waitlist — coming Q3 2025.' },
      { icon: '📊', title: 'Spending Analytics', desc: 'Track your Euro expenses with detailed insights.' },
      { icon: '🆓', title: 'Free Maintenance', desc: 'Zero cost for maintaining your Euro virtual card.' }
    ]
  },
  { 
    id: 3, 
    name: 'Blocpoint Verve GBP', 
    image: '/v-card-pounds.png', 
    type: 'VERVE', 
    currency: 'GBP',
    comingSoon: true,
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
  const itemWidth = container.offsetWidth * 0.8
  const newIndex = Math.min(Math.round(scrollLeft / itemWidth), virtualDesigns.length - 1)
  if (activeIndex.value !== newIndex) {
    activeIndex.value = newIndex
  }
}

// Real cards from store
const myCards = computed(() => cardStore.activeCards)

const goBack = () => router.back()

const applyNow = () => {
  if (activeDesign.value.comingSoon) {
    errorMessage.value = `${activeDesign.value.currency} cards are coming soon!`
    setTimeout(() => errorMessage.value = '', 3000)
    return
  }
  router.push('/app/cards/apply')
}

// ── Reveal ────────────────────────────────────────────────────────────────────

const triggerReveal = (card) => {
  selectedCard.value = card
  showPinModal.value = true
}

const handlePinSuccess = async () => {
  showPinModal.value = false
  isProcessing.value = true
  try {
    revealedDetails.value = await cardStore.revealCard(selectedCard.value.id)
    // Auto-hide after 10 seconds
    if (revealTimeout.value) clearTimeout(revealTimeout.value)
    revealTimeout.value = setTimeout(() => {
      revealedDetails.value = null
    }, 10000)
  } catch (e) {
    errorMessage.value = cardStore.error || 'Failed to reveal card details'
    setTimeout(() => errorMessage.value = '', 4000)
  } finally {
    isProcessing.value = false
  }
}

// ── Manage ────────────────────────────────────────────────────────────────────

const openManage = (card) => {
  selectedCard.value = card
  revealedDetails.value = null // hide details when re-opening manage
  showManageModal.value = true
}

// ── Fund ──────────────────────────────────────────────────────────────────────

const handleFund = async () => {
  if (!fundAmount.value || !selectedCard.value) return
  isProcessing.value = true
  try {
    await cardStore.fundCard(selectedCard.value.id, parseFloat(fundAmount.value))
    showFundModal.value = false
    fundAmount.value = ''
    successMessage.value = 'Card funding initiated! Balance will update shortly.'
    setTimeout(() => successMessage.value = '', 5000)
  } catch (e) {
    errorMessage.value = cardStore.error || 'Funding failed. Please try again.'
    setTimeout(() => errorMessage.value = '', 4000)
  } finally {
    isProcessing.value = false
  }
}

// ── Freeze / Unfreeze ─────────────────────────────────────────────────────────

const handleLockConfirm = async () => {
  if (!selectedCard.value) return
  isProcessing.value = true
  try {
    if (selectedCard.value.is_frozen) {
      await cardStore.unfreezeCard(selectedCard.value.id)
      successMessage.value = 'Card unfrozen successfully.'
    } else {
      await cardStore.freezeCard(selectedCard.value.id)
      successMessage.value = 'Card frozen successfully.'
    }
    showLockConfirm.value = false
    setTimeout(() => successMessage.value = '', 3000)
  } catch (e) {
    errorMessage.value = cardStore.error || 'Action failed. Please try again.'
    setTimeout(() => errorMessage.value = '', 4000)
  } finally {
    isProcessing.value = false
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────

const confirmDelete = async () => {
  if (!selectedCard.value) return
  isProcessing.value = true
  try {
    await cardStore.deleteCard(selectedCard.value.id)
    showDeleteConfirm.value = false
    showManageModal.value = false
    successMessage.value = 'Card terminated successfully.'
    setTimeout(() => successMessage.value = '', 3000)
  } catch (e) {
    errorMessage.value = cardStore.error || 'Could not delete card. Ensure balance is ₦0 first.'
    setTimeout(() => errorMessage.value = '', 5000)
  } finally {
    isProcessing.value = false
  }
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

onMounted(async () => {
  await Promise.all([
    cardStore.fetchCards(),
    cardStore.fetchCardholder(),
    cardStore.fetchFxRate(),
  ])
})
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
            <!-- Coming Soon overlay -->
            <div v-if="design.comingSoon" class="absolute inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center rounded-[1.5rem]">
              <span class="px-4 py-1.5 bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-full">Coming Soon</span>
            </div>
          </div>
        </div>

        <!-- Selected Design Label -->
        <div class="text-center" :key="activeIndex">
            <div class="inline-flex items-center gap-2">
              <span class="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-[11px] font-black uppercase tracking-widest shadow-2xl animate-in zoom-in duration-300">
                {{ activeDesign.name }}
              </span>
              <span v-if="activeDesign.comingSoon" class="px-3 py-1.5 bg-amber-400 text-slate-900 text-[9px] font-black uppercase tracking-widest rounded-full">Soon</span>
            </div>
        </div>

        <!-- Features -->
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-white/5 space-y-8 min-h-[440px]">
          <!-- FX Rate display for USD card -->
          <div v-if="!activeDesign.comingSoon" class="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl">
            <span class="text-lg">💱</span>
            <div>
              <p class="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Live FX Rate</p>
              <p class="text-xs font-bold text-slate-800 dark:text-white">{{ fxRateDisplay }}</p>
            </div>
          </div>
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
            :class="activeDesign.comingSoon ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 active:scale-95'"
            class="w-full h-16 text-xs font-black uppercase tracking-[0.2em] rounded-[1.25rem] transition-all mt-4"
          >
            {{ activeDesign.comingSoon ? '🔜 Coming Soon' : 'Get It Now' }}
          </button>
        </div>
      </div>

      <!-- My Cards Tab -->
      <div v-else class="space-y-6 animate-in fade-in duration-500">
        <!-- Loading state -->
        <div v-if="cardStore.loading && myCards.length === 0" class="flex flex-col items-center gap-4 py-12">
          <div class="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p class="text-xs font-semibold text-slate-400">Loading your cards...</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="!cardStore.loading && myCards.length === 0" class="flex flex-col items-center gap-4 py-12 text-center">
          <div class="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-3xl">💳</div>
          <div>
            <p class="font-black text-slate-800 dark:text-white">{{ cardStore.error || 'No cards yet' }}</p>
            <p class="text-xs text-slate-400 mt-1">{{ cardStore.error ? 'KYC verification is required to issue virtual cards.' : 'Apply for your first virtual card' }}</p>
          </div>
          <button @click="activeTab = 'Virtual Card'" class="px-6 py-3 bg-emerald-500 text-white text-xs font-black rounded-2xl">
            {{ cardStore.error ? 'Complete Registration' : 'Apply Now' }}
          </button>
        </div>

        <div v-for="card in myCards" :key="card.id" class="space-y-4">
            <!-- Card Visual -->
            <div class="h-[220px] rounded-[2.5rem] p-7 text-white flex flex-col justify-between relative overflow-hidden shadow-2xl transition-transform active:scale-[0.98] bg-gradient-to-br from-slate-800 to-slate-900">
                <!-- Frozen Overlay -->
                <div v-if="card.is_frozen" class="absolute inset-0 bg-slate-900/80 backdrop-blur-md z-20 flex flex-col items-center justify-center gap-3">
                    <div class="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-3xl shadow-inner border border-white/5">🔒</div>
                    <p class="text-[11px] font-black uppercase tracking-[0.2em] text-white/90">Card Frozen</p>
                </div>
                <!-- Fraud flag -->
                <div v-if="card.blocked_due_to_fraud" class="absolute inset-0 bg-red-900/80 backdrop-blur-md z-20 flex flex-col items-center justify-center gap-3">
                    <div class="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center text-3xl">⚠️</div>
                    <p class="text-[11px] font-black uppercase tracking-[0.2em] text-red-300">Flagged — Contact Support</p>
                </div>

                <div class="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                <div class="absolute -left-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                
                <div class="flex justify-between items-start z-10">
                    <div class="flex flex-col gap-0.5">
                        <span class="text-lg font-black italic tracking-tighter leading-none">Blocpoint</span>
                        <span class="text-[8px] font-black uppercase tracking-[0.2em] opacity-50">{{ card.card_brand }} Virtual</span>
                    </div>
                    <div class="flex flex-col items-end gap-1">
                        <div class="h-6 flex items-center">
                            <div class="flex -space-x-2">
                                <div class="w-5 h-5 rounded-full bg-rose-500/90"></div>
                                <div class="w-5 h-5 rounded-full bg-amber-500/90"></div>
                            </div>
                        </div>
                        <span class="text-[8px] font-black uppercase tracking-widest opacity-80">{{ card.card_brand }} VIRTUAL</span>
                    </div>
                </div>

                <div class="space-y-5 z-10">
                    <div class="space-y-1.5">
                        <p class="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Card Number</p>
                        <p class="text-lg font-black tracking-[0.25em] font-mono whitespace-nowrap overflow-hidden">
                            <span v-if="selectedCard?.id === card.id && revealedDetails">
                              {{ revealedDetails.pan || revealedDetails.card_number || '···· ···· ···· ····' }}
                            </span>
                            <span v-else class="blur-sm opacity-60">**** **** **** {{ card.last_4 || '····' }}</span>
                        </p>
                    </div>

                    <div class="flex gap-10">
                        <div class="space-y-1">
                            <p class="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">Valid Thru</p>
                            <p class="text-sm font-black tracking-widest">
                              <span v-if="selectedCard?.id === card.id && revealedDetails">{{ revealedDetails.expiry || revealedDetails.expiration }}</span>
                              <span v-else class="blur-sm opacity-60">••/••</span>
                            </p>
                        </div>
                        <div class="space-y-1">
                            <p class="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">CVV</p>
                            <p class="text-sm font-black tracking-widest">
                              <span v-if="selectedCard?.id === card.id && revealedDetails">{{ revealedDetails.cvv }}</span>
                              <span v-else class="blur-sm opacity-60">•••</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div class="flex justify-between items-end z-10">
                    <div class="w-12 h-9 bg-gradient-to-br from-amber-400/90 to-amber-600 rounded-lg shadow-inner flex items-center justify-center border border-white/10">
                        <div class="w-full h-[1px] bg-black/10"></div>
                    </div>
                    <div class="text-right">
                        <p class="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Available Balance</p>
                        <p class="text-sm font-black tracking-tight">{{ card.card_currency }} {{ card.available_balance_dollars ?? '0.00' }}</p>
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
                        {{ (selectedCard?.id === card.id && revealedDetails) ? 'Hide Details' : 'Reveal Details' }}
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
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ selectedCard?.card_brand }} Virtual &bull; USD</p>
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

                        <!-- Freeze / Unfreeze -->
                        <button 
                          @click="showManageModal = false; showLockConfirm = true"
                          class="flex items-center gap-4 p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 active:scale-[0.98] transition-all group"
                        >
                            <div :class="[selectedCard?.is_frozen ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-500/10 text-slate-500', 'w-12 h-12 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform']">
                                {{ selectedCard?.is_frozen ? '🔓' : '🔒' }}
                            </div>
                            <div class="text-left">
                                <h4 class="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{{ selectedCard?.is_frozen ? 'Unfreeze Card' : 'Freeze Card' }}</h4>
                                <p class="text-[10px] font-semibold text-slate-400">{{ selectedCard?.is_frozen ? 'Re-enable card for transactions' : 'Temporarily disable all transactions' }}</p>
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
                        <div class="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-inner border border-emerald-500/5">💰</div>
                        <div class="space-y-1">
                            <h3 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">Fund Virtual Card</h3>
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-8 leading-relaxed">Top up your card using your Naira balance</p>
                        </div>
                    </div>

                    <!-- Exchange Rate Banner -->
                    <div class="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center justify-between">
                        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Live Rate</span>
                        <span class="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">{{ fxRateDisplay }}</span>
                    </div>

                    <div class="space-y-3">
                        <div class="relative">
                            <span class="absolute left-6 top-1/2 -translate-y-1/2 text-lg font-black text-slate-400">₦</span>
                            <input 
                              type="number" 
                              v-model="fundAmount"
                              placeholder="Amount in Naira"
                              class="w-full h-20 bg-slate-50 dark:bg-white/5 rounded-[1.5rem] pl-12 pr-6 text-2xl font-black text-slate-800 dark:text-white focus:ring-4 focus:ring-emerald-500/20 border-none transition-all placeholder:text-[10px] placeholder:font-black placeholder:uppercase placeholder:tracking-widest placeholder:text-slate-300"
                            >
                        </div>

                        <!-- Conversion Display -->
                        <div v-if="parseFloat(fundAmount) > 0" class="animate-in slide-in-from-top-2 duration-300">
                            <div class="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center justify-between">
                                <span class="text-[9px] font-black text-emerald-500 uppercase tracking-widest tracking-widest">You Receive</span>
                                <span class="text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-tight">{{ selectedCard?.currency }} {{ convertedAmount }}</span>
                            </div>
                        </div>
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
                        <div :class="[selectedCard?.is_frozen ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-500/10 text-slate-500', 'w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto']">
                            {{ selectedCard?.is_frozen ? '🔓' : '🔒' }}
                        </div>
                        <div class="space-y-2">
                            <h3 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">
                                {{ selectedCard?.is_frozen ? 'Unlock Card?' : 'Lock Card?' }}
                            </h3>
                            <p class="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest px-4">
                                {{ selectedCard?.is_frozen ? 'This will re-enable all transactions for this card.' : 'This will prevent all online and offline transactions with this card.' }}
                            </p>
                        </div>
                    </div>

                    <div class="flex flex-col gap-3">
                        <button 
                          @click="handleLockConfirm"
                          :disabled="isProcessing"
                          class="w-full h-16 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                          :class="selectedCard?.is_frozen ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-amber-500 shadow-amber-500/30'"
                        >
                            <span v-if="isProcessing" class="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
                            <span v-else>{{ selectedCard?.is_frozen ? 'Unlock Now' : 'Lock Card' }}</span>
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

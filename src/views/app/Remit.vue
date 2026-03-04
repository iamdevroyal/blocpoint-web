<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../../components/layout/AppShell.vue'
import { useWalletStore } from '../../stores/wallet'
import { useAuthStore } from '../../stores/auth'
import api from '../../api/axios'
import LoadingOverlay from '../../components/ui/LoadingOverlay.vue'

const router    = useRouter()
const walletStore = useWalletStore()
const authStore   = useAuthStore()

// ── Country data (static — sourced from YC supported corridors) ─────────────
// ── State ────────────────────────────────────────────────────────────────────
const countries        = ref([])
const step             = ref(0)  // 0=country, 1=no-balance, 2=form, 3=review, 4=pin, 5=status
const selectedCountry  = ref(null)
const channels         = ref([])
const activeTab        = ref('bank_transfer')
const selectedChannel  = ref(null)
const exchangeRate     = ref(0)
const usdAmount        = ref('')
const recipient        = ref({ name: '', account_number: '', bank_code: '', phone: '', network_id: '' })
const reason           = ref('Family support')

const isLoadingChannels = ref(false)
const isLoadingRate     = ref(false)
const isSubmitting      = ref(false)
const isAccepting       = ref(false)

const submitError       = ref(null)
const acceptError       = ref(null)
const isLoading         = ref(false)

const pendingOrder      = ref(null)   // returned by POST /remittance/send
const expiresAt         = ref(null)   // YC 10-min quote lock
const quoteCountdown    = ref(0)
const statusResult      = ref(null)   // 'success' | 'failed'
const statusMessage     = ref('')

const pin               = ref(['', '', '', ''])
const pinInputs         = ref([])

// Rate refresh
let rateTimer     = null
let countdownTimer = null

// ── Wallet balance ───────────────────────────────────────────────────────────

const usdWallet = computed(() =>
  walletStore.enrichedWallets?.find(w => w.currency === 'USD')
)

const usdBalance = computed(() => parseFloat(usdWallet.value?.available_balance ?? 0))

// ── Channel tabs ─────────────────────────────────────────────────────────────

const bankChannels = computed(() => channels.value.filter(c => c.type === 'bank_transfer'))
const momoChannels = computed(() => channels.value.filter(c => c.type === 'mobile_money'))
const hasBothTabs  = computed(() => bankChannels.value.length > 0 && momoChannels.value.length > 0)
const hasAnyMethod  = computed(() => bankChannels.value.length > 0 || momoChannels.value.length > 0)

watch(activeTab, (newTab) => {
  // Preserve name when switching tabs, but reset other fields
  const currentName = recipient.value.name
  recipient.value = { name: currentName, account_number: '', bank_code: '', phone: '', network_id: '' }
  
  // Auto-set selected channel based on tab
  const channel = newTab === 'bank_transfer' ? bankChannels.value[0] : momoChannels.value[0]
  selectedChannel.value = channel

  // Auto-set network_id for mobile money
  if (newTab === 'mobile_money' && channel?.network) {
    recipient.value.network_id = channel.network
  }
})

// ── Computed local amount from rate ──────────────────────────────────────────

const localAmount = computed(() => {
  const amt = parseFloat(usdAmount.value)
  if (!amt || !exchangeRate.value) return 0
  return (amt * exchangeRate.value).toFixed(2)
})

const localCurrency = computed(() => selectedCountry.value?.currency ?? '')

// ── Recipient form valid? ────────────────────────────────────────────────────

const formValid = computed(() => {
  const channel = selectedChannel.value || (activeTab.value === 'bank_transfer' ? bankChannels.value[0] : momoChannels.value[0])
  
  if (!channel || !recipient.value.name || !usdAmount.value || parseFloat(usdAmount.value) <= 0) return false
  
  if (activeTab.value === 'bank_transfer') {
    return !!recipient.value.account_number && !!recipient.value.bank_code
  }
  
  // Mobile money validation
  const needsNetwork = momoChannels.value.length > 1
  if (needsNetwork && !recipient.value.network_id) return false
  
  return !!recipient.value.phone
})

// ── Step 0: Country selection ─────────────────────────────────────────────────

const onSelectCountry = async (country) => {
  if (country.comingSoon) return
  isLoading.value = true
  
  try {
    selectedCountry.value = country
    channels.value = []
    selectedChannel.value = null
    usdAmount.value = ''
    exchangeRate.value = 0
    submitError.value = null
    acceptError.value = null

    // Check USD balance first
    await walletStore.fetchWallets()
    if (usdBalance.value <= 0) {
      step.value = 1   // no balance — show fund wallet screen
      return
    }

    // Load channels + rate in parallel
    await Promise.all([loadChannels(country.iso), loadRate(country.currency)])
    step.value = 2
  } catch (err) {
    console.error('Failed to select country', err)
  } finally {
    isLoading.value = false
  }
}

/**
 * Maps country data to its respective flag image from public/flags/
 */
const getFlagUrl = (country) => {
  if (!country) return null
  const filename = country.name
    .replace('S. Africa', 'South-Africa')
    .replace('DR Congo', 'Congo-Democratic-Republic-of')
    .replace('B. Faso', 'Burkina-Faso')
    .replace('Ivory Coast', 'Cote-d-Ivoire')
    .replace(/\s+/g, '-')
  
  return `${import.meta.env.BASE_URL}flags/flag-of-${filename}.png`
}

// ── Load channels ─────────────────────────────────────────────────────────────

const loadChannels = async (countryIso) => {
  isLoadingChannels.value = true
  try {
    const { data } = await api.get('/remittance/channels', { params: { country: countryIso } })
    const resChannels = data?.data?.channels ?? data?.channels ?? []
    channels.value = resChannels
    
    // Default tab based on availability
    const hasBanks = resChannels.some(c => c.type === 'bank_transfer')
    const hasMomos = resChannels.some(c => c.type === 'mobile_money')

    if (hasBanks) {
      activeTab.value = 'bank_transfer'
      selectedChannel.value = resChannels.find(c => c.type === 'bank_transfer')
    } else if (hasMomos) {
      activeTab.value = 'mobile_money'
      const channel = resChannels.find(c => c.type === 'mobile_money')
      selectedChannel.value = channel
      if (channel?.network) {
        recipient.value.network_id = channel.network
      }
    }
  } catch {
    channels.value = []
  } finally {
    isLoadingChannels.value = false
  }
}

// ── Load countries ────────────────────────────────────────────────────────────

const fetchCountries = async () => {
  try {
    const { data } = await api.get('/remittance/countries')
    countries.value = data?.data?.countries ?? data?.countries ?? []
  } catch (err) {
    console.error('Failed to load countries', err)
  }
}

onMounted(() => {
  fetchCountries()
})

// ── Load live rate ─────────────────────────────────────────────────────────────

const loadRate = async (currency) => {
  isLoadingRate.value = true
  try {
    const { data } = await api.get('/remittance/rates', { params: { currency } })
    const rates = data?.data?.rates ?? data?.rates ?? []
    const match = rates.find(r => r.currency === currency)
    exchangeRate.value = match?.usdRate ?? match?.buy ?? 0
  } catch {
    exchangeRate.value = 0
  } finally {
    isLoadingRate.value = false
  }
  // Auto-refresh rate every 30s
  clearTimeout(rateTimer)
  rateTimer = setTimeout(() => loadRate(currency), 30_000)
}

// ── Step 2 → 3: Enter review ──────────────────────────────────────────────────

const goToReview = () => {
  if (!formValid.value) return
  submitError.value = null
  step.value = 3
}

// ── Step 3 → 4: Submit quote (Step 1 of 2-step accept) ───────────────────────

const submitOrder = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true
  submitError.value  = null

  try {
    const channel = selectedChannel.value ?? (
      activeTab.value === 'bank_transfer' ? bankChannels.value[0] : momoChannels.value[0]
    )

    const payload = {
      channel_id:           channel.id,
      channel_type:         activeTab.value,
      destination_country:  selectedCountry.value.iso,
      destination_currency: selectedCountry.value.currency,
      usd_amount:           parseFloat(usdAmount.value),
      reason:               reason.value || 'Cross-border remittance',
      recipient:            {
        name:           recipient.value.name,
        account_number: recipient.value.account_number || undefined,
        bank_code:      recipient.value.bank_code      || undefined,
        phone:          recipient.value.phone          || undefined,
        network_id:     recipient.value.network_id     || channel?.network || undefined,
      },
    }

    const { data } = await api.post('/remittance/send', payload)
    pendingOrder.value = data?.data?.order ?? data?.order
    expiresAt.value    = data?.data?.expires_at ?? data?.expires_at

    // Start 10-minute countdown
    startCountdown()
    step.value = 4   // PIN entry
    pin.value  = ['', '', '', '']
  } catch (err) {
    submitError.value = err?.response?.data?.message ?? 'Failed to submit remittance. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

// ── Step 4: Accept (Step 2 of 2-step) after PIN ───────────────────────────────

const acceptOrder = async () => {
  if (!pinComplete.value || isAccepting.value || !pendingOrder.value) return
  isAccepting.value = true
  acceptError.value = null

  try {
    await api.post(`/remittance/${pendingOrder.value.id}/accept`, { pin: pin.value.join('') })
    clearCountdown()
    step.value     = 5
    statusResult.value  = 'success'
    statusMessage.value = `Your remittance to ${selectedCountry.value.name} is being processed.`
  } catch (err) {
    acceptError.value = err?.response?.data?.message ?? 'Acceptance failed. The quote may have expired. Please start again.'
    if (acceptError.value.toLowerCase().includes('expired')) {
      clearCountdown()
      quoteCountdown.value = 0
    }
  } finally {
    isAccepting.value = false
  }
}

// ── Quote countdown ───────────────────────────────────────────────────────────

const startCountdown = () => {
  quoteCountdown.value = 600 // 10 minutes in seconds
  clearInterval(countdownTimer)
  countdownTimer = setInterval(() => {
    quoteCountdown.value--
    if (quoteCountdown.value <= 0) {
      clearInterval(countdownTimer)
      // Stay on PIN step but show expired state — user must go back and resubmit
    }
  }, 1000)
}

const clearCountdown = () => clearInterval(countdownTimer)

const countdownLabel = computed(() => {
  const m = Math.floor(quoteCountdown.value / 60)
  const s = quoteCountdown.value % 60
  return `${m}:${s.toString().padStart(2, '0')}`
})

// ── PIN input ─────────────────────────────────────────────────────────────────

const handlePinInput = (index, event) => {
  const char = event.target.value.slice(-1)
  if (char && /^\d$/.test(char)) {
    pin.value[index] = char
    if (index < 3) pinInputs.value[index + 1]?.focus()
  } else {
    pin.value[index] = ''
  }
}
const handlePinBackspace = (index, event) => {
  if (event.key === 'Backspace') {
    if (!pin.value[index] && index > 0) pinInputs.value[index - 1]?.focus()
    else pin.value[index] = ''
  }
}
const pinComplete = computed(() => pin.value.every(d => d !== ''))

// ── Navigation ────────────────────────────────────────────────────────────────

const goBack = () => {
  if (step.value === 0) { router.back(); return }
  if (step.value === 1) { step.value = 0; return }
  if (step.value === 2) { step.value = 0; return }
  if (step.value === 3) { step.value = 2; return }
  if (step.value === 4) { step.value = 3; return }
  router.push('/app/wallet')
}

const startOver = () => {
  clearCountdown()
  clearTimeout(rateTimer)
  selectedCountry.value = null
  channels.value        = []
  usdAmount.value       = ''
  recipient.value       = { name: '', account_number: '', bank_code: '', phone: '', network_id: '' }
  pendingOrder.value    = null
  submitError.value     = null
  acceptError.value     = null
  pin.value             = ['', '', '', '']
  step.value            = 0
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

onUnmounted(() => {
  clearCountdown()
  clearTimeout(rateTimer)
})

// ── Page titles ───────────────────────────────────────────────────────────────

const pageTitle = computed(() => {
  const map = { 0: 'Send Money', 1: 'Send Money', 2: 'Recipient Details', 3: 'Review & Confirm', 4: 'Authorise', 5: 'Done' }
  return map[step.value] ?? 'Send Money'
})
const pageSubtitle = computed(() => {
  const map = {
    0: 'Select destination country',
    1: 'Fund your USD wallet',
    2: 'Where should the money go?',
    3: 'Double-check before sending',
    4: 'Enter your 4-digit PIN',
    5: 'Transfer submitted',
  }
  return map[step.value] ?? ''
})
</script>

<template>
  <AppShell :title="pageTitle">
    <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-28">

      <!-- Header -->
      <div class="flex items-center gap-4 px-2">
        <button @click="goBack"
          class="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm active:scale-90 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div>
          <h2 class="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-tight">{{ pageTitle }}</h2>
          <p class="text-[10px] font-bold text-primary uppercase tracking-widest">{{ pageSubtitle }}</p>
        </div>
      </div>

      <!-- ── Step 0: Country Carousel ── -->
      <div v-if="step === 0" class="px-2 space-y-6">
        <div class="flex items-center justify-between px-2">
          <p class="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest leading-none">Select Destination</p>
          <span class="text-[9px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full uppercase tracking-tighter">{{ countries.filter(c => !c.comingSoon).length }} Active Corridors</span>
        </div>

        <!-- Premium Horizontal Carousel -->
        <div class="overflow-x-auto -mx-4 px-4 pb-6 scrollbar-hide snap-x snap-mandatory flex gap-4">
          <button
            v-for="country in countries" :key="country.iso"
            @click="onSelectCountry(country)"
            :disabled="country.comingSoon"
            class="snap-center flex flex-col items-center justify-center gap-4 min-w-[140px] aspect-[4/5] p-6 rounded-[2.5rem] border-2 transition-all duration-500 active:scale-[0.98] group relative overflow-hidden"
            :class="country.comingSoon
              ? 'border-slate-100 dark:border-white/5 opacity-40 cursor-not-allowed bg-slate-50 dark:bg-white/5'
              : selectedCountry?.iso === country.iso
                ? 'border-primary bg-primary/5 shadow-2xl shadow-primary/20 scale-105'
                : 'border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 shadow-xl hover:border-primary/30'"
          >
            <!-- Premium Background Flag -->
            <div class="absolute inset-0 z-0">
              <img 
                :src="getFlagUrl(country)" 
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-40 dark:opacity-30"
                @error="(e) => (e.target.style.display = 'none')"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-white/40 dark:via-slate-900/40 to-transparent"></div>
            </div>

            <div class="relative z-10 flex flex-col items-center gap-3">
              <div class="text-5xl drop-shadow-2xl transform transition-transform duration-500 group-hover:scale-110 group-active:scale-90 bg-white/40 dark:bg-black/20 backdrop-blur-sm w-20 h-20 rounded-full flex items-center justify-center border border-white/40 dark:border-white/5 shadow-xl">
                {{ country.flag }}
              </div>
              <div class="text-center space-y-0.5">
                <span class="block text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{{ country.name }}</span>
                <span class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ country.currency }}</span>
              </div>
            </div>

            <div v-if="country.comingSoon" class="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center">
              <span class="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[8px] font-black text-white uppercase tracking-widest">Available Soon</span>
            </div>
            
            <div v-else class="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <div class="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </div>
            </div>
          </button>
        </div>

        <!-- USD balance snapshot -->
        <div class="p-6 bg-gradient-to-br from-slate-900 to-slate-950 rounded-[2.5rem] border border-white/10 flex items-center justify-between shadow-2xl relative overflow-hidden group">
          <div class="absolute -left-10 -top-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
          
          <div class="flex items-center gap-4 relative z-10">
            <div class="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 text-2xl shadow-inner">
              💵
            </div>
            <div>
              <p class="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] mb-0.5">USD Available Balance</p>
              <p class="text-2xl font-black text-white tracking-tighter">${{ usdBalance.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</p>
            </div>
          </div>
          
          <button @click="router.push('/app/convert')" class="h-10 px-5 bg-primary text-white text-[9px] font-bold rounded-xl active:scale-95 transition-all uppercase tracking-widest shadow-lg shadow-primary/20 relative z-10">
            Top Up
          </button>
        </div>

        <p class="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Select a destination to continue</p>
      </div>

      <!-- ── Step 1: No USD balance ── -->
      <div v-else-if="step === 1" class="px-2 space-y-6">
        <div class="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/10 flex flex-col items-center gap-6 text-center shadow-sm">
          <div class="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-500"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-800 dark:text-white uppercase tracking-tight mb-2">No USD Balance</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">Cross-border remittances require a USD wallet balance. Convert your NGN to USD to get started.</p>
          </div>
          <button @click="router.push('/app/convert')"
            class="w-full h-14 bg-primary text-white text-xs font-bold rounded-3xl shadow-xl shadow-primary/30 active:scale-95 transition-all uppercase tracking-widest">
            Convert NGN → USD
          </button>
          <button @click="step = 0" class="text-[11px] font-bold text-slate-400 uppercase tracking-widest">← Choose Different Country</button>
        </div>
      </div>

      <!-- ── Step 2: Recipient Form ── -->
      <div v-else-if="step === 2" class="px-2 space-y-5">

        <!-- Destination badge -->
        <div class="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-sm relative overflow-hidden group">
          <div class="absolute -right-8 -top-8 w-20 h-20 bg-primary/5 rounded-full blur-2xl"></div>
          
          <span class="text-4xl relative z-10 drop-shadow-lg">{{ selectedCountry?.flag }}</span>
          <div class="relative z-10">
            <p class="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">{{ selectedCountry?.name }}</p>
            <p class="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Payout in {{ selectedCountry?.currency }}</p>
          </div>
          <button @click="step = 0" class="ml-auto h-9 px-4 bg-slate-100 dark:bg-white/5 text-[10px] font-bold text-slate-500 dark:text-white/60 rounded-xl hover:bg-primary/10 hover:text-primary transition-all uppercase tracking-widest">
            Change
          </button>
        </div>

        <!-- Loading state -->
        <div v-if="isLoadingChannels" class="flex justify-center py-8">
          <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>

        <template v-else>
          <!-- Payout Method Selection -->
          <div class="space-y-3">
            <div class="flex items-center justify-between px-1">
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payout Method</label>
              <span v-if="!hasBothTabs" class="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-tight">Only choice available</span>
            </div>

            <!-- Tab switcher (only if both channel types exist) -->
            <div v-if="hasBothTabs" class="flex bg-slate-100 dark:bg-white/5 rounded-2xl p-1">
              <button
                @click="activeTab = 'bank_transfer'"
                type="button"
                class="flex-1 h-10 text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all"
                :class="activeTab === 'bank_transfer' ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' : 'text-slate-400'"
              >🏦 Bank</button>
              <button
                @click="activeTab = 'mobile_money'"
                type="button"
                class="flex-1 h-10 text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all"
                :class="activeTab === 'mobile_money' ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' : 'text-slate-400'"
              >📱 Mobile Money</button>
            </div>

            <!-- Single choice badge (if only one exists) -->
            <div v-else-if="hasAnyMethod" class="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl">
              <span class="text-xl">{{ activeTab === 'bank_transfer' ? '🏦' : '📱' }}</span>
              <div>
                <p class="text-[11px] font-extrabold text-slate-800 dark:text-white uppercase tracking-widest">
                  {{ activeTab === 'bank_transfer' ? 'Bank Transfer' : 'Mobile Money' }}
                </p>
                <p class="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Direct to {{ activeTab === 'bank_transfer' ? 'Recipient Bank' : 'Phone Number' }}</p>
              </div>
            </div>
          </div>

          <!-- Form card -->
          <div class="p-5 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/10 space-y-4 shadow-sm">

            <!-- Recipient name -->
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Recipient Name</label>
              <input v-model="recipient.name" type="text" placeholder="Full name as on account"
                class="w-full h-12 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 placeholder:text-slate-300" />
            </div>

            <!-- Bank transfer fields -->
            <template v-if="activeTab === 'bank_transfer'">
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Bank Code</label>
                <input v-model="recipient.bank_code" type="text" inputmode="numeric" placeholder="e.g. 087"
                  class="w-full h-12 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 placeholder:text-slate-300" />
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Account Number</label>
                <input v-model="recipient.account_number" type="text" inputmode="numeric" placeholder="10-digit account number"
                  class="w-full h-12 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 placeholder:text-slate-300" />
              </div>
            </template>

            <!-- Mobile money fields -->
            <template v-else>
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Mobile Number</label>
                <input v-model="recipient.phone" type="tel" inputmode="tel" placeholder="+254712345678"
                  class="w-full h-12 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 placeholder:text-slate-300" />
              </div>
              <!-- Network selector if multiple MoMo channels -->
              <div v-if="momoChannels.length > 1">
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Mobile Network</label>
                <select v-model="recipient.network_id"
                  class="w-full h-12 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 appearance-none">
                  <option v-for="ch in momoChannels" :key="ch.id" :value="ch.network ?? ch.id">{{ ch.name }}</option>
                </select>
              </div>
            </template>

            <!-- Amount -->
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Amount (USD)</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400">$</span>
                <input v-model="usdAmount" type="text" inputmode="decimal" placeholder="0.00"
                  class="w-full h-12 pl-8 pr-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 placeholder:text-slate-300"
                  @input="usdAmount = $event.target.value.replace(/[^\d.]/g, '')" />
              </div>

              <!-- Live rate display -->
              <div v-if="usdAmount && parseFloat(usdAmount) > 0" class="mt-2 flex justify-between items-center text-[11px] px-1">
                <span class="text-slate-400">
                  <template v-if="isLoadingRate">Fetching rate…</template>
                  <template v-else-if="exchangeRate">
                    1 USD ≈ {{ exchangeRate.toLocaleString() }} {{ localCurrency }}
                  </template>
                </span>
                <span v-if="localAmount && !isLoadingRate" class="font-bold text-emerald-500">
                  ≈ {{ localCurrency }} {{ Number(localAmount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                </span>
              </div>

              <!-- Insufficient balance -->
              <div v-if="usdAmount && parseFloat(usdAmount) > usdBalance && usdBalance > 0"
                class="mt-2 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" class="text-red-500 shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/></svg>
                <p class="text-[10px] font-bold text-red-500">Exceeds USD balance (${{ usdBalance.toFixed(2) }})</p>
              </div>
            </div>

            <!-- Reason -->
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Reason (Optional)</label>
              <input v-model="reason" type="text" placeholder="Family support"
                class="w-full h-12 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-slate-300" />
            </div>
          </div>

          <!-- CTA -->
          <button @click="goToReview"
            :disabled="!formValid || parseFloat(usdAmount) > usdBalance"
            class="w-full h-16 text-white text-xs font-bold rounded-3xl shadow-xl active:scale-95 transition-all uppercase tracking-widest"
            :class="formValid && parseFloat(usdAmount) <= usdBalance ? 'bg-primary shadow-primary/30' : 'bg-slate-300 dark:bg-white/10 cursor-not-allowed'">
            Review Transfer →
          </button>
        </template>
      </div>

      <!-- ── Step 3: Review & Confirm ── -->
      <div v-else-if="step === 3" class="px-2 space-y-5">
        <div class="p-6 bg-slate-900 rounded-[2.5rem] border border-white/10 space-y-5">
          <!-- Amounts -->
          <div class="flex justify-between items-center">
            <div class="text-center">
              <p class="text-2xl font-bold text-white">${{ parseFloat(usdAmount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</p>
              <p class="text-[9px] font-bold text-white/40 uppercase mt-1">You Send</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="m9 18 6-6-6-6"/></svg>
            <div class="text-center">
              <p class="text-2xl font-bold text-emerald-400">{{ localCurrency }} {{ Number(localAmount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</p>
              <p class="text-[9px] font-bold text-white/40 uppercase mt-1">They Receive</p>
            </div>
          </div>
          <!-- Details -->
          <div class="border-t border-white/10 pt-4 space-y-2.5">
            <div class="flex justify-between text-[11px] font-bold">
              <span class="text-white/40 uppercase tracking-widest">Destination</span>
              <span class="text-white">{{ selectedCountry?.flag }} {{ selectedCountry?.name }}</span>
            </div>
            <div class="flex justify-between text-[11px] font-bold">
              <span class="text-white/40 uppercase tracking-widest">Recipient</span>
              <span class="text-white">{{ recipient.name }}</span>
            </div>
            <div v-if="activeTab === 'bank_transfer'" class="flex justify-between text-[11px] font-bold">
              <span class="text-white/40 uppercase tracking-widest">Account</span>
              <span class="text-white">{{ recipient.account_number }}</span>
            </div>
            <div v-else class="flex justify-between text-[11px] font-bold">
              <span class="text-white/40 uppercase tracking-widest">Phone</span>
              <span class="text-white">{{ recipient.phone }}</span>
            </div>
            <div class="flex justify-between text-[11px] font-bold">
              <span class="text-white/40 uppercase tracking-widest">Rate</span>
              <span class="text-white">1 USD = {{ exchangeRate?.toLocaleString() }} {{ localCurrency }}</span>
            </div>
            <div class="flex justify-between text-[11px] font-bold">
              <span class="text-white/40 uppercase tracking-widest">Payment Method</span>
              <span class="text-white capitalize">{{ activeTab.replace('_', ' ') }}</span>
            </div>
          </div>
        </div>

        <p v-if="submitError" class="text-[11px] text-red-500 font-bold text-center px-2">{{ submitError }}</p>

        <button @click="submitOrder" :disabled="isSubmitting"
          class="w-full h-16 text-white text-xs font-bold rounded-3xl shadow-xl active:scale-95 transition-all uppercase tracking-widest"
          :class="!isSubmitting ? 'bg-primary shadow-primary/30' : 'bg-slate-300 dark:bg-white/10 cursor-not-allowed'">
          {{ isSubmitting ? 'Locking Rate…' : 'Confirm & Enter PIN →' }}
        </button>

        <p class="text-center text-[10px] text-slate-400 font-medium">You'll confirm your PIN on the next step</p>
      </div>

      <!-- ── Step 4: PIN Confirmation ── -->
      <div v-else-if="step === 4" class="px-2 space-y-8">

        <!-- Quote countdown -->
        <div class="flex justify-center">
          <div :class="quoteCountdown <= 60 ? 'bg-red-500/10 border-red-500/20' : 'bg-amber-500/10 border-amber-500/20'"
            class="flex items-center gap-2 border rounded-2xl px-4 py-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="quoteCountdown <= 60 ? 'text-red-500' : 'text-amber-500'"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            <span :class="quoteCountdown <= 60 ? 'text-red-500' : 'text-amber-500'" class="text-[11px] font-bold">
              Rate locked — expires in {{ countdownLabel }}
            </span>
          </div>
        </div>

        <!-- Compact summary -->
        <div class="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-sm text-center space-y-1">
          <p class="text-2xl font-bold text-slate-800 dark:text-white">${{ parseFloat(usdAmount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }} USD</p>
          <p class="text-sm text-emerald-500 font-bold">→ {{ localCurrency }} {{ Number(localAmount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</p>
          <p class="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">to {{ recipient.name }} · {{ selectedCountry?.name }}</p>
        </div>

        <div class="text-center space-y-1">
          <h3 class="text-base font-bold text-slate-800 dark:text-white uppercase tracking-tight">Authorise Transfer</h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enter your 4-digit security PIN</p>
        </div>

        <!-- PIN inputs -->
        <div class="flex justify-center gap-5">
          <input
            v-for="(n, i) in 4" :key="i"
            :ref="el => { if (el) pinInputs[i] = el }"
            v-model="pin[i]"
            type="password"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="1"
            class="w-16 h-16 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-white/10 rounded-[1.5rem] text-center text-3xl font-bold focus:border-primary focus:ring-8 focus:ring-primary/10 outline-none transition-all shadow-lg"
            @input="handlePinInput(i, $event)"
            @keydown="handlePinBackspace(i, $event)"
          />
        </div>

        <p v-if="acceptError" class="text-[11px] text-red-500 font-bold text-center px-2">{{ acceptError }}</p>

        <!-- Expired state -->
        <div v-if="quoteCountdown <= 0" class="text-center space-y-3">
          <p class="text-[12px] font-bold text-red-500">⏰ Rate expired. Please start a new transfer.</p>
          <button @click="step = 3; submitOrder()"
            class="w-full h-12 bg-primary text-white text-[11px] font-bold rounded-3xl shadow-xl shadow-primary/30 active:scale-95 uppercase tracking-widest">
            Get New Rate →
          </button>
        </div>

        <button v-else
          @click="acceptOrder"
          :disabled="!pinComplete || isAccepting"
          class="w-full h-16 text-white text-xs font-bold rounded-3xl active:scale-95 transition-all uppercase tracking-widest"
          :class="pinComplete && !isAccepting ? 'bg-primary shadow-xl shadow-primary/30' : 'bg-slate-300 dark:bg-white/10 cursor-not-allowed'">
          {{ isAccepting ? 'Processing…' : 'Send Money' }}
        </button>
      </div>

      <!-- ── Step 5: Status ── -->
      <div v-else-if="step === 5" class="flex flex-col items-center justify-center gap-8 py-12 px-2 text-center">
        <div class="w-24 h-24 rounded-full flex items-center justify-center border"
          :class="statusResult === 'success' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'">
          <svg v-if="statusResult === 'success'" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500"><path d="M20 6 9 17l-5-5"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-red-500"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </div>
        <div class="space-y-2">
          <h3 class="text-2xl font-bold uppercase tracking-tight" :class="statusResult === 'success' ? 'text-slate-800 dark:text-white' : 'text-red-500'">
            {{ statusResult === 'success' ? 'Transfer Sent!' : 'Transfer Failed' }}
          </h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">{{ statusMessage }}</p>
          <p v-if="statusResult === 'success'" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Typically arrives within 5–30 minutes. We'll notify you on completion.
          </p>
        </div>
        <div class="w-full space-y-3">
          <button @click="router.push('/app/wallet')"
            class="w-full h-14 bg-primary text-white text-xs font-bold rounded-3xl shadow-xl shadow-primary/30 active:scale-95 transition-all uppercase tracking-widest">
            Back to Wallet
          </button>
          <button @click="startOver"
            class="w-full h-12 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-3xl active:scale-95 transition-all uppercase tracking-widest">
            Send Another
          </button>
        </div>
      </div>

    </div>

    <!-- Global Loading Overlay -->
    <LoadingOverlay :show="isLoading" message="Preparing transfer..." />
  </AppShell>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>

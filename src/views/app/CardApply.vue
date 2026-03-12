<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../../components/layout/AppShell.vue'
import PinInput from '../../components/ui/PinInput.vue'
import { useCardStore } from '../../stores/cards.js'

const router = useRouter()
const cardStore = useCardStore()

// ── Step Navigation ───────────────────────────────────────────────────────────
// Step 1: Choose card limit
// Step 2: KYC verification (if not yet done)
// Step 3: Set PIN + initial funding amount
// Step 4: Review & confirm
// Step 5: Success
const step = ref(1)

// ── Form State ────────────────────────────────────────────────────────────────
const selectedLimit = ref(null)  // 500000 or 1000000
const fundingAmount = ref('')
const pin = ref('')
const pinConfirmation = ref('')
const NIGERIAN_STATES = [
  "Abia", "Abuja", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo", "Jigawa", 
  "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", 
  "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
]

const kycData = ref({
  address: '',
  city: '',
  state: 'Lagos',
  postal_code: '',
  house_no: '',
  id_type: 'NIGERIAN_BVN_VERIFICATION',
  bvn: '',
  selfie_image: '',
  id_no: '',
  id_image: '',
})

const isProcessing = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// ── Computed ──────────────────────────────────────────────────────────────────

const hasVerifiedCardholder = computed(() => cardStore.hasVerifiedCardholder)

const fxRateDisplay = computed(() => cardStore.fxRate?.display || '—')

const convertedUsd = computed(() => {
  if (!fundingAmount.value || !cardStore.fxRate) return '0.00'
  const rate = (cardStore.fxRate.rate || 154000) / 100
  return (parseFloat(fundingAmount.value) / rate).toFixed(2)
})

const minFundingNgn = computed(() => {
  if (!cardStore.fxRate || !selectedLimit.value) return 0
  const rate = (cardStore.fxRate.rate || 154000) / 100
  const minCents = selectedLimit.value === 500000 ? 300 : 400 // $3 or $4
  return Math.ceil((minCents / 100) * rate)
})

const cardLimits = [
  {
    value: 500000,
    label: '$5,000 Limit',
    subtitle: 'Min fund $3 • Great for subscriptions',
    emoji: '💳',
    color: 'from-indigo-600 to-indigo-900',
  },
  {
    value: 1000000,
    label: '$10,000 Limit',
    subtitle: 'Min fund $4 • Best for power users',
    emoji: '💎',
    color: 'from-emerald-600 to-emerald-900',
  },
]

// ── Actions ───────────────────────────────────────────────────────────────────

const selectLimit = (limit) => {
  selectedLimit.value = limit
  step.value = hasVerifiedCardholder.value ? 3 : 2
}

const submitKyc = async () => {
  isProcessing.value = true
  errorMessage.value = ''
  try {
    await cardStore.registerCardholder(kycData.value)
    step.value = 3
  } catch (e) {
    errorMessage.value = cardStore.error || 'KYC failed. Please check your details.'
  } finally {
    isProcessing.value = false
  }
}

const submitCard = async () => {
  if (pin.value !== pinConfirmation.value) {
    errorMessage.value = 'PINs do not match. Please try again.'
    return
  }
  if (pin.value.length !== 4 || !/^\d{4}$/.test(pin.value)) {
    errorMessage.value = 'PIN must be exactly 4 digits.'
    return
  }
  step.value = 4
}

const confirmCreate = async () => {
  isProcessing.value = true
  errorMessage.value = ''
  try {
    await cardStore.createCard({
      card_limit:          selectedLimit.value,
      pin:                 pin.value,
      pin_confirmation:    pinConfirmation.value,
      funding_amount_ngn:  parseFloat(fundingAmount.value),
    })
    step.value = 5
  } catch (e) {
    errorMessage.value = cardStore.error || 'Card creation failed. Please try again.'
  } finally {
    isProcessing.value = false
  }
}

const goToCards = () => router.push('/app/cards')
const goBack = () => {
  if (step.value > 1) step.value -= 1
  else router.back()
}

// Watch for errors from child operations
watch(() => cardStore.error, (err) => {
  if (err) {
    errorMessage.value = err
    setTimeout(() => errorMessage.value = '', 5000)
  }
})
</script>

<template>
  <AppShell title="Apply for Card">
    <div class="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">

      <!-- Header / Back -->
      <div class="flex items-center gap-4 px-2">
        <button @click="goBack" class="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div>
          <h2 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">
            {{ step === 5 ? 'Card Ready! 🎉' : 'Apply for a Card' }}
          </h2>
          <p class="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
            Step {{ Math.min(step, 4) }} of 4
          </p>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
        <div
          class="h-full bg-emerald-500 rounded-full transition-all duration-500"
          :style="{ width: `${(Math.min(step, 4) / 4) * 100}%` }"
        ></div>
      </div>

      <!-- ── Step 1: Choose Limit ──────────────────────────────────────────── -->
      <div v-if="step === 1" class="space-y-4 animate-in fade-in duration-500">
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-xl border border-slate-100 dark:border-white/5 space-y-3">
          <h3 class="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Choose Your Card Limit</h3>
          <p class="text-[11px] text-slate-400">Both are USD Mastercards. Choose based on your spending needs.</p>

          <div class="space-y-3 mt-4">
            <button
              v-for="limit in cardLimits"
              :key="limit.value"
              @click="selectLimit(limit.value)"
              :class="['w-full flex items-center gap-4 p-5 rounded-3xl border-2 transition-all active:scale-[0.98]',
                selectedLimit === limit.value
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                  : 'border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5']"
            >
              <div :class="`w-14 h-14 rounded-2xl bg-gradient-to-br ${limit.color} flex items-center justify-center text-2xl shadow-lg flex-shrink-0`">
                {{ limit.emoji }}
              </div>
              <div class="text-left flex-1">
                <p class="font-black text-slate-800 dark:text-white">{{ limit.label }}</p>
                <p class="text-[11px] text-slate-400 mt-0.5">{{ limit.subtitle }}</p>
              </div>
              <div v-if="selectedLimit === limit.value" class="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs">✓</div>
            </button>
          </div>
        </div>

        <!-- FX Rate pill -->
        <div class="flex items-center gap-2 justify-center text-[11px] text-slate-400 font-semibold">
          <span class="text-base">💱</span> Live FX Rate: <span class="text-emerald-600 dark:text-emerald-400 font-black">{{ fxRateDisplay }}</span>
        </div>
      </div>

      <!-- ── Step 2: KYC ──────────────────────────────────────────────────── -->
      <div v-if="step === 2" class="space-y-4 animate-in fade-in duration-500">
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-xl border border-slate-100 dark:border-white/5 space-y-5">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-2xl">🪪</div>
            <div>
              <h3 class="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Identity Verification</h3>
              <p class="text-[10px] text-slate-400">KYC required for card issuance</p>
            </div>
          </div>

          <!-- Address -->
          <div class="space-y-3">
            <label class="text-[10px] font-black uppercase tracking-widest text-slate-500">Address</label>
            <input v-model="kycData.address" type="text" placeholder="Street address" class="w-full h-14 bg-slate-50 dark:bg-white/5 rounded-2xl px-5 text-sm font-semibold text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-emerald-500/30 outline-none transition" />
            <div class="grid grid-cols-2 gap-3">
              <input v-model="kycData.city" type="text" placeholder="City" class="h-12 bg-slate-50 dark:bg-white/5 rounded-2xl px-4 text-sm font-semibold text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-emerald-500/30 outline-none transition" />
              <input v-model="kycData.postal_code" type="text" placeholder="Postal Code" class="h-12 bg-slate-50 dark:bg-white/5 rounded-2xl px-4 text-sm font-semibold text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-emerald-500/30 outline-none transition" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <select v-model="kycData.state" class="h-12 bg-slate-50 dark:bg-white/5 rounded-2xl px-4 text-sm font-semibold text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-emerald-500/30 outline-none transition">
                <option v-for="st in NIGERIAN_STATES" :key="st" :value="st">{{ st }}</option>
              </select>
              <input v-model="kycData.house_no" type="text" placeholder="House #" class="h-12 bg-slate-50 dark:bg-white/5 rounded-2xl px-4 text-sm font-semibold text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-emerald-500/30 outline-none transition" />
            </div>
          </div>

          <!-- ID type selector -->
          <div class="space-y-3">
            <label class="text-[10px] font-black uppercase tracking-widest text-slate-500">Identity Type</label>
            <select v-model="kycData.id_type" class="w-full h-14 bg-slate-50 dark:bg-white/5 rounded-2xl px-5 text-sm font-semibold text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-emerald-500/30 outline-none transition">
              <option value="NIGERIAN_BVN_VERIFICATION">BVN Verification (Recommended)</option>
              <option value="NIGERIAN_NIN">National ID (NIN)</option>
              <option value="NIGERIAN_DRIVERS_LICENSE">Driver's License</option>
              <option value="NIGERIAN_INTERNATIONAL_PASSPORT">International Passport</option>
            </select>
          </div>

          <!-- BVN (always required) -->
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-slate-500">BVN</label>
            <input v-model="kycData.bvn" type="text" maxlength="11" placeholder="11-digit BVN" class="w-full h-14 bg-slate-50 dark:bg-white/5 rounded-2xl px-5 text-sm font-semibold text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-emerald-500/30 outline-none transition" />
          </div>

          <!-- ID Number (for non-BVN types) -->
          <div v-if="kycData.id_type !== 'NIGERIAN_BVN_VERIFICATION'" class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-slate-500">ID Number</label>
            <input v-model="kycData.id_no" type="text" placeholder="ID number" class="w-full h-14 bg-slate-50 dark:bg-white/5 rounded-2xl px-5 text-sm font-semibold text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-emerald-500/30 outline-none transition" />
          </div>

          <!-- Selfie Image URL -->
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-slate-500">Selfie Image URL</label>
            <input v-model="kycData.selfie_image" type="url" placeholder="https://..." class="w-full h-14 bg-slate-50 dark:bg-white/5 rounded-2xl px-5 text-sm font-semibold text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-emerald-500/30 outline-none transition" />
            <p class="text-[10px] text-slate-400">Upload your selfie to a CDN and paste the URL here</p>
          </div>

          <!-- Error -->
          <div v-if="errorMessage" class="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-semibold">
            {{ errorMessage }}
          </div>

          <button
            @click="submitKyc"
            :disabled="isProcessing || !kycData.bvn || !kycData.address || !kycData.city || !kycData.postal_code || !kycData.house_no || !kycData.selfie_image"
            class="w-full h-16 bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-widest rounded-[1.25rem] shadow-xl shadow-emerald-500/30 active:scale-95 transition-all"
          >
            <span v-if="isProcessing" class="flex items-center justify-center gap-2">
              <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"/><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" class="opacity-75"/></svg>
              Verifying...
            </span>
            <span v-else>Verify Identity →</span>
          </button>
        </div>
      </div>

      <!-- ── Step 3: PIN + Funding ─────────────────────────────────────────── -->
      <div v-if="step === 3" class="space-y-4 animate-in fade-in duration-500">
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-xl border border-slate-100 dark:border-white/5 space-y-5">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center text-2xl">🔐</div>
            <div>
              <h3 class="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Set Card PIN & Fund</h3>
              <p class="text-[10px] text-slate-400">Choose a 4-digit PIN and initial funding</p>
            </div>
          </div>

          <!-- PIN -->
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-slate-500">4-Digit Card PIN</label>
            <input v-model="pin" type="password" maxlength="4" pattern="\d{4}" placeholder="••••" class="w-full h-14 bg-slate-50 dark:bg-white/5 rounded-2xl px-5 text-2xl font-black text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-emerald-500/30 outline-none transition tracking-[0.5em] text-center" />
          </div>

          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-slate-500">Confirm PIN</label>
            <input v-model="pinConfirmation" type="password" maxlength="4" pattern="\d{4}" placeholder="••••" class="w-full h-14 bg-slate-50 dark:bg-white/5 rounded-2xl px-5 text-2xl font-black text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-emerald-500/30 outline-none transition tracking-[0.5em] text-center" />
          </div>

          <!-- Funding Amount -->
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase tracking-widest text-slate-500">Initial Funding (₦ NGN)</label>
            <div class="relative">
              <span class="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-black text-slate-400">₦</span>
              <input v-model="fundingAmount" type="number" :placeholder="`Min ₦${minFundingNgn.toLocaleString()}`" class="w-full h-16 bg-slate-50 dark:bg-white/5 rounded-2xl pl-12 pr-6 text-xl font-black text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 focus:ring-2 focus:ring-emerald-500/30 outline-none transition" />
            </div>
            <div v-if="parseFloat(fundingAmount) > 0" class="flex items-center justify-between px-2 text-[11px] font-semibold text-slate-400">
              <span>≈ ${{ convertedUsd }} USD</span>
              <span class="text-emerald-500">{{ fxRateDisplay }}</span>
            </div>
          </div>

          <!-- Error -->
          <div v-if="errorMessage" class="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-semibold">
            {{ errorMessage }}
          </div>

          <button
            @click="submitCard"
            :disabled="!pin || pin.length < 4 || !fundingAmount || parseFloat(fundingAmount) < minFundingNgn"
            class="w-full h-16 bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-widest rounded-[1.25rem] shadow-xl shadow-emerald-500/30 active:scale-95 transition-all"
          >
            Review →
          </button>
        </div>
      </div>

      <!-- ── Step 4: Review ───────────────────────────────────────────────── -->
      <div v-if="step === 4" class="space-y-4 animate-in fade-in duration-500">
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 shadow-xl border border-slate-100 dark:border-white/5 space-y-5">
          <h3 class="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Review & Confirm</h3>

          <div class="space-y-3">
            <div class="flex justify-between py-3 border-b border-slate-100 dark:border-white/5">
              <span class="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">Card Type</span>
              <span class="text-sm font-black text-slate-800 dark:text-white">USD Mastercard (Virtual)</span>
            </div>
            <div class="flex justify-between py-3 border-b border-slate-100 dark:border-white/5">
              <span class="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">Limit</span>
              <span class="text-sm font-black text-slate-800 dark:text-white">{{ selectedLimit === 500000 ? '$5,000' : '$10,000' }}</span>
            </div>
            <div class="flex justify-between py-3 border-b border-slate-100 dark:border-white/5">
              <span class="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">Funding</span>
              <span class="text-sm font-black text-slate-800 dark:text-white">₦{{ parseFloat(fundingAmount).toLocaleString() }} ≈ ${{ convertedUsd }}</span>
            </div>
            <div class="flex justify-between py-3">
              <span class="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">FX Rate</span>
              <span class="text-sm font-black text-emerald-500">{{ fxRateDisplay }}</span>
            </div>
          </div>

          <div class="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-600 dark:text-amber-400 text-[11px] font-semibold leading-relaxed">
            ₦{{ parseFloat(fundingAmount).toLocaleString() }} will be debited from your NGN wallet. Card number, CVV and expiry are revealed only from the Cards page.
          </div>

          <!-- Error -->
          <div v-if="errorMessage" class="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-semibold">
            {{ errorMessage }}
          </div>

          <button
            @click="confirmCreate"
            :disabled="isProcessing"
            class="w-full h-16 bg-emerald-500 disabled:opacity-50 text-white text-xs font-black uppercase tracking-widest rounded-[1.25rem] shadow-xl shadow-emerald-500/30 active:scale-95 transition-all"
          >
            <span v-if="isProcessing" class="flex items-center justify-center gap-2">
              <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"/><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" class="opacity-75"/></svg>
              Creating Card...
            </span>
            <span v-else>Confirm & Create Card →</span>
          </button>
        </div>
      </div>

      <!-- ── Step 5: Success ──────────────────────────────────────────────── -->
      <div v-if="step === 5" class="space-y-6 animate-in fade-in duration-700">
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-xl border border-slate-100 dark:border-white/5 space-y-6 text-center">
          <div class="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center text-5xl mx-auto animate-bounce">💳</div>
          <div class="space-y-2">
            <h3 class="text-2xl font-black text-slate-800 dark:text-white">Card Created!</h3>
            <p class="text-sm text-slate-400">Your virtual USD Mastercard is ready. Use it anywhere Mastercard is accepted online.</p>
          </div>
          <button @click="goToCards" class="w-full h-16 bg-emerald-500 text-white text-xs font-black uppercase tracking-widest rounded-[1.25rem] shadow-xl shadow-emerald-500/30 active:scale-95 transition-all">
            View My Cards →
          </button>
        </div>
      </div>

    </div>
  </AppShell>
</template>

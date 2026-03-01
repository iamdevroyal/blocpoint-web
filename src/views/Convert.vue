<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../components/layout/AppShell.vue'
import { useWalletStore, currencyMeta } from '../stores/wallet'

const router      = useRouter()
const walletStore = useWalletStore()

// ─── State ────────────────────────────────────────────────────────────────────

const step         = ref(1)   // 1 = input, 2 = PIN confirm
const fromAmount   = ref('')
const isQuoting    = ref(false)
const isConverting = ref(false)
const quoteError   = ref(null)
const convertError = ref(null)
const success      = ref(false)
const pin          = ref(['', '', '', ''])
const pinInputs    = ref([])

/** Live quote from GET /conversions/quote */
const quote = ref(null)

/** Countdown until quote expires (seconds) */
const quoteCountdown = ref(0)
let countdownTimer = null

// ─── Wallet selection ─────────────────────────────────────────────────────────

const wallets = computed(() => walletStore.enrichedWallets)

/**
 * "From" wallet: defaults to the active wallet (whichever card is selected).
 * Users can switch it from a dropdown inside the page.
 */
const fromCurrency = ref(walletStore.activeWallet?.currency ?? 'NGN')

/**
 * "To" wallet: agent's other wallets (excludes the fromCurrency).
 */
const toWallets = computed(() =>
  wallets.value.filter((w) => w.currency !== fromCurrency.value)
)

const toCurrency = ref(toWallets.value[0]?.currency ?? '')

// Keep toCurrency valid if fromCurrency changes
watch(fromCurrency, () => {
  if (toCurrency.value === fromCurrency.value) {
    toCurrency.value = toWallets.value[0]?.currency ?? ''
  }
  resetQuote()
})

const fromWallet = computed(() => wallets.value.find((w) => w.currency === fromCurrency.value))
const toWallet   = computed(() => wallets.value.find((w) => w.currency === toCurrency.value))
const fromMeta   = computed(() => currencyMeta(fromCurrency.value))
const toMeta     = computed(() => currencyMeta(toCurrency.value))

/**
 * True when the quote's server-calculated total_debit exceeds the source wallet balance.
 * Only activates once the backend returns a quote — no client-side fee estimation.
 * The backend is the single source of truth for all financial calculations.
 */
const balanceInsufficient = computed(() => {
  if (!quote.value) return false  // no quote yet → no warning
  const avail = parseFloat(fromWallet.value?.available_balance ?? 0)
  return avail < parseFloat(quote.value.total_debit)
})

// ─── Quote logic ──────────────────────────────────────────────────────────────

const resetQuote = () => {
  quote.value = null
  quoteCountdown.value = 0
  clearInterval(countdownTimer)
}

const startCountdown = (seconds = 30) => {
  quoteCountdown.value = seconds
  clearInterval(countdownTimer)
  countdownTimer = setInterval(() => {
    quoteCountdown.value--
    if (quoteCountdown.value <= 0) {
      clearInterval(countdownTimer)
      quote.value = null  // quote expired — user must re-fetch
    }
  }, 1000)
}

const fetchQuote = async () => {
  const amt = parseFloat(fromAmount.value)
  if (!amt || amt <= 0 || !toCurrency.value) return
  if (!fromCurrency.value || fromCurrency.value === toCurrency.value) return

  isQuoting.value  = true
  quoteError.value = null
  resetQuote()

  const result = await walletStore.getConversionQuote(
    fromCurrency.value,
    toCurrency.value,
    amt
  )

  isQuoting.value = false

  if (result.error) {
    quoteError.value = result.error
  } else {
    quote.value = result.quote
    startCountdown(30)
  }
}

// Auto-refresh quote when amount changes (debounced 600ms)
let debounceTimer = null
watch(fromAmount, () => {
  resetQuote()
  clearTimeout(debounceTimer)
  if (fromAmount.value && parseFloat(fromAmount.value) > 0) {
    debounceTimer = setTimeout(fetchQuote, 600)
  }
})

watch(toCurrency, () => {
  resetQuote()
  if (fromAmount.value && parseFloat(fromAmount.value) > 0) {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(fetchQuote, 300)
  }
})

onUnmounted(() => {
  clearInterval(countdownTimer)
  clearTimeout(debounceTimer)
})

// ─── Step navigation ──────────────────────────────────────────────────────────

const handleContinue = () => {
  if (!quote.value) return
  if (!fromAmount.value || parseFloat(fromAmount.value) <= 0) return
  if (balanceInsufficient.value) return   // guard: cannot proceed with insufficient funds
  step.value = 2
  pin.value  = ['', '', '', '']
  convertError.value = null
}

const goBack = () => {
  if (step.value === 2) {
    step.value = 1
    return
  }
  router.back()
}

// ─── PIN input ────────────────────────────────────────────────────────────────

const handlePinInput = (index, event) => {
  const char = event.target.value.slice(-1)
  if (char && /^\d$/.test(char)) {
    pin.value[index] = char
    if (index < 3) pinInputs.value[index + 1]?.focus()
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

const pinComplete = computed(() => pin.value.every((d) => d !== ''))

// ─── Execute conversion ────────────────────────────────────────────────────────

const executeConversion = async () => {
  if (!pinComplete.value) return
  convertError.value = null
  isConverting.value = true

  const result = await walletStore.executeConversion({
    from_currency: fromCurrency.value,
    to_currency:   toCurrency.value,
    amount:        parseFloat(fromAmount.value),
    pin:           pin.value.join(''),
  })

  isConverting.value = false

  if (result.error) {
    convertError.value = result.error
  } else {
    success.value = true
    clearInterval(countdownTimer)
  }
}

// ─── Swap currencies ──────────────────────────────────────────────────────────

const swapCurrencies = () => {
  const temp = fromCurrency.value
  fromCurrency.value = toCurrency.value
  toCurrency.value   = temp
  fromAmount.value   = ''
  resetQuote()
}
</script>

<template>
  <AppShell title="Convert Currency">
    <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">

      <!-- Header -->
      <div class="flex items-center gap-4 px-2">
        <button @click="goBack" class="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm active:scale-90 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div>
          <h2 class="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-tight">
            {{ step === 1 ? 'Currency Exchange' : 'Confirm Order' }}
          </h2>
          <p class="text-[10px] font-bold text-primary uppercase tracking-widest">
            {{ step === 1 ? 'Convert between your wallets' : 'Enter PIN to finalise' }}
          </p>
        </div>
      </div>

      <!-- ── Step 1: Exchange UI ─────────────────────────────────────────────── -->
      <div v-if="step === 1" class="px-2 space-y-6">

        <!-- You Send -->
        <div class="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] shadow-sm space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">You Send</span>
            <span class="text-[10px] font-bold text-slate-400">
              Balance: {{ fromMeta.symbol }}{{ Number(fromWallet?.available_balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
            </span>
          </div>
          <div class="flex items-center gap-3">
            <!-- From currency dropdown (only agent's wallets) -->
            <div class="relative w-[110px] shrink-0">
              <select v-model="fromCurrency" class="w-full bg-slate-50 dark:bg-white/10 border border-slate-100 dark:border-white/5 rounded-2xl px-3 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 appearance-none text-slate-900 dark:text-white cursor-pointer">
                <option v-for="w in wallets" :key="w.currency" :value="w.currency" class="bg-white dark:bg-slate-900">
                  {{ w.flag }} {{ w.currency }}
                </option>
              </select>
              <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
            <!-- Amount input — min-w-0 + overflow-hidden prevents it shooting out of the card -->
            <div class="flex-1 min-w-0 overflow-hidden">
              <input
                v-model="fromAmount"
                type="text"
                inputmode="decimal"
                placeholder="0.00"
                class="w-full text-right text-2xl font-bold bg-transparent border-0 outline-none p-0 focus:ring-0 placeholder:text-slate-300 dark:placeholder:text-white/10 text-slate-900 dark:text-white"
                @input="fromAmount = $event.target.value.replace(/[^\d.]/g, '')"
              />
            </div>
          </div>
        </div>

        <!-- Swap Button -->
        <div class="flex justify-center -my-8 relative z-10">
          <button @click="swapCurrencies" class="w-12 h-12 bg-primary text-white rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-center active:rotate-180 transition-transform duration-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16V4m0 0L3 8m4-4 4 4"/><path d="M17 8v12m0 0 4-4m-4 4-4-4"/></svg>
          </button>
        </div>

        <!-- You Receive -->
        <div class="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] shadow-sm space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">You Receive</span>
            <span v-if="quoteCountdown > 0" class="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
              Rate expires in {{ quoteCountdown }}s
            </span>
            <span v-else class="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Est. instant</span>
          </div>
          <div class="flex items-center gap-3">
            <!-- To currency dropdown (only agent's OTHER wallets) -->
            <div class="relative w-[110px] shrink-0">
              <select v-model="toCurrency" class="w-full bg-slate-50 dark:bg-white/10 border border-slate-100 dark:border-white/5 rounded-2xl px-3 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 appearance-none text-slate-900 dark:text-white cursor-pointer">
                <option v-for="w in toWallets" :key="w.currency" :value="w.currency" class="bg-white dark:bg-slate-900">
                  {{ w.flag }} {{ w.currency }}
                </option>
              </select>
              <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>

            <!-- Quote output -->
            <div class="flex-1 min-w-0 overflow-hidden text-right">
              <p v-if="isQuoting" class="text-2xl font-bold text-slate-300 dark:text-white/20 animate-pulse">…</p>
              <p v-else-if="quote" class="text-2xl font-bold text-emerald-500 truncate">
                {{ Number(quote.to_amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
              </p>
              <p v-else class="text-2xl font-bold text-slate-300 dark:text-white/20">0.00</p>
            </div>
          </div>
        </div>


        <!-- Balance insufficient warning -->
        <div v-if="balanceInsufficient && fromAmount" class="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" class="text-red-500 shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/></svg>
          <p class="text-[11px] font-bold text-red-500">
            Insufficient balance.
            <span v-if="quote">You need {{ fromMeta.symbol }}{{ Number(quote.total_debit).toLocaleString('en-US', { minimumFractionDigits: 2 }) }} (incl. {{ fromMeta.symbol }}{{ Number(quote.fee).toLocaleString('en-US', { minimumFractionDigits: 2 }) }} fee) but only have {{ fromMeta.symbol }}{{ Number(fromWallet?.available_balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}.</span>
          </p>
        </div>

        <!-- Rate & Fee Summary -->
        <div class="bg-slate-100/50 dark:bg-white/5 rounded-3xl p-5 space-y-3 transition-all duration-300">
          <div v-if="quote" class="space-y-3">
            <div class="flex justify-between text-[11px] font-bold">
              <span class="text-slate-400 uppercase tracking-wider">Exchange Rate</span>
              <span class="text-slate-800 dark:text-white">
                1 {{ fromCurrency }} = {{ Number(quote.rate).toFixed(6) }} {{ toCurrency }}
              </span>
            </div>
            <div class="flex justify-between text-[11px] font-bold">
              <span class="text-slate-400 uppercase tracking-wider">Fee (0.5%)</span>
              <span class="text-slate-800 dark:text-white">
                {{ fromMeta.symbol }}{{ Number(quote.fee).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
              </span>
            </div>
            <div class="flex justify-between text-[11px] font-bold">
              <span class="text-slate-400 uppercase tracking-wider">Converted</span>
              <span class="text-slate-800 dark:text-white">
                {{ fromMeta.symbol }}{{ Number(quote.from_amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
              </span>
            </div>
            <div class="flex justify-between text-[11px] font-bold border-t border-slate-200 dark:border-white/10 pt-3">
              <span class="text-slate-400 uppercase tracking-wider">Total Deducted</span>
              <span class="text-primary font-extrabold">
                {{ fromMeta.symbol }}{{ Number(quote.total_debit).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
              </span>
            </div>
          </div>
          <div v-else class="text-center text-[11px] text-slate-400 font-bold uppercase tracking-widest">
            {{ isQuoting ? 'Fetching live rate…' : 'Enter an amount to see the rate' }}
          </div>
        </div>

        <!-- Error -->
        <p v-if="quoteError" class="text-[11px] text-red-500 font-bold text-center px-4">{{ quoteError }}</p>

        <!-- Continue CTA -->
        <button
          @click="handleContinue"
          :disabled="!quote || isQuoting || balanceInsufficient"
          class="w-full h-16 text-white text-xs font-bold rounded-3xl shadow-xl active:scale-95 transition-all uppercase tracking-widest"
          :class="quote && !isQuoting && !balanceInsufficient ? 'bg-primary shadow-primary/30' : 'bg-slate-300 dark:bg-white/10 cursor-not-allowed'"
        >
          {{ isQuoting ? 'Fetching Rate…' : balanceInsufficient ? 'Insufficient Balance' : 'Confirm Quote →' }}
        </button>
      </div>

      <!-- ── Step 2: PIN Confirmation ────────────────────────────────────────── -->
      <div v-else-if="step === 2 && !success" class="px-2 space-y-10">

        <!-- Summary card -->
        <div class="mx-auto max-w-xs p-6 bg-slate-900 rounded-[2rem] border border-white/10 shadow-2xl space-y-6">
          <div class="flex justify-center items-center gap-6">
            <div class="text-center">
              <p class="text-2xl font-bold text-white">{{ fromMeta.symbol }}{{ Number(fromAmount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</p>
              <p class="text-[9px] font-bold text-white/50 uppercase mt-1">{{ fromCurrency }}</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-primary shrink-0"><path d="m9 18 6-6-6-6"/></svg>
            <div class="text-center">
              <p class="text-2xl font-bold text-emerald-400">{{ toMeta.symbol }}{{ Number(quote?.to_amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</p>
              <p class="text-[9px] font-bold text-white/50 uppercase mt-1">{{ toCurrency }}</p>
            </div>
          </div>
          <div class="space-y-1.5 border-t border-white/10 pt-4">
            <div class="flex justify-between text-[10px] text-white/50 font-bold">
              <span>Rate</span>
              <span>1 {{ fromCurrency }} = {{ Number(quote?.rate ?? 0).toFixed(4) }} {{ toCurrency }}</span>
            </div>
            <div class="flex justify-between text-[10px] text-white/50 font-bold">
              <span>Fee</span>
              <span>{{ fromMeta.symbol }}{{ Number(quote?.fee ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
            </div>
          </div>
        </div>

        <div class="text-center space-y-2">
          <h3 class="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-tight">Authorise Swap</h3>
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
            @keydown="handleBackspace(i, $event)"
          />
        </div>

        <!-- Error -->
        <p v-if="convertError" class="text-[11px] text-red-500 font-bold text-center px-4">{{ convertError }}</p>

        <button
          @click="executeConversion"
          :disabled="!pinComplete || isConverting"
          class="w-full h-16 text-white text-xs font-bold rounded-3xl active:scale-95 transition-all uppercase tracking-widest"
          :class="pinComplete && !isConverting ? 'bg-primary shadow-xl shadow-primary/30' : 'bg-slate-300 dark:bg-white/10 cursor-not-allowed'"
        >
          {{ isConverting ? 'Processing…' : 'Finalise Conversion' }}
        </button>
      </div>

      <!-- ── Success ─────────────────────────────────────────────────────────── -->
      <div v-else-if="success" class="flex flex-col items-center justify-center gap-8 py-16 px-2">
        <div class="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500"><path d="M20 6 9 17l-5-5"/></svg>
        </div>
        <div class="text-center space-y-2">
          <h3 class="text-2xl font-bold text-slate-800 dark:text-white uppercase tracking-tight">Conversion Successful</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400">
            {{ fromMeta.symbol }}{{ Number(fromAmount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }} {{ fromCurrency }}
            → {{ toMeta.symbol }}{{ Number(quote?.to_amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }} {{ toCurrency }}
          </p>
          <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Your wallets have been updated</p>
        </div>
        <button @click="router.push('/app/wallet')" class="w-full h-14 bg-primary text-white text-xs font-bold rounded-3xl shadow-xl shadow-primary/30 active:scale-95 transition-all uppercase tracking-widest">
          Back to Wallets
        </button>
      </div>

    </div>
  </AppShell>
</template>

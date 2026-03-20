<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUIStore }  from '../stores/ui'
import { useAuthStore } from '../stores/auth'
import { normalizePhone } from '../utils/phone'
import { getDeviceId, clearDeviceId } from '../utils/device'

const router    = useRouter()
const uiStore   = useUIStore()
const authStore = useAuthStore()

const phone    = ref('')
const pin      = ref('')
const rememberMe = ref(false)
const isLoading  = ref(false)
const isBiometricScanning = ref(false)
const showPin = ref(false)

/** Validation and API errors */
const errors = ref({})

/**
 * When a device_id already exists in localStorage the user is a returning
 * agent. We switch to quick-login mode: hide the phone field, use only PIN.
 * The user can still tap "Use different account" to force the full login form.
 */
const isQuickLoginMode = ref(false)

/** Session-expiry / success banner — set from query params on mount */
const bannerMessage = ref(null)   // non-null = show banner
const bannerType    = ref('info') // 'info' | 'success'

onMounted(() => {
  const deviceId = getDeviceId()

  // Quick-login mode activates whenever this browser/device has a stored device_id
  // AND a stored user identity.
  const user = localStorage.getItem('bp_user')
  if (deviceId && user) {
    isQuickLoginMode.value = true
  }

  // Handle ?expired=1 — token expired (not an explicit logout)
  // Show an informational banner without putting user into full-login mode.
  const params = new URLSearchParams(window.location.search)
  if (params.get('expired') === '1') {
    bannerMessage.value = 'Your session expired. Enter your PIN to continue.'
    bannerType.value    = 'info'
    // Clean the URL so a page refresh doesn't re-show the banner
    history.replaceState(null, '', '/auth/login')
  }

  // Handle ?reset=1 — forgot-PIN flow succeeded
  if (params.get('reset') === '1') {
    bannerMessage.value = 'PIN reset successfully! Log in with your new PIN.'
    bannerType.value    = 'success'
    history.replaceState(null, '', '/auth/login')
  }
})

// ─── Input helpers ────────────────────────────────────────────────────────────

const handlePhoneInput = (event) => {
  phone.value = event.target.value.replace(/\D/g, '')
}

const handlePinInput = (event) => {
  pin.value = event.target.value.replace(/\D/g, '')
}

/**
 * Auto-submit when the 4th digit is entered.
 * This provides a premium, frictionless feel for unlocking.
 * We restrict this to quick-login mode to prevent browsers from
 * auto-filling the PIN and triggering an unwanted auto-login loop after logout.
 */
watch(pin, (newPin) => {
  if (isQuickLoginMode.value && newPin.length === 4 && !isLoading.value) {
    handleFormSubmit()
  }
})


// ─── Error helpers ────────────────────────────────────────────────────────────

/**
 * Extract a flat error map from an AxiosError.
 *
 * @param {import('axios').AxiosError} err
 * @returns {object}
 */
function extractErrors(err) {
  const res = err?.response?.data
  
  if (res && typeof res === 'object' && res.errors) {
    const flat = {}
    for (const [field, messages] of Object.entries(res.errors)) {
      flat[field] = Array.isArray(messages) ? messages[0] : messages
    }
    return flat
  }
  
  if (res && typeof res === 'object' && res.message) {
      return { general: res.message }
  }

  if (err.message === 'Network Error') {
      return { general: 'Unable to connect. Please check your internet connection and try again.' }
  }


  console.error('[Auth] Extraction failed for error:', err)
  return { general: 'Communication error. Please verify your connection or try again.' }
}

const firstError = ref(null)

function setErrors(errObj) {
  errors.value = errObj
  firstError.value = Object.values(errObj)[0] || null
}

// ─── Full Login ───────────────────────────────────────────────────────────────

/**
 * Standard login flow — phone + PIN on a full login form.
 * Used on first login or after explicit logout / device reset.
 */
const handleLogin = async () => {
  errors.value = {}
  firstError.value = null
  isLoading.value = true
  try {
    await authStore.login({
      phone: normalizePhone(phone.value),
      pin:   pin.value,
    })
    router.push('/app/dashboard')
  } catch (err) {
    // If 422 and message is "Device not recognized" → shouldn't happen here
    // since full login doesn't use quick-login endpoint, but guard anyway.
    setErrors(extractErrors(err))
  } finally {
    isLoading.value = false
  }
}

// ─── Quick Login ──────────────────────────────────────────────────────────────

/**
 * Quick-login — PIN only, device_id identifies the agent.
 * Used when returning to the app after session expiry on a known device.
 */
const handleQuickLogin = async () => {
  errors.value = {}
  firstError.value = null
  isLoading.value = true
  try {
    await authStore.quickLogin(pin.value)
    router.push('/app/dashboard')
  } catch (err) {
    const status = err?.response?.status
    const message = err?.response?.data?.message || ''

    // Device not recognized (e.g. after reinstall or DB reset) → fall back to full login
    const isUnrecognizedDevice = 
      message.toLowerCase().includes('device not recognized') ||
      err?.response?.data?.errors?.device_id?.[0]?.toLowerCase().includes('device not recognized');

    if (status === 422 && isUnrecognizedDevice) {
      clearDeviceId()
      isQuickLoginMode.value = false
      errors.value = {}
      firstError.value = 'Session expired. Please log in with your phone and PIN.'
    } else {
      setErrors(extractErrors(err))
    }
  } finally {
    isLoading.value = false
  }
}

/** Main form submit — dispatches to quick or full login based on mode. */
const handleFormSubmit = async () => {
  if (!navigator.onLine) {
    isLoading.value = true
    errors.value = {}
    firstError.value = null
    try {
      await authStore.offlineUnlock(pin.value)
      router.push('/app/dashboard')
    } catch (err) {
      firstError.value = err.message
    } finally {
      isLoading.value = false
    }
    return
  }

  console.log('[Auth] Submitting login form. QuickLogin:', isQuickLoginMode.value)

  if (isQuickLoginMode.value) {
    await handleQuickLogin()
  } else {
    await handleLogin()
  }
}

/** Switch back to full login (e.g. "Use different account"). */
const switchToFullLogin = () => {
  isQuickLoginMode.value = false
  errors.value = {}
  firstError.value = null
  pin.value = ''
}

// ─── Biometric Login ──────────────────────────────────────────────────────────

/**
 * Biometric login — uses quick-login endpoint.
 *
 * On a web PWA there is no true hardware biometric gate, so biometric is
 * treated as a UX shortcut: the scanning overlay displays while we call
 * quick-login with the PIN the user already entered.
 *
 * Future: integrate WebAuthn / Credential Management API to retrieve PIN
 * from device secure enclave without user typing it.
 */
const handleBiometricLogin = async () => {
  if (!pin.value) {
    firstError.value = 'Please enter your PIN first, then tap the biometric button.'
    return
  }

  if (!navigator.onLine) {
    isBiometricScanning.value = true
    errors.value = {}
    firstError.value = null
    try {
      // Simulate scanning for a moment for UX
      await new Promise(r => setTimeout(r, 800))
      await authStore.offlineUnlock(pin.value)
      router.push('/app/dashboard')
    } catch (err) {
      firstError.value = err.message
    } finally {
      isBiometricScanning.value = false
    }
    return
  }

  isBiometricScanning.value = true
  errors.value = {}
  firstError.value = null
  try {
    await authStore.quickLogin(pin.value)
    router.push('/app/dashboard')
  } catch (err) {
    const status  = err?.response?.status
    const message = err?.response?.data?.message || ''

    if (status === 422 && message.toLowerCase().includes('device not recognized')) {
      clearDeviceId()
      isQuickLoginMode.value = false
      firstError.value = 'Device not recognized. Please log in with your phone and PIN.'
    } else {
      setErrors(extractErrors(err))
    }
  } finally {
    isBiometricScanning.value = false
  }
}
</script>

<template>
  <div class="min-h-[100dvh] flex flex-col transition-colors duration-500 bg-slate-50 dark:bg-dark text-slate-900 dark:text-white relative overflow-hidden">
    
    <!-- Biometric Scanning Overlay -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 backdrop-blur-0"
      enter-to-class="opacity-100 backdrop-blur-xl"
      leave-active-class="transition duration-300 ease-in"
      leave-from-class="opacity-100 backdrop-blur-xl"
      leave-to-class="opacity-0 backdrop-blur-0"
    >
      <div v-if="isBiometricScanning" class="fixed inset-0 z-50 bg-black/40 flex flex-col items-center justify-center p-6 text-center">
        <div class="relative w-24 h-24 mb-6">
          <div class="absolute inset-0 border-4 border-primary rounded-[2rem] animate-ping opacity-20"></div>
          <div class="w-full h-full bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-primary/50 flex items-center justify-center shadow-2xl relative overflow-hidden">
            <img src="/biometric.png" alt="Biometric" class="w-12 h-12 object-contain animate-pulse" />
            <!-- Scanning Line -->
            <div class="absolute top-0 left-0 right-0 h-1 bg-primary shadow-lg shadow-primary/80 animate-[scan_2s_infinite]"></div>
          </div>
        </div>
        <div class="space-y-2">
          <h3 class="text-white text-xl font-black">Biometric Check</h3>
          <p class="text-white/70 text-[10px] font-bold uppercase tracking-widest">Verifying identity...</p>
        </div>
      </div>
    </Transition>
    
    <!-- Background Decorators -->
    <div class="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-primary/5 to-transparent dark:from-primary/10 z-0 pointer-events-none"></div>
    <div class="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 dark:bg-primary/20 rounded-full blur-3xl z-0 pointer-events-none"></div>

    <!-- Top Area: Logo & Theme Toggle -->
    <header class="w-full max-w-lg mx-auto flex items-center justify-between p-6 relative z-20">
      <div class="flex items-center gap-2">
        <img v-if="uiStore.isDark" src="/blocpoint-white.png" alt="Blocpoint" class="h-6 auto block" />
        <img v-else src="/blocpoint-white.png" alt="Blocpoint" class="h-6 auto block filter invert opacity-90" />
      </div>

      <button 
        @click="uiStore.toggleTheme()" 
        class="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-slate-800/50 text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-white/5 shadow-sm active:scale-95 transition-all"
        aria-label="Toggle theme"
      >
        <svg v-if="uiStore.isDark" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
      </button>
    </header>

    <main class="flex-1 flex flex-col justify-center px-6 pb-6 relative z-10 -mt-10">
      <div class="w-full max-w-sm mx-auto">
        <!-- Heading -->
        <div class="mb-8 text-left">
          <template v-if="isQuickLoginMode">
            <h1 class="text-2xl font-extrabold tracking-tight">Welcome Back 👋</h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">
              {{ authStore.user?.first_name ? `Hi ${authStore.user.first_name}, enter your PIN` : 'Enter your PIN to continue' }}
            </p>
          </template>
          <template v-else>
            <h1 class="text-2xl font-extrabold tracking-tight">Welcome Back</h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">Login to your account</p>
          </template>
        </div>

        <div class="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-white dark:border-white/5 rounded-3xl p-7 shadow-2xl shadow-slate-200/50 dark:shadow-none transition-colors">
          
          <!-- Session-expiry / Success Banner (from query params) -->
          <Transition name="fade-error">
            <div
              v-if="bannerMessage"
              class="mb-5 px-4 py-3 rounded-2xl text-xs font-semibold flex items-start gap-3 border"
              :class="bannerType === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400'
                : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-400'"
            >
              <!-- Icon -->
              <span class="shrink-0 text-base">{{ bannerType === 'success' ? '✅' : '⏰' }}</span>
              <span>{{ bannerMessage }}</span>
              <button @click="bannerMessage = null" class="ml-auto shrink-0 opacity-60 hover:opacity-100">✕</button>
            </div>
          </Transition>

          <!-- Error Banner -->
          <Transition name="fade-error">
            <div
              v-if="firstError"
              class="mb-5 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-2xl text-red-600 dark:text-red-400 text-xs font-semibold"
            >
              {{ firstError }}
            </div>
          </Transition>

          <form @submit.prevent="handleFormSubmit" class="space-y-5">

            <!-- Phone field — hidden in quick-login mode -->
            <div v-if="!isQuickLoginMode" class="space-y-1.5">
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Phone Number</label>
              <input 
                v-model="phone"
                type="tel" 
                inputmode="numeric"
                pattern="[0-9]*"
                placeholder="08012345678"
                class="w-full px-5 py-3.5 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:placeholder:text-slate-600"
                :class="{ 'border-red-400 dark:border-red-600': errors.phone }"
                @input="handlePhoneInput"
                required
              />
              <p v-if="errors.phone" class="ml-1 text-[11px] text-red-500 font-medium">{{ errors.phone }}</p>
            </div>

            <div class="space-y-1.5">
              <div class="flex items-center justify-between px-1">
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Secure PIN</label>
                <router-link to="/auth/forgot-pin" class="text-xs font-bold text-primary hover:text-indigo-400 transition-colors">Forgot?</router-link>
              </div>
              <div class="relative group/pin">
                <input 
                  v-model="pin"
                  :type="showPin ? 'text' : 'password'" 
                  inputmode="numeric"
                  pattern="[0-9]*"
                  placeholder="••••"
                  maxlength="4"
                  class="w-full px-5 py-3.5 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-center text-xl tracking-[1em] dark:placeholder:text-slate-600"
                  :class="{ 'border-red-400 dark:border-red-600': errors.pin }"
                  @input="handlePinInput"
                  required
                />
                <button 
                  type="button"
                  @click="showPin = !showPin"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors focus:outline-none"
                  aria-label="Toggle PIN visibility"
                >
                  <svg v-if="!showPin" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                </button>
              </div>
              <p v-if="errors.pin" class="ml-1 text-[11px] text-red-500 font-medium">{{ errors.pin }}</p>
            </div>

            <div v-if="!isQuickLoginMode" class="flex items-center pt-1">
              <label class="flex items-center cursor-pointer group">
                <input type="checkbox" v-model="rememberMe" class="w-4 h-4 rounded border-slate-300 dark:border-white/10 text-primary focus:ring-primary dark:bg-slate-800 transition-all">
                <span class="ml-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors uppercase tracking-tight">Remember this device</span>
              </label>
            </div>

            <div class="flex gap-3 pt-2">
              <button 
                type="submit" 
                :disabled="isLoading || isBiometricScanning"
                class="flex-1 py-4 rounded-2xl bg-primary hover:bg-indigo-500 text-white font-bold text-lg shadow-lg shadow-primary/25 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <div v-if="isLoading" class="flex items-center justify-center gap-2">
                  <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Verifying...
                </div>
                <span v-else>{{ isQuickLoginMode ? 'Unlock' : 'Sign in' }}</span>
              </button>

              <button 
                v-if="uiStore.biometricsEnabled && isQuickLoginMode"
                type="button"
                @click="handleBiometricLogin"
                :disabled="isLoading || isBiometricScanning"
                class="w-16 h-[60px] rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-2xl shadow-inner active:scale-95 transition-all"
              >
                <img src="/biometric.png" alt="Biometric" class="w-7 h-7 object-contain opacity-80" />
              </button>
            </div>
          </form>

          <div class="mt-6 text-center space-y-2">
            <!-- Quick-login: option to switch account -->
            <p v-if="isQuickLoginMode" class="text-xs font-medium text-slate-500 dark:text-slate-400">
              Not you?
              <button @click="switchToFullLogin" class="text-primary font-bold hover:text-indigo-400 ml-1 underline underline-offset-4">Use a different account</button>
            </p>
            <!-- Full login: sign-up link -->
            <p v-else class="text-sm font-medium text-slate-500 dark:text-slate-400">
              New to Blocpoint? 
              <router-link to="/auth/register" class="text-primary font-bold hover:text-indigo-400 ml-1 underline underline-offset-4">Create Account</router-link>
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style>
@keyframes scan {
  0% { transform: translateY(0); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(96px); opacity: 0; }
}

.font-black { font-weight: 900; }
.tracking-tight { letter-spacing: -0.025em; }

.fade-error-enter-active,
.fade-error-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-error-enter-from,
.fade-error-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUIStore } from '../stores/ui'

const router = useRouter()
const uiStore = useUIStore()
const step = ref(1)
const isLoading = ref(false)

const form = ref({
  phone: '',
  otp: '',
  firstName: '',
  lastName: '',
  pin: '',
  pinConfirm: ''
})

const buttonText = computed(() => {
  if (isLoading.value) return 'Processing...'
  switch (step.value) {
    case 1: return 'Send Secure OTP'
    case 2: return 'Verify Identity'
    case 3: return 'Continue Profile'
    case 4: return 'Complete Registration'
    default: return 'Next Step'
  }
})

const handleRegister = async () => {
  isLoading.value = true
  
  // Simulate API calls
  setTimeout(() => {
    isLoading.value = false
    if (step.value < 4) {
      step.value++
    } else {
      router.push('/app/dashboard')
    }
  }, 1000)
}

const prevStep = () => {
  if (step.value > 1) step.value--
}
</script>

<template>
  <div class="min-h-[100dvh] flex flex-col transition-colors duration-500 bg-slate-50 dark:bg-dark text-slate-900 dark:text-white relative overflow-hidden">
    
    <!-- Background Decorators -->
    <div class="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-primary/5 to-transparent dark:from-primary/10 z-0 pointer-events-none"></div>
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 dark:bg-primary/20 rounded-full blur-3xl z-0 pointer-events-none"></div>

    <!-- Top Area: Logo & Theme Toggle -->
    <header class="w-full max-w-lg mx-auto flex items-center justify-between p-6 relative z-20">
      <div class="flex items-center gap-2">
        <img v-if="uiStore.isDark" src="/blocpoint-white.png" alt="BlocPoint" class="h-6 auto block" />
        <img v-else src="/blocpoint-white.png" alt="BlocPoint" class="h-6 auto block filter invert opacity-90" />
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

    <main class="flex-1 flex flex-col justify-center px-6 pb-6 relative z-10 -mt-8">
      <div class="w-full max-w-sm mx-auto">
        <!-- Step Indicator -->
        <div class="mb-6">
          <div class="flex items-center gap-1.5 justify-center sm:justify-start">
            <div v-for="i in 4" :key="i" 
              class="h-1 rounded-full transition-all duration-300"
              :class="[
                i < step ? 'w-4 bg-primary' : i === step ? 'w-8 bg-primary' : 'w-2 bg-slate-200 dark:bg-slate-800'
              ]"
            ></div>
          </div>
        </div>

        <div class="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-white dark:border-white/5 rounded-3xl p-7 shadow-2xl shadow-slate-200/50 dark:shadow-none transition-colors">
          <div class="mb-6">
            <h1 class="text-xl font-extrabold tracking-tight">
              {{ step === 1 ? 'Start with Phone' : step === 2 ? 'Verify Code' : step === 3 ? 'Basic Info' : 'Security PIN' }}
            </h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium text-xs mt-1">
              {{ step === 1 ? 'Join the BlocPoint network' : step === 2 ? `Sent to ${form.phone}` : step === 3 ? 'Tell us about yourself' : 'Secure your wallet with a PIN' }}
            </p>
          </div>

          <form @submit.prevent="handleRegister" class="space-y-5">
            <Transition name="fade" mode="out-in">
              <div :key="step" class="space-y-5">
                <!-- Step 1: Phone -->
                <div v-if="step === 1" class="space-y-1.5">
                  <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Phone Number</label>
                  <input 
                    v-model="form.phone"
                    type="tel" 
                    placeholder="+234..."
                    class="w-full px-5 py-3.5 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:placeholder:text-slate-600"
                    required
                  />
                </div>

                <!-- Step 2: OTP -->
                <div v-if="step === 2" class="space-y-1.5 text-center">
                  <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">6-Digit Code</label>
                  <input 
                    v-model="form.otp"
                    type="text" 
                    placeholder="000000"
                    maxlength="6"
                    class="w-full px-5 py-4 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-center text-2xl tracking-[0.5em] font-mono dark:placeholder:text-slate-600"
                    required
                  />
                  <button type="button" @click="step = 1" class="mt-3 text-[10px] font-bold text-primary uppercase tracking-wider hover:opacity-80">Change number</button>
                </div>

                <!-- Step 3: Profile -->
                <div v-if="step === 3" class="space-y-4">
                  <div class="space-y-1.5">
                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">First Name</label>
                    <input 
                      v-model="form.firstName"
                      type="text" 
                      placeholder="Enter first name"
                      class="w-full px-5 py-3.5 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                  <div class="space-y-1.5">
                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Last Name</label>
                    <input 
                      v-model="form.lastName"
                      type="text" 
                      placeholder="Enter last name"
                      class="w-full px-5 py-3.5 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <!-- Step 4: PIN -->
                <div v-if="step === 4" class="space-y-4">
                  <div class="space-y-1.5">
                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Transfer PIN</label>
                    <input 
                      v-model="form.pin"
                      type="password" 
                      placeholder="••••"
                      maxlength="4"
                      class="w-full px-5 py-3.5 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-center text-xl tracking-[1em]"
                      required
                    />
                  </div>
                  <div class="space-y-1.5">
                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Confirm PIN</label>
                    <input 
                      v-model="form.pinConfirm"
                      type="password" 
                      placeholder="••••"
                      maxlength="4"
                      class="w-full px-5 py-3.5 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-center text-xl tracking-[1em]"
                      required
                    />
                  </div>
                </div>
              </div>
            </Transition>

            <div class="flex items-center gap-3 pt-2">
              <button 
                v-if="step > 1"
                type="button"
                @click="prevStep"
                class="w-12 py-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-800/50 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-all active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <button 
                type="submit" 
                :disabled="isLoading"
                class="flex-1 py-4 rounded-2xl bg-primary hover:bg-indigo-500 text-white font-bold text-lg shadow-lg shadow-primary/25 transition-all active:scale-[0.98] disabled:opacity-70"
              >
                <div v-if="isLoading" class="flex items-center justify-center gap-2">
                  <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                </div>
                <span v-else>{{ buttonText }}</span>
              </button>
            </div>
          </form>

          <div class="mt-6 text-center">
            <p class="text-xs font-medium text-slate-500 dark:text-slate-400">
              Already have an account? 
              <router-link to="/auth/login" class="text-primary font-bold hover:text-indigo-400 ml-1 underline underline-offset-4">Log in here</router-link>
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>


<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>


<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../../components/layout/AppShell.vue'
import PinInput from '../../components/ui/PinInput.vue'

const router = useRouter()
const step = ref(1) // 1: Login PIN Auth, 2: New POS PIN, 3: Confirm
const authPin = ref('')
const newPosPin = ref('')
const confirmPosPin = ref('')
const error = ref('')

const title = computed(() => {
  if (step.value === 1) return 'Confirm Identity'
  if (step.value === 2) return 'Set New POS PIN'
  return 'Verify POS PIN'
})

const desc = computed(() => {
  if (step.value === 1) return 'Enter your Login PIN to authorize POS PIN reset'
  if (step.value === 2) return 'Create a 4-digit PIN for card & terminal transactions'
  return 'Re-enter your new POS PIN to ensure accuracy'
})

const handleComplete = (val) => {
  error.value = ''
  if (step.value === 1) {
    // Simulated verification of LOGIN pin
    if (val === '1234') {
      step.value = 2
      authPin.value = ''
    } else {
      error.value = 'Invalid Login PIN'
      authPin.value = ''
    }
  } else if (step.value === 2) {
    newPosPin.value = val
    step.value = 3
  } else if (step.value === 3) {
    if (val === newPosPin.value) {
      // Success
      alert('POS PIN reset successfully!')
      router.back()
    } else {
      error.value = 'PINs do not match'
      confirmPosPin.value = ''
    }
  }
}
</script>

<template>
  <AppShell title="Reset POS PIN">
    <div class="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 px-4 pt-8">
      
      <!-- Step Indicator -->
      <div class="flex justify-center gap-3">
        <div v-for="i in 3" :key="i" 
          class="h-1.5 rounded-full transition-all duration-500"
          :class="[
            i === step ? 'w-8 bg-primary shadow-lg shadow-primary/20' : 
            i < step ? 'w-4 bg-emerald-500' : 'w-4 bg-slate-200 dark:bg-white/10'
          ]"
        ></div>
      </div>

      <!-- Header Content -->
      <div class="text-center space-y-3">
        <div class="w-20 h-20 rounded-[2.5rem] bg-indigo-50 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-center text-3xl mx-auto shadow-sm">
          {{ step === 1 ? '👤' : step === 2 ? '💳' : '✅' }}
        </div>
        <div class="space-y-1 pt-2">
          <h2 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">{{ title }}</h2>
          <p class="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-relaxed max-w-[240px] mx-auto">{{ desc }}</p>
        </div>
      </div>

      <!-- PIN Input Area -->
      <div class="flex flex-col items-center">
        <PinInput 
          v-if="step === 1" 
          v-model="authPin" 
          @complete="handleComplete"
          label="Login PIN Required"
        />
        <PinInput 
          v-if="step === 2" 
          v-model="newPosPin" 
          @complete="handleComplete"
          label="New POS PIN"
        />
        <PinInput 
          v-if="step === 3" 
          v-model="confirmPosPin" 
          @complete="handleComplete"
          label="Confirm POS PIN"
        />

        <Transition name="fade">
          <p v-if="error" class="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-6 animate-bounce">{{ error }}</p>
        </Transition>
      </div>

      <!-- Tips -->
      <div class="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-black/5 dark:border-white/5 space-y-3">
        <div class="flex items-center gap-2">
          <span class="text-xs">💡</span>
          <h4 class="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest">Security Tip</h4>
        </div>
        <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 leading-relaxed uppercase tracking-widest">Your POS PIN should be different from your Login PIN for maximum security at physical terminals.</p>
      </div>

    </div>
  </AppShell>
</template>

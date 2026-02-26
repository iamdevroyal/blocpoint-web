<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUIStore } from '../../stores/ui'
import AppShell from '../../components/layout/AppShell.vue'
import PinInput from '../../components/ui/PinInput.vue'

const router = useRouter()
const step = ref(1) // 1: Old PIN, 2: New PIN, 3: Confirm
const oldPin = ref('')
const newPin = ref('')
const confirmPin = ref('')
const error = ref('')

const title = computed(() => {
  if (step.value === 1) return 'Verify Old PIN'
  if (step.value === 2) return 'Create New PIN'
  return 'Confirm New PIN'
})

const desc = computed(() => {
  if (step.value === 1) return 'Enter your current 4-digit security PIN to proceed'
  if (step.value === 2) return 'Set a new 4-digit security PIN for your account'
  return 'Re-enter your new PIN to verify it is correct'
})

const uiStore = useUIStore()

const handleComplete = (val) => {
  error.value = ''
  if (step.value === 1) {
    // Simulated verification
    if (val === '1234') {
      step.value = 2
      oldPin.value = '' // Clear for security though it's already in val
    } else {
      error.value = 'Incorrect current PIN'
      oldPin.value = ''
    }
  } else if (step.value === 2) {
    newPin.value = val
    step.value = 3
  } else if (step.value === 3) {
    if (val === newPin.value) {
      // Success - Use custom confirm modal
      uiStore.showConfirm({
        title: 'PIN Updated',
        message: 'Your security PIN has been successfully changed.',
        confirmText: 'Great!',
        onConfirm: () => {
          router.back()
        }
      })
    } else {
      error.value = 'PINs do not match'
      confirmPin.value = ''
    }
  }
}
</script>

<template>
  <AppShell title="Change Login PIN">
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
        <div class="w-20 h-20 rounded-[2.5rem] bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-center text-3xl mx-auto shadow-sm">
          {{ step === 1 ? '🔐' : step === 2 ? '🆕' : '✨' }}
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
          v-model="oldPin" 
          @complete="handleComplete"
          label=""
        />
        <PinInput 
          v-if="step === 2" 
          v-model="newPin" 
          @complete="handleComplete"
          label=""
        />
        <PinInput 
          v-if="step === 3" 
          v-model="confirmPin" 
          @complete="handleComplete"
          label=""
        />

        <Transition name="fade">
          <p v-if="error" class="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-6 animate-bounce">{{ error }}</p>
        </Transition>
      </div>

      <!-- Footer Info -->
      <div class="text-center">
        <p class="text-[9px] font-bold text-slate-400 uppercase tracking-tighter opacity-60">Never share your PIN with anyone, including BlocPoint staff.</p>
      </div>

    </div>
  </AppShell>
</template>

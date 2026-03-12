<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUIStore } from '../../stores/ui'
import AppShell from '../../components/layout/AppShell.vue'
import PinInput from '../../components/ui/PinInput.vue'
import { useSettingsStore } from '../../stores/settings'

const router   = useRouter()
const uiStore  = useUIStore()
const settings = useSettingsStore()

// 3-step flow: 1 = login PIN, 2 = new POS PIN, 3 = confirm it
const step          = ref(1)
const authPin       = ref('')
const newPosPin     = ref('')
const confirmPosPin = ref('')
const error         = ref('')

import { computed } from 'vue'

const title = computed(() => ['Confirm Identity', 'Set New POS PIN', 'Verify POS PIN'][step.value - 1])
const desc  = computed(() => [
  'Enter your Login PIN to authorize POS PIN reset',
  'Create a 4-digit PIN for card & terminal transactions',
  'Re-enter your new POS PIN to ensure accuracy',
][step.value - 1])

const handleComplete = async (val) => {
  error.value = ''

  if (step.value === 1) {
    authPin.value = val
    step.value = 2
    return
  }
  if (step.value === 2) {
    newPosPin.value = val
    step.value = 3
    return
  }

  // Step 3: confirm matches → submit via store
  if (val !== newPosPin.value) {
    error.value = 'PINs do not match'
    confirmPosPin.value = ''
    return
  }

  const result = await settings.resetPosPin({
    current_login_pin:        authPin.value,
    new_pos_pin:              newPosPin.value,
    new_pos_pin_confirmation: newPosPin.value,
  })

  if (result.success) {
    uiStore.showConfirm({
      title: 'POS PIN Reset',
      message: 'Your POS security PIN has been successfully updated.',
      confirmText: 'Great!',
      onConfirm: () => router.back(),
    })
  } else {
    error.value = result.error
    if (result.error?.toLowerCase().includes('pin')) {
      step.value = 1
      authPin.value = ''
    } else {
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
        <div v-for="i in 3" :key="i" class="h-1.5 rounded-full transition-all duration-500"
          :class="[i === step ? 'w-8 bg-primary shadow-lg shadow-primary/20' : i < step ? 'w-4 bg-emerald-500' : 'w-4 bg-slate-200 dark:bg-white/10']"
        ></div>
      </div>

      <!-- Header -->
      <div class="text-center space-y-3">
        <div class="w-20 h-20 rounded-[2.5rem] bg-indigo-50 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-center text-3xl mx-auto shadow-sm">
          {{ step === 1 ? '👤' : step === 2 ? '💳' : '✅' }}
        </div>
        <div class="space-y-1 pt-2">
          <h2 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">{{ title }}</h2>
          <p class="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-relaxed max-w-[240px] mx-auto">{{ desc }}</p>
        </div>
      </div>

      <!-- PIN Inputs -->
      <div class="flex flex-col items-center">
        <PinInput v-if="step === 1" v-model="authPin"       @complete="handleComplete" label="Login PIN Required"  :disabled="settings.isSaving" />
        <PinInput v-if="step === 2" v-model="newPosPin"     @complete="handleComplete" label="New POS PIN"         :disabled="settings.isSaving" />
        <PinInput v-if="step === 3" v-model="confirmPosPin" @complete="handleComplete" label="Confirm POS PIN"     :disabled="settings.isSaving" />

        <div v-if="settings.isSaving" class="flex items-center gap-2 mt-6">
          <svg class="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saving...</span>
        </div>

        <Transition name="fade">
          <p v-if="error" class="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-6 animate-bounce">{{ error }}</p>
        </Transition>
      </div>

      <!-- Security tip -->
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

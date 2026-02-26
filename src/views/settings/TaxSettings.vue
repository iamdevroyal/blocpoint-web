<script setup>
import { ref } from 'vue'
import AppShell from '../../components/layout/AppShell.vue'
import { useUIStore } from '../../stores/ui'

const ui = useUIStore()

const tin = ref('')
const autoRemittance = ref(false)
const isSaving = ref(false)

const handleTinInput = (e) => {
  // TIN is usually 10-12 digits, let's keep it numeric-only for now
  const val = e.target.value.replace(/\D/g, '')
  tin.value = val.slice(0, 12)
}

const saveTaxSettings = () => {
  isSaving.value = true
  // Simulate API call
  setTimeout(() => {
    isSaving.value = false
    ui.showToast('Tax compliance settings updated!', 'success')
  }, 1500)
}
</script>

<template>
  <AppShell title="Tax Compliance">
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 px-2">
      
      <!-- Tax ID Section -->
      <div class="space-y-4">
        <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Identification</h3>
        <div class="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-sm space-y-6">
          <div class="w-16 h-16 rounded-[1.5rem] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl shadow-inner">
            📝
          </div>
          
          <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tax Identification Number (TIN)</label>
            <input 
              type="text" 
              v-model="tin"
              @input="handleTinInput"
              inputmode="numeric"
              maxlength="12"
              placeholder="Enter your 10-12 digit TIN" 
              class="w-full h-14 bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl px-5 text-sm font-bold tracking-[0.2em] outline-none focus:border-primary transition-all dark:text-white" 
            />
          </div>
          <p class="text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-relaxed">Providing your TIN ensures full compliance with local regulatory requirements.</p>
        </div>
      </div>

      <!-- Automations Section -->
      <div class="space-y-4">
        <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Settings</h3>
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
          <div class="p-6 flex items-center justify-between group transition-colors">
            <div class="flex items-center gap-4">
              <div class="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xl shadow-inner">
                ⚡
              </div>
              <div class="space-y-0.5">
                <h4 class="text-sm font-bold text-slate-800 dark:text-white tracking-tight">Auto Remittance</h4>
                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Automatically deduct tax from transactions</p>
              </div>
            </div>
            
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="autoRemittance" class="sr-only peer">
              <div class="w-11 h-6 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary transition-all duration-300"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- Save Button -->
      <div class="px-2">
        <button 
          @click="saveTaxSettings"
          :disabled="isSaving"
          class="w-full h-16 bg-primary text-white text-xs font-black rounded-[2rem] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <span v-if="!isSaving">Save Compliance Settings</span>
          <template v-else>
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span>Saving...</span>
          </template>
        </button>
      </div>

      <!-- Info Banner -->
      <div class="p-6 bg-blue-500/5 border border-blue-500/10 rounded-[2.5rem] flex gap-4">
        <div class="text-xl">ℹ️</div>
        <p class="text-[10px] font-medium text-blue-500/70 uppercase tracking-widest leading-loose">
          BlocPoint partners with tax authorities to simplify your compliance. Auto-remittance helps you avoid end-of-year tax liabilities.
        </p>
      </div>

    </div>
  </AppShell>
</template>

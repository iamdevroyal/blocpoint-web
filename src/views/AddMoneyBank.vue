<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../components/layout/AppShell.vue'

const router = useRouter()
const copied = ref(false)

const accountDetails = {
  bank: 'Wema Bank',
  accountNumber: '7035148792',
  accountName: 'Njoku Royal / BlocPoint'
}

const copyToClipboard = () => {
  navigator.clipboard.writeText(accountDetails.accountNumber)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

const goBack = () => router.back()
</script>

<template>
  <AppShell title="Bank Transfer">
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <!-- Header -->
      <div class="flex items-center gap-4 px-2">
        <button @click="goBack" class="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm active:scale-90 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div>
          <h2 class="text-lg font-extrabold text-slate-800 dark:text-white uppercase tracking-tight">Virtual Account</h2>
          <p class="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Bank Transfer details</p>
        </div>
      </div>

      <!-- Account Info Card -->
      <div class="px-2">
        <div class="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-white dark:border-white/5 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 dark:shadow-none space-y-8 relative overflow-hidden group">
          <div class="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
          
          <div class="text-center space-y-2 relative z-10">
            <div class="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl mx-auto mb-4 border border-primary/5 shadow-inner">
              🏦
            </div>
            <h3 class="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Your Account Number</h3>
            <div class="flex items-center justify-center gap-3">
              <span class="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">{{ accountDetails.accountNumber }}</span>
              <button 
                @click="copyToClipboard"
                class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 active:scale-90 transition-all border border-black/5 dark:border-white/5"
              >
                <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500"><polyline points="20 6 9 17 4 12"/></svg>
              </button>
            </div>
            <Transition name="fade">
              <span v-if="copied" class="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block mt-2">Copied to clipboard</span>
            </Transition>
          </div>

          <div class="grid grid-cols-1 gap-6 pt-4 border-t border-slate-100 dark:border-white/5 relative z-10">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bank Name</span>
              <span class="text-xs font-extrabold text-slate-800 dark:text-white">{{ accountDetails.bank }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Beneficiary</span>
              <span class="text-xs font-extrabold text-slate-800 dark:text-white text-right">{{ accountDetails.accountName }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Instructions -->
      <div class="px-2 space-y-4">
        <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">How to fund</h3>
        <div class="space-y-3">
          <div class="p-5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-200/50 dark:border-white/5 flex gap-4">
            <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center font-black text-xs shrink-0">1</div>
            <p class="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">Copy the account number above or share it with others to receive funds.</p>
          </div>
          <div class="p-5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-200/50 dark:border-white/5 flex gap-4">
            <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center font-black text-xs shrink-0">2</div>
            <p class="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">Top-ups are usually instant but may take up to 5 minutes to reflect in your balance.</p>
          </div>
        </div>
      </div>
    </div>
  </AppShell>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: all 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(5px); }
</style>

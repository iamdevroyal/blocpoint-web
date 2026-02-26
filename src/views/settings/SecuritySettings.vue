<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../../components/layout/AppShell.vue'

const loginWithPin = ref(true)
const loginWithBiometrics = ref(false)
const transactionBiometrics = ref(true)
const showPinModal = ref(false)
const showPosPinModal = ref(false)

const router = useRouter()

const securityItems = [
  { id: 'pin', name: 'Change Login PIN', icon: '🔑', desc: 'Update your 4-digit access code', action: () => router.push('/app/settings/security/change-pin') },
  { id: 'pos_pin', name: 'Reset POS PIN', icon: '🛒', desc: 'Secure code for card transactions', action: () => router.push('/app/settings/security/reset-pos-pin') },
]

const loginMethods = [
  { id: 'use_pin', name: 'Standard PIN Access', icon: '🔢', toggle: loginWithPin },
  { id: 'use_bio', name: 'Biometric Access', icon: '✋', desc: 'FaceID or Fingerprint', toggle: loginWithBiometrics },
]

const transactionSettings = [
  { id: 'trans_bio', name: 'Transaction Biometrics', icon: '⚡', desc: 'Authorize payments faster', toggle: transactionBiometrics },
]
</script>

<template>
  <AppShell title="Security Settings">
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 px-2">
      
      <!-- Protection Summary -->
      <div class="p-8 bg-gradient-to-br from-emerald-600 to-emerald-900 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
        <div class="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
        <div class="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
        <div class="relative z-10 flex flex-col items-center text-center space-y-4">
          <div class="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-2xl shadow-inner">🛡️</div>
          <h2 class="text-xl font-bold text-white tracking-tight">Security Shield Active</h2>
          <p class="text-[10px] font-medium text-white/70 uppercase tracking-widest leading-relaxed">Your account is protected by multi-layer encryption and biometric verification.</p>
        </div>
      </div>

      <!-- General Security -->
      <div class="space-y-4">
        <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Standard Security</h3>
        <div class="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm">
          <button v-for="(item, idx) in securityItems" :key="item.id" 
            class="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group border-none"
            :class="{ 'border-b border-slate-100 dark:border-white/5': idx !== securityItems.length - 1 }"
            @click="item.action()"
          >
            <div class="flex items-center gap-4 text-left">
              <div class="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-xl border border-black/5 dark:border-white/5 group-hover:scale-110 transition-transform">
                {{ item.icon }}
              </div>
              <div class="space-y-0.5">
                <span class="text-[13px] font-bold text-slate-800 dark:text-white tracking-tight">{{ item.name }}</span>
                <p class="text-[9px] font-medium text-slate-400 uppercase tracking-widest">{{ item.desc }}</p>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-slate-300 dark:text-slate-600 group-hover:translate-x-1 transition-transform"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      <!-- Login Options -->
      <div class="space-y-4">
        <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Login Preferences</h3>
        <div class="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm">
          <div v-for="(item, idx) in loginMethods" :key="item.id" 
            class="flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
            :class="{ 'border-b border-slate-100 dark:border-white/5': idx !== loginMethods.length - 1 }"
          >
            <div class="flex items-center gap-4">
              <div class="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-xl border border-black/5 dark:border-white/5 group-hover:scale-110 transition-transform">
                {{ item.icon }}
              </div>
              <div class="space-y-0.5">
                <span class="text-[13px] font-bold text-slate-800 dark:text-white tracking-tight">{{ item.name }}</span>
                <p v-if="item.desc" class="text-[9px] font-medium text-slate-400 uppercase tracking-widest">{{ item.desc }}</p>
              </div>
            </div>
            <label :for="item.id" class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" :id="item.id" v-model="item.toggle.value" class="sr-only peer">
              <div class="w-10 h-5 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary transition-all duration-300"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- Transaction Security -->
      <div class="space-y-4">
        <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Payments & Auth</h3>
        <div class="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm">
          <div v-for="(item, idx) in transactionSettings" :key="item.id" 
            class="flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
          >
            <div class="flex items-center gap-4">
              <div class="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-xl border border-black/5 dark:border-white/5 group-hover:scale-110 transition-transform">
                {{ item.icon }}
              </div>
              <div class="space-y-0.5">
                <span class="text-[13px] font-bold text-slate-800 dark:text-white tracking-tight">{{ item.name }}</span>
                <p class="text-[9px] font-medium text-slate-400 uppercase tracking-widest">{{ item.desc }}</p>
              </div>
            </div>
            <label :for="item.id" class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" :id="item.id" v-model="item.toggle.value" class="sr-only peer">
              <div class="w-10 h-5 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary transition-all duration-300"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  </AppShell>
</template>

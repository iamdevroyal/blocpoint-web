<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../../components/layout/AppShell.vue'
import { useSettingsStore } from '../../stores/settings'

const router   = useRouter()
const settings = useSettingsStore()

onMounted(() => settings.load())

const toggleSecurity = (key) => {
  const map = {
    biometric_login: 'security_biometric_login',
    biometric_txn:   'security_biometric_txn',
  }
  settings.updateSecurity({ [map[key]]: !settings.security[key] })
}

const securityItems = [
  { id: 'change_pin', name: 'Change Login PIN', icon: '🔑', desc: 'Update your 4-digit access code', path: '/app/settings/security/change-pin' },
  { id: 'pos_pin',    name: 'Reset POS PIN',    icon: '🛒', desc: 'Secure code for card transactions', path: '/app/settings/security/reset-pos-pin' },
]

const biometricItems = [
  { id: 'biometric_login', name: 'Biometric Access',        icon: '✋', desc: 'FaceID or Fingerprint' },
  { id: 'biometric_txn',   name: 'Transaction Biometrics',  icon: '⚡', desc: 'Authorize payments faster' },
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

      <!-- Navigation items (change-pin, reset-pos-pin) -->
      <div class="space-y-4">
        <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Standard Security</h3>
        <div class="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm">
          <button v-for="(item, idx) in securityItems" :key="item.id"
            class="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group border-none"
            :class="{ 'border-b border-slate-100 dark:border-white/5': idx !== securityItems.length - 1 }"
            @click="router.push(item.path)"
          >
            <div class="flex items-center gap-4 text-left">
              <div class="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-xl border border-black/5 dark:border-white/5 group-hover:scale-110 transition-transform">{{ item.icon }}</div>
              <div class="space-y-0.5">
                <span class="text-[13px] font-bold text-slate-800 dark:text-white tracking-tight">{{ item.name }}</span>
                <p class="text-[9px] font-medium text-slate-400 uppercase tracking-widest">{{ item.desc }}</p>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-slate-300 dark:text-slate-600 group-hover:translate-x-1 transition-transform"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      <!-- Biometric toggles -->
      <div class="space-y-4">
        <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Login & Payment Auth</h3>
        <div class="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm">
          <div v-if="settings.isLoading" class="h-16 animate-pulse bg-slate-100 dark:bg-white/5"></div>
          <div v-else v-for="(item, idx) in biometricItems" :key="item.id"
            class="flex items-center justify-between p-5"
            :class="{ 'border-b border-slate-100 dark:border-white/5': idx !== biometricItems.length - 1 }"
          >
            <div class="flex items-center gap-4">
              <div class="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-xl border border-black/5 dark:border-white/5">{{ item.icon }}</div>
              <div class="space-y-0.5">
                <span class="text-[13px] font-bold text-slate-800 dark:text-white tracking-tight">{{ item.name }}</span>
                <p class="text-[9px] font-medium text-slate-400 uppercase tracking-widest">{{ item.desc }}</p>
              </div>
            </div>
            <button @click="toggleSecurity(item.id)" class="relative inline-flex items-center cursor-pointer focus:outline-none" role="switch" :aria-checked="settings.security[item.id]" :disabled="settings.isSaving">
              <div class="w-10 h-5 rounded-full transition-all duration-300 relative" :class="settings.security[item.id] ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-800'">
                <div class="absolute top-[2px] h-4 w-4 rounded-full bg-white border border-slate-300 transition-all duration-300" :class="settings.security[item.id] ? 'left-[22px] border-white' : 'left-[2px]'"></div>
              </div>
            </button>
          </div>
        </div>
      </div>

    </div>
  </AppShell>
</template>

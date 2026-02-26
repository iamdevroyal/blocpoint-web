<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../components/layout/AppShell.vue'
import { useUIStore } from '../stores/ui'

const uiStore = useUIStore()
const router = useRouter()

const settingsGroups = [
  {
    title: 'Account & Security',
    items: [
      { id: 'security', name: 'Security & Access', icon: '🔐', desc: 'PIN, Biometrics, Reset POS PIN', path: '/app/settings/security' },
      { id: 'limits', name: 'Transaction Limits', icon: '📊', desc: 'Manage spending & daily limits', path: '/app/settings/limits' },
      { id: 'kyc', name: 'Account Tier (Level 2)', icon: '🛡️', desc: 'Upgrade for higher limits', path: '/app/settings/kyc' },
      { id: 'tax', name: 'Tax Compliance', icon: '📝', desc: 'TIN & Auto-Remittance', path: '/app/settings/tax' },
    ]
  },
  {
    title: 'Preferences',
    items: [
      { id: 'notifications', name: 'Notifications', icon: '🔔', desc: 'Alerts, Emails, Push Preferences', path: '/app/settings/notifications' },
      { id: 'darkmode', name: 'Dark Mode', icon: '🌓', toggle: ref(uiStore.isDark), action: () => uiStore.toggleTheme() },
      { id: 'language', name: 'Language', icon: '🌍', value: 'English' },
    ]
  },
  {
    title: 'Support',
    items: [
      { id: 'help', name: 'Help Center', icon: '📖', desc: 'FAQ & Platform Guide', path: '/app/help-center' },
      { id: 'contact', name: 'Contact Support', icon: '🎧', desc: '24/7 Human Assistance', path: '/app/support' },
    ]
  }
]

const go = (path) => {
  if (path) router.push(path)
}
</script>

<template>
  <AppShell title="Settings">
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <!-- Profile Summary -->
      <div class="px-2">
        <div class="p-6 bg-gradient-to-br from-slate-800 to-slate-950 rounded-[2.5rem] border border-white/5 shadow-2xl flex items-center gap-5">
          <div class="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-2xl shadow-inner">🤴</div>
          <div class="space-y-1">
            <h2 class="text-lg font-bold text-white tracking-tight">Njoku Royal</h2>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-full border border-emerald-500/20 uppercase">Level 2 Verified</span>
            </div>
          </div>
        </div>
      </div>

      <div v-for="group in settingsGroups" :key="group.title" class="space-y-4">
        <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">{{ group.title }}</h3>
        
        <div class="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm mx-2">
          <div v-for="(item, idx) in group.items" :key="item.id" 
            class="flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group cursor-pointer"
            :class="{ 'border-b border-slate-100 dark:border-white/5': idx !== group.items.length - 1 }"
            @click="item.path ? go(item.path) : (item.action ? item.action() : null)"
          >
            <div class="flex items-center gap-4">
              <div class="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-xl shadow-sm border border-black/5 dark:border-white/5 group-hover:scale-110 transition-transform">
                {{ item.icon }}
              </div>
              <div class="space-y-0.5">
                <span class="text-[13px] font-bold text-slate-800 dark:text-white tracking-tight">{{ item.name }}</span>
                <p v-if="item.desc" class="text-[9px] font-medium text-slate-400 uppercase tracking-widest">{{ item.desc }}</p>
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              <span v-if="item.value" class="text-[10px] font-black text-primary uppercase tracking-widest">{{ item.value }}</span>
              
              <!-- Custom Toggle -->
              <label v-if="item.toggle !== undefined" :for="item.id" class="relative inline-flex items-center cursor-pointer" @click.stop>
                <input type="checkbox" :id="item.id" v-model="item.toggle.value" class="sr-only peer" @change="item.action ? item.action() : null">
                <div class="w-10 h-5 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary transition-all duration-300"></div>
              </label>

              <svg v-else-if="!item.toggle && !item.value" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-slate-300 dark:text-slate-600 transition-transform group-hover:translate-x-1"><path d="m9 18 6-6-6-6"/></svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="space-y-4 px-2">
        <h3 class="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] px-4">Danger Zone</h3>
        <button class="w-full flex items-center gap-4 p-5 bg-rose-500/5 border border-rose-500/10 rounded-[2.5rem] active:scale-[0.98] transition-all text-left group">
          <div class="w-11 h-11 rounded-2xl bg-rose-500 flex items-center justify-center text-xl text-white group-hover:scale-110 transition-transform shadow-lg shadow-rose-500/20">
            🗑️
          </div>
          <div class="space-y-0.5">
            <h4 class="text-[13px] font-bold text-rose-500 tracking-tight">Delete Account</h4>
            <p class="text-[9px] font-medium text-rose-500/60 uppercase tracking-widest">Permanently remove your account data</p>
          </div>
        </button>
      </div>
    </div>
  </AppShell>
</template>

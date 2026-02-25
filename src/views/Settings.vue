<script setup>
import { ref } from 'vue'
import AppShell from '../components/layout/AppShell.vue'
import { useUIStore } from '../stores/ui'

const uiStore = useUIStore()

const settingsGroups = [
  {
    title: 'Security',
    items: [
      { id: 'pin', name: 'Change Login PIN', icon: '🔐', action: () => {} },
      { id: 'biometric', name: 'Biometric Login', icon: '☝️', toggle: ref(true) },
      { id: '2fa', name: 'Two-Factor Auth', icon: '📱', toggle: ref(false) },
    ]
  },
  {
    title: 'Preferences',
    items: [
      { id: 'darkmode', name: 'Dark Mode', icon: '🌓', toggle: ref(uiStore.isDark), action: () => uiStore.toggleTheme() },
      { id: 'notifications', name: 'Push Notifications', icon: '🔔', toggle: ref(true) },
      { id: 'language', name: 'Language', icon: '🌍', value: 'English' },
    ]
  }
]
</script>

<template>
  <AppShell title="Settings">
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div v-for="group in settingsGroups" :key="group.title" class="space-y-4">
        <h3 class="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-4">{{ group.title }}</h3>
        
        <div class="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm">
          <div v-for="(item, idx) in group.items" :key="item.id" 
            class="flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
            :class="{ 'border-b border-slate-100 dark:border-white/5': idx !== group.items.length - 1 }"
            @click="item.action ? item.action() : null"
          >
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-lg shadow-sm border border-black/5 dark:border-white/5 group-hover:scale-110 transition-transform">
                {{ item.icon }}
              </div>
              <span class="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-tight">{{ item.name }}</span>
            </div>
            
            <div class="flex items-center gap-2">
              <span v-if="item.value" class="text-[10px] font-black text-primary uppercase tracking-widest">{{ item.value }}</span>
              
              <!-- Custom Toggle -->
              <label v-if="item.toggle !== undefined" :for="item.id" class="relative inline-flex items-center cursor-pointer" @click.stop>
                <input type="checkbox" :id="item.id" v-model="item.toggle.value" class="sr-only peer" @change="item.action ? item.action() : null">
                <div class="w-10 h-5 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>

              <svg v-else-if="!item.toggle && !item.value" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-slate-300 dark:text-slate-600"><path d="m9 18 6-6-6-6"/></svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="space-y-4 px-1">
        <h3 class="text-xs font-black text-rose-400 uppercase tracking-[0.2em] px-4">Danger Zone</h3>
        <button class="w-full flex items-center gap-4 p-5 bg-rose-500/10 border border-rose-500/20 rounded-[2.5rem] active:scale-[0.98] transition-all text-left group">
          <div class="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center text-lg text-white group-hover:scale-110 transition-transform">
            🗑️
          </div>
          <div>
            <h4 class="text-xs font-black text-rose-500 uppercase tracking-tight">Delete Account</h4>
            <p class="text-[10px] font-bold text-rose-500/70">Permanently remove your account data</p>
          </div>
        </button>
      </div>
    </div>
  </AppShell>
</template>

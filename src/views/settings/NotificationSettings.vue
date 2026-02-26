<script setup>
import { ref } from 'vue'
import AppShell from '../../components/layout/AppShell.vue'

const pushEnabled = ref(true)
const emailEnabled = ref(false)
const smsEnabled = ref(true)
const marketingEnabled = ref(false)

const sections = [
  {
    title: 'Transactional Alerts',
    items: [
      { id: 'push', name: 'Push Notifications', icon: '📱', desc: 'Instant alerts on your device', toggle: pushEnabled },
      { id: 'email', name: 'Email Reports', icon: '📧', desc: 'Daily transaction summaries', toggle: emailEnabled },
      { id: 'sms', name: 'SMS Notifications', icon: '💬', desc: 'Direct alerts to mobile', toggle: smsEnabled },
    ]
  },
  {
    title: 'Updates & Offers',
    items: [
      { id: 'promo', name: 'Promotions & Rewards', icon: '🎁', desc: 'Gift card deals and referral perks', toggle: marketingEnabled },
    ]
  }
]
</script>

<template>
  <AppShell title="Notification Preferences">
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 px-2">
      
      <!-- Summary -->
      <div class="p-8 bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
        <div class="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
        <div class="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
        <div class="relative z-10 flex flex-col items-center text-center space-y-4">
          <div class="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-2xl shadow-inner">🔔</div>
          <h2 class="text-xl font-bold text-white tracking-tight">Stay Updated</h2>
          <p class="text-[10px] font-medium text-white/70 uppercase tracking-widest leading-relaxed">Choose how and when you want to be notified about your account activity.</p>
        </div>
      </div>

      <div v-for="section in sections" :key="section.title" class="space-y-4">
        <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">{{ section.title }}</h3>
        <div class="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm">
          <div v-for="(item, idx) in section.items" :key="item.id" 
            class="flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
            :class="{ 'border-b border-slate-100 dark:border-white/5': idx !== section.items.length - 1 }"
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

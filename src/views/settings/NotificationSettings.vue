<script setup>
import { onMounted } from 'vue'
import AppShell from '../../components/layout/AppShell.vue'
import { useSettingsStore } from '../../stores/settings'

const settings = useSettingsStore()

onMounted(() => settings.load())

const toggle = (key) => {
  const map = {
    push:      'notif_push',
    email:     'notif_email',
    sms:       'notif_sms',
    marketing: 'notif_marketing',
  }
  settings.updateNotifications({ [map[key]]: !settings.notifications[key] })
}

const sections = [
  {
    title: 'Transactional Alerts',
    items: [
      { id: 'push',  name: 'Push Notifications', icon: '📱', desc: 'Instant alerts on your device' },
      { id: 'email', name: 'Email Reports',       icon: '📧', desc: 'Daily transaction summaries' },
      { id: 'sms',   name: 'SMS Notifications',   icon: '💬', desc: 'Direct alerts to mobile' },
    ]
  },
  {
    title: 'Updates & Offers',
    items: [
      { id: 'marketing', name: 'Promotions & Rewards', icon: '🎁', desc: 'Gift card deals and referral perks' },
    ]
  }
]
</script>

<template>
  <AppShell title="Notification Preferences">
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 px-2">

      <!-- Summary card -->
      <div class="p-8 bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
        <div class="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
        <div class="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
        <div class="relative z-10 flex flex-col items-center text-center space-y-4">
          <div class="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-2xl shadow-inner">🔔</div>
          <h2 class="text-xl font-bold text-white tracking-tight">Stay Updated</h2>
          <p class="text-[10px] font-medium text-white/70 uppercase tracking-widest leading-relaxed">Choose how and when you want to be notified about your account activity.</p>
        </div>
      </div>

      <!-- Skeleton while loading -->
      <div v-if="settings.isLoading" class="space-y-3">
        <div v-for="i in 4" :key="i" class="h-16 rounded-3xl bg-slate-200 dark:bg-white/5 animate-pulse"></div>
      </div>

      <template v-else>
        <div v-for="section in sections" :key="section.title" class="space-y-4">
          <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">{{ section.title }}</h3>
          <div class="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm">
            <div v-for="(item, idx) in section.items" :key="item.id"
              class="flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
              :class="{ 'border-b border-slate-100 dark:border-white/5': idx !== section.items.length - 1 }"
            >
              <div class="flex items-center gap-4">
                <div class="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-xl border border-black/5 dark:border-white/5 group-hover:scale-110 transition-transform">{{ item.icon }}</div>
                <div class="space-y-0.5">
                  <span class="text-[13px] font-bold text-slate-800 dark:text-white tracking-tight">{{ item.name }}</span>
                  <p class="text-[9px] font-medium text-slate-400 uppercase tracking-widest">{{ item.desc }}</p>
                </div>
              </div>
              <button @click="toggle(item.id)" class="relative inline-flex items-center cursor-pointer focus:outline-none" role="switch" :aria-checked="settings.notifications[item.id]" :disabled="settings.isSaving">
                <div class="w-10 h-5 rounded-full transition-all duration-300 relative" :class="settings.notifications[item.id] ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-800'">
                  <div class="absolute top-[2px] h-4 w-4 rounded-full bg-white border border-slate-300 transition-all duration-300" :class="settings.notifications[item.id] ? 'left-[22px] border-white' : 'left-[2px]'"></div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </template>

    </div>
  </AppShell>
</template>

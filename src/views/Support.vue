<script setup>
import { useRouter } from 'vue-router'
import AppShell from '../components/layout/AppShell.vue'

const router = useRouter()

const contactOptions = [
  { 
    name: 'Call Support', 
    desc: 'Available 24/7 for urgent issues',
    action: 'tel:+2348000000000',
    icon: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z',
    color: 'text-blue-500 bg-blue-500/10'
  },
  { 
    name: 'Email Us', 
    desc: 'Get a response within 24 hours',
    action: 'mailto:support@blocpoint.com',
    icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
    color: 'text-emerald-500 bg-emerald-500/10'
  },
  { 
    name: 'Chat on WhatsApp', 
    desc: 'Fastest way to reach our team',
    action: 'https://wa.me/2348000000000',
    icon: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-7.6 8.38 8.38 0 0 1 3.8.9L21 4.5z',
    color: 'text-green-500 bg-green-500/10'
  }
]
</script>

<template>
  <AppShell title="Support">
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div class="text-center space-y-2 px-4">
        <h2 class="text-2xl font-black tracking-tight">How can we help?</h2>
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400">Our team is online and ready to assist you with any questions or issues.</p>
      </div>

      <div class="space-y-4">
        <a 
          v-for="option in contactOptions" 
          :key="option.name"
          :href="option.action"
          target="_blank"
          class="flex items-center gap-5 p-5 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-3xl shadow-sm transition-all active:scale-[0.98] group"
        >
          <div :class="[option.color, 'w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-black/5 dark:border-white/5 transition-transform group-hover:scale-110']">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path :d="option.icon" />
            </svg>
          </div>
          <div class="flex-1">
            <h4 class="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-tight">{{ option.name }}</h4>
            <p class="text-xs font-medium text-slate-500 dark:text-slate-400">{{ option.desc }}</p>
          </div>
          <div class="text-primary opacity-30 group-hover:opacity-100 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </div>
        </a>
      </div>

      <div class="pt-8 text-center">
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Blocpoint Care • 2026</p>
      </div>
    </div>
  </AppShell>
</template>

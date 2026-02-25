<script setup>
import AppShell from '../components/layout/AppShell.vue'

const profileData = {
  name: 'Njoku Nnaemeka Royal',
  phone: '+234 703 514 8792',
  email: 'royal@blocpoint.com',
  level: 2,
  tier: 'Diamond Agent',
  joined: 'March 2026'
}
</script>

<template>
  <AppShell title="Profile">
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <!-- Profile Header -->
      <div class="flex flex-col items-center gap-4 py-4">
        <div class="w-28 h-28 rounded-full border-4 border-primary/20 p-1 relative group">
          <img src="https://ui-avatars.com/api/?name=Njoku+Nnaemeka+Royal&background=6366f1&color=fff" alt="Profile" class="w-full h-full rounded-full object-cover shadow-2xl" />
          <button class="absolute bottom-1 right-1 w-8 h-8 bg-primary text-white rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-lg active:scale-90 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </button>
        </div>
        <div class="text-center space-y-1">
          <h2 class="text-xl font-black tracking-tight">{{ profileData.name }}</h2>
          <div class="flex items-center justify-center gap-2">
            <span class="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20">Level 2 Verified</span>
          </div>
        </div>
      </div>

      <!-- Info Cards -->
      <div class="grid grid-cols-1 gap-4">
        <div class="p-6 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-3xl space-y-6 shadow-sm">
          <h3 class="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">Personal Details</h3>
          
          <div class="space-y-5">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-lg">📱</div>
              <div>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none mb-1">Phone Number</p>
                <p class="text-sm font-extrabold text-slate-800 dark:text-white">{{ profileData.phone }}</p>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-lg">✉️</div>
              <div>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none mb-1">Email Address</p>
                <p class="text-sm font-extrabold text-slate-800 dark:text-white">{{ profileData.email }}</p>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-lg">💎</div>
              <div>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none mb-1">Account Tier</p>
                <p class="text-sm font-extrabold text-slate-800 dark:text-white">{{ profileData.tier }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="p-6 bg-indigo-600 dark:bg-indigo-600 text-white rounded-[2.5rem] relative overflow-hidden shadow-xl group">
          <div class="absolute -right-12 -bottom-12 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
          <div class="relative z-10 flex items-center justify-between">
            <div class="space-y-1">
              <h4 class="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Sustainability Points</h4>
              <p class="text-2xl font-black tracking-tight">2,450 BP</p>
            </div>
            <button class="px-5 py-2.5 bg-white text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg active:scale-95 transition-all">Redeem</button>
          </div>
        </div>
      </div>

      <div class="pt-4 text-center">
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Member since {{ profileData.joined }}</p>
      </div>
    </div>
  </AppShell>
</template>

<script setup>
import { ref } from 'vue'
import AppShell from '../components/layout/AppShell.vue'

const profileData = ref({
  name: 'Njoku Nnaemeka Royal',
  phone: '+234 703 514 8792',
  email: 'royal@blocpoint.com',
  level: 2,
  tier: 'Diamond Agent',
  joined: 'March 2026',
  accountNumber: '8827344109',
  bankName: 'Blocpoint Microfinance Bank',
  address: 'No. 123, Luxury Estate, Lagos, Nigeria',
  gender: 'Male',
  dob: '12th Oct 1995'
})

const profilePhoto = ref(null)
const fileInput = ref(null)

const handlePhotoUpload = (e) => {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (res) => {
      profilePhoto.value = res.target.result
    }
    reader.readAsDataURL(file)
  }
}

const triggerUpload = () => {
  fileInput.value.click()
}
</script>

<template>
  <AppShell title="Profile">
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 px-2">
      <!-- Profile Header -->
      <div class="flex flex-col items-center gap-5 py-6">
        <div class="relative group">
          <div class="w-32 h-32 rounded-[2.5rem] border-4 border-primary/20 p-1.5 bg-white dark:bg-slate-900 shadow-2xl relative overflow-hidden">
            <img 
              :src="profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=6366f1&color=fff&size=128`" 
              alt="Profile" 
              class="w-full h-full rounded-[2rem] object-cover" 
            />
            <div 
              @click="triggerUpload"
              class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <span class="text-[10px] font-black text-white uppercase tracking-widest">Change</span>
            </div>
          </div>
          <button 
            @click="triggerUpload"
            class="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-white rounded-2xl border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-xl active:scale-90 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          </button>
          <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handlePhotoUpload" />
        </div>

        <div class="text-center space-y-2">
          <h2 class="text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-none">{{ profileData.name }}</h2>
          <div class="flex items-center justify-center gap-2">
            <span class="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-emerald-500/20">
              Level {{ profileData.level }} Verified
            </span>
          </div>
        </div>
      </div>

      <!-- Account Info Card -->
      <div class="space-y-4">
        <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-4">Account Information</h3>
        <div class="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-sm space-y-6">
          <div class="grid grid-cols-1 gap-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg">🏦</div>
                <div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Bank Name</p>
                  <p class="text-[13px] font-black text-slate-800 dark:text-white">{{ profileData.bankName }}</p>
                </div>
              </div>
            </div>
            
            <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-lg">💳</div>
                <div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Account Number</p>
                  <p class="text-[15px] font-black text-slate-800 dark:text-white tracking-widest">{{ profileData.accountNumber }}</p>
                </div>
              </div>
              <button class="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-200 dark:border-white/10 active:scale-90 transition-transform shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Personal Details Card -->
      <div class="space-y-4">
        <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-4">Personal Details</h3>
        <div class="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-sm space-y-6">
          <div class="space-y-6">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-lg">📱</div>
              <div>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Phone Number</p>
                <p class="text-sm font-black text-slate-800 dark:text-white">{{ profileData.phone }}</p>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-lg">✉️</div>
              <div>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Email Address</p>
                <p class="text-sm font-black text-slate-800 dark:text-white">{{ profileData.email }}</p>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-lg">🏠</div>
              <div>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Residential Address</p>
                <p class="text-[13px] font-black text-slate-800 dark:text-white leading-relaxed">{{ profileData.address }}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-white/5 mt-4">
              <div>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Gender</p>
                <p class="text-sm font-black text-slate-800 dark:text-white">{{ profileData.gender }}</p>
              </div>
              <div>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date of Birth</p>
                <p class="text-sm font-black text-slate-800 dark:text-white">{{ profileData.dob }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sustainability Card -->
      <div class="p-8 bg-gradient-to-br from-indigo-600 to-primary text-white rounded-[3rem] relative overflow-hidden shadow-2xl group active:scale-[0.98] transition-all cursor-pointer">
        <div class="absolute -right-16 -bottom-16 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
        <div class="relative z-10 flex items-center justify-between">
          <div class="space-y-2">
            <h4 class="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Sustainability Points</h4>
            <div class="flex items-baseline gap-1">
              <p class="text-3xl font-black tracking-tight">2,450</p>
              <span class="text-xs font-bold opacity-60">BP</span>
            </div>
          </div>
          <button class="px-6 py-3 bg-white text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:shadow-white/20 transition-all">Redeem</button>
        </div>
      </div>

      <div class="pt-6 text-center">
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Member since {{ profileData.joined }}</p>
      </div>
    </div>
  </AppShell>
</template>

<style scoped>
/* Outfit font is applied globally, but we can ensure it here */
.tracking-tight {
  letter-spacing: -0.025em;
}
</style>

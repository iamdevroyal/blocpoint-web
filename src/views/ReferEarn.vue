<script setup>
import { ref } from 'vue'
import AppShell from '../components/layout/AppShell.vue'

const referralCode = ref('BLOC-ROYAL-2026')
const showCopyToast = ref(false)

const stats = [
  { label: 'Total Earned', value: '₦12,500', icon: '💰', color: 'text-emerald-500' },
  { label: 'Pending', value: '₦2,500', icon: '⏳', color: 'text-amber-500' },
  { label: 'Invited Users', value: '24', icon: '👥', color: 'text-primary' }
]

const steps = [
  { title: 'Share Your Code', desc: 'Send your unique referral link to your friends and family.' },
  { title: 'They Sign Up', desc: 'Your friends register on BlocPoint using your referral code.' },
  { title: 'You Earn Rewards', desc: 'Get ₦500 credited to your wallet for every successful verification.' }
]

const copyCode = () => {
  navigator.clipboard.writeText(referralCode.value)
  showCopyToast.value = true
  setTimeout(() => showCopyToast.value = false, 2000)
}

const shareToWhatsApp = () => {
  const text = `Join me on BlocPoint and earn rewards! Use my code: ${referralCode.value} to get started. ✨`
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
}
</script>

<template>
  <AppShell title="Refer & Earn">
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 px-2">
      
      <!-- Hero Banner -->
      <div class="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-indigo-900 p-8 shadow-2xl group active:scale-[0.99] transition-all">
        <div class="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
        <div class="absolute -right-20 -top-20 w-64 h-64 bg-indigo-400/20 rounded-full blur-[80px] pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
        
        <div class="relative z-10 flex flex-col items-center text-center space-y-4">
          <div class="w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-3xl shadow-inner mb-2">🎁</div>
          <h2 class="text-2xl font-bold text-white tracking-tight">Earn Rewards Together</h2>
          <p class="text-xs font-medium text-white/80 max-w-[280px] pb-1">
            Get ₦500 for every friend who joins BlocPoint and completes their verification.
          </p>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-2 gap-4">
        <div 
          v-for="stat in stats" 
          :key="stat.label"
          class="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl space-y-2 first:col-span-2"
        >
          <div class="flex items-center justify-between">
            <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{{ stat.label }}</span>
            <span class="text-lg">{{ stat.icon }}</span>
          </div>
          <p class="text-2xl font-bold tracking-tight" :class="stat.color">{{ stat.value }}</p>
        </div>
      </div>

      <!-- Referral Code Section -->
      <div class="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl space-y-6">
        <div class="text-center space-y-1">
          <h3 class="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-widest">Your Referral Code</h3>
          <p class="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Tap To Copy & Share</p>
        </div>

        <button 
          @click="copyCode"
          class="w-full p-6 bg-slate-50 dark:bg-white/5 border-2 border-dashed border-primary/30 rounded-3xl flex flex-col items-center gap-2 group hover:bg-primary/5 transition-all relative"
        >
          <span class="text-2xl font-black text-primary tracking-[0.2em] uppercase">{{ referralCode }}</span>
          <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Click To Copy</span>
          
          <Transition name="fade">
            <div v-if="showCopyToast" class="absolute inset-0 flex items-center justify-center bg-primary rounded-3xl text-white text-xs font-bold uppercase tracking-widest">
              Copied To Clipboard!
            </div>
          </Transition>
        </button>

        <div class="flex gap-4 pt-2">
          <button @click="shareToWhatsApp" class="flex-1 h-14 bg-[#25D366] text-white text-[10px] font-bold rounded-2xl active:scale-95 transition-all uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-green-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/></svg>
            WhatsApp
          </button>
          <button @click="copyCode" class="flex-1 h-14 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white text-[10px] font-bold rounded-2xl active:scale-95 transition-all uppercase tracking-widest flex items-center justify-center gap-2 border border-black/5 dark:border-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            Copy Link
          </button>
        </div>
      </div>

      <!-- How it works -->
      <div class="space-y-4">
        <h3 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">How It Works</h3>
        <div class="space-y-4">
          <div 
            v-for="(step, idx) in steps" 
            :key="idx"
            class="p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-[2rem] flex gap-5 items-start"
          >
            <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/10">
              {{ idx + 1 }}
            </div>
            <div class="space-y-1">
              <h4 class="text-sm font-bold text-slate-800 dark:text-white tracking-tight">{{ step.title }}</h4>
              <p class="text-[10px] font-medium text-slate-400 leading-relaxed">{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </AppShell>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../../components/layout/AppShell.vue'

const router = useRouter()

const activeIndex = ref(0)
const walletScroll = ref(null)

const isBalanceHidden = ref(false)

const wallets = [
  { code: 'NGN', symbol: '₦', name: 'Naira', balance: '54,200.00', pending: '3,500.00', color: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10', textColor: 'text-slate-800 dark:text-white' },
  { code: 'USD', symbol: '$', name: 'Dollar', balance: '1,250.00', pending: '50.00', color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-500/20', textColor: 'text-blue-900 dark:text-blue-100' },
  { code: 'GHS', symbol: 'GH₵', name: 'Cedi', balance: '8,400.00', pending: '120.00', color: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-500/20', textColor: 'text-emerald-900 dark:text-emerald-100' },
  { code: 'KES', symbol: 'KSh', name: 'Shilling', balance: '150,000.00', pending: '2,000.00', color: 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-500/20', textColor: 'text-rose-900 dark:text-rose-100' },
  { code: 'GBP', symbol: '£', name: 'Pound', balance: '450.00', pending: '0.00', color: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-500/20', textColor: 'text-indigo-900 dark:text-indigo-100' },
]

const allTransactions = [
  // NGN
  { id: 1, currency: 'NGN', type: 'Inbound', name: 'Michael Scott', amount: '+₦5,000.00', time: '10:45 AM', status: 'Completed', icon: '📥' },
  { id: 2, currency: 'NGN', type: 'Outbound', name: 'Sarah Connor', amount: '-₦2,000.00', time: 'Yesterday', status: 'Completed', icon: '📤' },
  // USD
  { id: 3, currency: 'USD', type: 'Inbound', name: 'Global Client', amount: '+$500.00', time: '2:15 PM', status: 'Completed', icon: '📥' },
  // GHS
  { id: 4, currency: 'GHS', type: 'Bill', name: 'MTN Data', amount: '-GH₵150.00', time: '3 days ago', status: 'Completed', icon: '📡' },
  // KES
  { id: 5, currency: 'KES', type: 'Transfer', name: 'Kamau Maina', amount: '+KSh12,000.00', time: 'Just now', status: 'Completed', icon: '📥' },
]

const filteredTransactions = computed(() => {
  const currentCurrency = wallets[activeIndex.value].code
  return allTransactions.filter(tx => tx.currency === currentCurrency)
})

const handleScroll = (event) => {
  const scrollPosition = event.target.scrollLeft
  const cardWidth = event.target.offsetWidth * 0.85 + 16 // 85% width + 16px gap
  const index = Math.round(scrollPosition / cardWidth)
  if (index !== activeIndex.value && index >= 0 && index < wallets.length) {
    activeIndex.value = index
  }
}

const scrollToWallet = (index) => {
  if (!walletScroll.value) return
  const cardWidth = walletScroll.value.offsetWidth * 0.85 + 16
  walletScroll.value.scrollTo({
    left: index * cardWidth,
    behavior: 'smooth'
  })
}
</script>

<template>
  <AppShell title="My Wallets">
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      
      <!-- Wallet Carousel -->
      <div class="space-y-4">
        <div 
          ref="walletScroll"
          class="flex overflow-x-auto gap-4 snap-x snap-mandatory px-4 pb-4 scrollbar-hide"
          @scroll="handleScroll"
        >
          <div 
            v-for="(wallet, idx) in wallets" 
            :key="wallet.code"
            class="min-w-[85%] snap-center aspect-[1.8/1] rounded-[2.5rem] p-8 relative overflow-hidden transition-all duration-500 shadow-xl border"
            :class="[
              wallet.color,
              activeIndex === idx ? 'scale-100 opacity-100' : 'scale-90 opacity-40'
            ]"
          >
            <div class="relative z-10 h-full flex flex-col justify-between" :class="wallet.textColor">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="text-[10px] font-semibold opacity-50 tracking-widest">{{ wallet.name }} Wallet</h3>
                  <p class="text-xl font-semibold tracking-tight">{{ wallet.code }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <button @click="isBalanceHidden = !isBalanceHidden" class="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center transition-transform active:scale-90">
                    <svg v-if="!isBalanceHidden" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                  </button>
                  <div class="w-10 h-10 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-xl border border-black/5 dark:border-white/10">
                    {{ wallet.symbol }}
                  </div>
                </div>
              </div>

              <div>
                <p class="text-[10px] font-semibold opacity-40 tracking-wider mb-1">Available Balance</p>
                <h2 class="text-3xl font-semibold tracking-tighter transition-all duration-300" :class="{ 'blur-md select-none opacity-40': isBalanceHidden }">
                  {{ wallet.balance }}
                </h2>
                <div class="flex items-center gap-2 mt-2">
                  <span class="w-1 h-1 rounded-full bg-emerald-500"></span>
                  <p class="text-[10px] font-medium opacity-60">
                    Pending: {{ wallet.pending }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Indicators -->
        <div class="flex justify-center gap-2">
          <button 
            v-for="(_, idx) in wallets" 
            :key="idx"
            @click="scrollToWallet(idx)"
            class="h-1.5 transition-all duration-300 rounded-full"
            :class="activeIndex === idx ? 'w-8 bg-primary' : 'w-2 bg-slate-200 dark:bg-white/10'"
          ></button>
        </div>
      </div>

      <!-- Quick Actions for Active Wallet -->
      <div class="px-4 grid grid-cols-2 gap-4">
        <button @click="router.push('/app/convert')" class="h-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all group">
          <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
          </div>
          <span class="text-[10px] font-bold uppercase tracking-widest">Convert</span>
        </button>
        <button @click="router.push('/app/transfer/bank')" class="h-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all group">
          <div class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
          </div>
          <span class="text-[10px] font-bold uppercase tracking-widest">Send</span>
        </button>
      </div>

      <!-- Transaction List -->
      <div class="px-4 space-y-4">
        <div class="flex items-center justify-between px-2">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Transaction History</h3>
          <span class="text-[10px] font-bold text-primary px-3 py-1 bg-primary/10 rounded-full uppercase tracking-widest">
            {{ wallets[activeIndex].code }}
          </span>
        </div>

        <div v-if="filteredTransactions.length > 0" class="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2rem] overflow-hidden">
          <div 
            v-for="(tx, idx) in filteredTransactions" 
            :key="tx.id"
            class="flex items-center justify-between p-5 border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
          >
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                {{ tx.icon }}
              </div>
              <div>
                <h4 class="text-xs font-bold text-slate-800 dark:text-white">{{ tx.name }}</h4>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{{ tx.time }} • {{ tx.type }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-xs font-bold tracking-tight" :class="tx.amount.startsWith('+') ? 'text-emerald-500' : 'text-slate-800 dark:text-white'">
                {{ tx.amount }}
              </p>
              <p class="text-[9px] font-bold text-emerald-500/60 uppercase tracking-widest">{{ tx.status }}</p>
            </div>
          </div>
        </div>

        <div v-else class="py-20 text-center space-y-4 bg-white/30 dark:bg-slate-900/30 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-white/5">
          <div class="text-4xl opacity-20">📂</div>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No transactions for this wallet</p>
        </div>
      </div>
    </div>
  </AppShell>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>



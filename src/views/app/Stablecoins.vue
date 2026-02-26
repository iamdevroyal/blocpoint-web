<script setup>
import { ref } from 'vue'
import AppShell from '../../components/layout/AppShell.vue'
import StablecoinPurchaseModal from '../../components/ui/StablecoinPurchaseModal.vue'
import StablecoinOrderModal from '../../components/ui/StablecoinOrderModal.vue'
import TransactionStatusModal from '../../components/ui/TransactionStatusModal.vue'

const showPurchaseModal = ref(false)
const showOrderModal = ref(false)
const showStatusModal = ref(false)
const tradeSide = ref('buy')
const selectedCard = ref(null)
const selectedOrder = ref(null)

const coins = [
  { id: 'usdt', name: 'Tether USD', symbol: 'USDT', icon: '🟢', buyRate: 1450, sellRate: 1410, color: 'emerald' },
  { id: 'usdc', name: 'USD Coin', symbol: 'USDC', icon: '🔵', buyRate: 1445, sellRate: 1405, color: 'blue' },
  { id: 'pyusd', name: 'PayPal USD', symbol: 'PYUSD', icon: '🅿️', buyRate: 1455, sellRate: 1415, color: 'indigo' },
  { id: 'dai', name: 'DAI Stablecoin', symbol: 'DAI', icon: '🟡', buyRate: 1448, sellRate: 1408, color: 'amber' },
  { id: 'busd', name: 'Binance USD', symbol: 'BUSD', icon: '🔸', buyRate: 1442, sellRate: 1402, color: 'yellow' }
]

const recentOrders = [
  { id: 1, type: 'Buy', coin: 'USDT', amount: 725000, date: 'Feb 24, 2026', status: 'Completed' },
  { id: 2, type: 'Sell', coin: 'USDT', amount: 350000, date: 'Feb 22, 2026', status: 'Completed' },
  { id: 3, type: 'Buy', coin: 'USDC', amount: 150000, date: 'Feb 20, 2026', status: 'Completed' }
]

const openTrade = (coin, side) => {
  selectedCard.value = coin
  tradeSide.value = side
  showPurchaseModal.value = true
}

const openOrder = (order) => {
  selectedOrder.value = order
  showOrderModal.value = true
}

const handleTradeSuccess = (data) => {
  showPurchaseModal.value = false
  showStatusModal.value = true
}
</script>

<template>
  <AppShell title="Stablecoins">
    <section class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <!-- Tier 3 Status Header -->
      <div class="px-2">
        <div 
          class="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-amber-600 to-amber-900 p-8 shadow-2xl group active:scale-[0.99] transition-all"
        >
          <div class="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
          <div class="absolute -right-20 -top-20 w-64 h-64 bg-amber-400/20 rounded-full blur-[80px] pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
          
          <div class="relative z-10 flex flex-col items-center text-center space-y-4">
            <div class="px-4 py-1.5 bg-white/10 rounded-full border border-white/20">
              <p class="text-[9px] font-bold text-amber-200 uppercase tracking-[0.2em]">Verified Tier 3 Feature</p>
            </div>
            <h2 class="text-2xl font-bold text-white tracking-tight">Stablecoin</h2>
            <p class="text-xs font-medium text-white/80 max-w-[280px] pb-1">
              Access compliant USD liquidity with instant on-chain settlement for your customers.
            </p>
          </div>
        </div>
      </div>

      <!-- Coin Rate Cards Carousel -->
      <div class="space-y-4">
        <div class="flex items-center justify-between px-4">
          <h3 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available Assets</h3>
          <div class="flex gap-1">
            <div v-for="n in 3" :key="n" class="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/20"></div>
          </div>
        </div>
        
        <div class="flex overflow-x-auto gap-4 px-4 pb-6 no-scrollbar snap-x snap-mandatory">
          <div 
            v-for="coin in coins" 
            :key="coin.id"
            class="min-w-[260px] snap-center p-5 bg-white dark:bg-slate-900 rounded-[2.2rem] border border-slate-200 dark:border-white/5 shadow-xl space-y-5 group"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-2xl border border-black/5 shadow-inner">
                  {{ coin.icon }}
                </div>
                <div class="space-y-0.5">
                  <h3 class="text-base font-semibold text-slate-800 dark:text-white uppercase tracking-tight">{{ coin.name }}</h3>
                  <p class="text-[9px] font-medium text-slate-400 uppercase tracking-widest text-nowrap">On-Chain Settlement</p>
                </div>
              </div>
              <div class="text-right">
                <span class="text-[8px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-full text-balance">Live</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 space-y-0.5">
                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">Buy</p>
                <p class="text-lg font-bold text-slate-800 dark:text-white text-center">₦{{ coin.buyRate.toLocaleString() }}</p>
              </div>
              <div class="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 space-y-0.5">
                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">Sell</p>
                <p class="text-lg font-bold text-slate-800 dark:text-white text-center">₦{{ coin.sellRate.toLocaleString() }}</p>
              </div>
            </div>

            <div class="flex gap-3">
              <button @click="openTrade(coin, 'buy')" class="flex-1 h-12 bg-primary text-white text-[9px] font-bold rounded-xl active:scale-95 transition-all uppercase tracking-widest shadow-lg shadow-primary/20">Buy</button>
              <button @click="openTrade(coin, 'sell')" class="flex-1 h-12 bg-slate-100 dark:bg-white text-slate-900 text-[9px] font-bold rounded-xl active:scale-95 transition-all uppercase tracking-widest border border-black/5 dark:border-white/10">Sell</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Orders List -->
      <div class="space-y-4 px-2">
        <div class="flex items-center justify-between px-2">
          <h3 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trade History</h3>
          <button class="text-[10px] font-bold text-primary uppercase tracking-widest">Export All</button>
        </div>
        <div class="space-y-3">
          <button 
            v-for="order in recentOrders" 
            :key="order.id" 
            @click="openOrder(order)"
            class="w-full flex items-center justify-between p-5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-[2rem] text-left transition-all active:scale-[0.98] group"
          >
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-lg border border-white/5 shadow-lg group-hover:scale-110 transition-transform">
                {{ order.coin === 'USDT' ? '🟢' : '🔵' }}
              </div>
              <div>
                <p class="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight transition-colors">{{ order.type }} {{ order.coin }}</p>
                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{{ order.date }} • {{ order.status }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-xs font-bold text-slate-800 dark:text-white tracking-tight">₦ {{ order.amount.toLocaleString() }}</p>
              <span class="text-[8px] font-bold text-emerald-500 uppercase tracking-tighter">SETTLED</span>
            </div>
          </button>
        </div>
      </div>
    </section>

    <!-- Modals -->
    <StablecoinPurchaseModal 
      :show="showPurchaseModal"
      :side="tradeSide"
      :selectedCoin="selectedCard"
      @close="showPurchaseModal = false"
      @success="handleTradeSuccess"
    />

    <StablecoinOrderModal 
      :show="showOrderModal"
      :order="selectedOrder"
      @close="showOrderModal = false"
    />

    <TransactionStatusModal 
      :show="showStatusModal"
      title="Trade Executed Successfully"
      :amount="'₦' + (selectedCard ? parseFloat(selectedOrder?.amount || 0).toLocaleString() : '0')"
      message="Your Stablecoin Settlement Has Been Processed And Synchronized With The Blockchain Indexer."
      :details="[
        { label: 'Coin', value: selectedCard?.symbol || 'USDT' },
        { label: 'Trade', value: tradeSide === 'buy' ? 'Buy Order' : 'Sell Order' },
        { label: 'Ref', value: 'CS-' + Math.random().toString().substr(2, 8) }
      ]"
      @action="showStatusModal = false"
      @close="showStatusModal = false"
    />
  </AppShell>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>



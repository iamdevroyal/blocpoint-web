<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppShell from '../../components/layout/AppShell.vue'
import GiftCardPurchaseModal from '../../components/ui/GiftCardPurchaseModal.vue'
import GiftCardOrderModal from '../../components/ui/GiftCardOrderModal.vue'
import TransactionStatusModal from '../../components/ui/TransactionStatusModal.vue'

const router = useRouter()
const route = useRoute()

const showPurchaseModal = ref(false)
const showOrderModal = ref(false)
const showStatusModal = ref(false)
const selectedCard = ref(null)
const selectedOrder = ref(null)

const featuredCards = [
  { id: 1, name: 'Netflix', image: 'https://cdn-icons-png.flaticon.com/512/732/732228.png', rates: '5% Disc.' },
  { id: 2, name: 'Spotify', image: 'https://cdn-icons-png.flaticon.com/512/174/174872.png', rates: '3% Disc.' },
  { id: 3, name: 'Apple', image: 'https://cdn-icons-png.flaticon.com/512/888/888841.png', rates: 'Flat ₦200 Off' }
]

const recentOrders = [
  { id: 'TX-101', name: 'Netflix 1 Month', amount: 5000, date: 'Feb 24, 2026', status: 'Delivered' },
  { id: 'TX-102', name: 'Spotify 3 Months', amount: 3000, date: 'Feb 22, 2026', status: 'Delivered' }
]

const openPurchase = (card) => {
  selectedCard.value = card
  showPurchaseModal.value = true
}

const openOrder = (order) => {
  selectedOrder.value = order
  showOrderModal.value = true
}

const handlePurchaseSuccess = (data) => {
  showPurchaseModal.value = false
  showStatusModal.value = true
}

onMounted(() => {
  if (route.query.purchase) {
    const cardName = route.query.purchase
    selectedCard.value = { 
      name: cardName, 
      image: cardName === 'Netflix' ? 'https://cdn-icons-png.flaticon.com/512/732/732228.png' : 'https://cdn-icons-png.flaticon.com/512/174/174872.png'
    }
    showPurchaseModal.value = true
    // Clear query params without reload
    router.replace({ path: route.path, query: {} })
  }
})
</script>

<template>
  <AppShell title="Digital Assets">
    <section class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 px-2">
      <!-- Catalog Teaser Card -->
      <div class="relative overflow-hidden rounded-[2.5rem] bg-indigo-900 p-8 shadow-2xl group active:scale-[0.99] transition-all">
        <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-black/40"></div>
        <div class="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
        
        <div class="relative z-10 flex flex-col items-center text-center space-y-6">
          <div class="w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-3xl shadow-inner">🛍️</div>
          <div class="space-y-2">
            <h2 class="text-2xl font-bold text-white tracking-tight">Access Global Assets</h2>
            <p class="text-xs font-medium text-white/70 max-w-[280px] pb-1">Netflix, Spotify, PlayStation and 2000+ more available instantly.</p>
          </div>
          <button 
            @click="router.push('/app/gift-cards/catalog')"
            class="px-8 py-3.5 bg-white text-indigo-950 text-[10px] font-bold uppercase tracking-[0.2em] rounded-2xl shadow-xl active:scale-95 transition-all"
          >
            Open Catalog Hub
          </button>
        </div>
      </div>

      <!-- Featured Horizontal Selection -->
      <div class="space-y-4">
        <div class="flex items-center justify-between px-2">
          <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Featured Assets</h3>
          <span class="text-[9px] font-black text-primary uppercase tracking-widest">Hot 🔥</span>
        </div>
        <div class="flex gap-4 overflow-x-auto no-scrollbar px-1 pb-2">
          <button 
            v-for="card in featuredCards" 
            :key="card.id"
            @click="openPurchase(card)"
            class="flex-shrink-0 w-32 p-4 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-lg group active:scale-95 transition-all"
          >
            <div class="aspect-square rounded-2xl bg-slate-50 dark:bg-slate-800 p-3 mb-3 border border-black/5 group-hover:scale-110 transition-transform">
              <img :src="card.image" :alt="card.name" class="w-full h-full object-contain" />
            </div>
            <p class="text-[10px] font-bold text-slate-800 dark:text-white uppercase tracking-tight text-center">{{ card.name }}</p>
            <p class="text-[8px] font-bold text-emerald-500 uppercase tracking-widest text-center mt-0.5">{{ card.rates }}</p>
          </button>
        </div>
      </div>

      <!-- Recent Orders List -->
      <div class="space-y-4">
        <div class="flex items-center justify-between px-2">
          <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Orders</h3>
          <button class="text-[10px] font-black text-primary uppercase tracking-widest">View All</button>
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
                🏷️
              </div>
              <div>
                <p class="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight transition-colors">{{ order.name }}</p>
                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{{ order.date }} • {{ order.status }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-xs font-bold text-slate-800 dark:text-white tracking-tight">₦ {{ order.amount.toLocaleString() }}</p>
              <span class="text-[8px] font-bold text-emerald-500 uppercase tracking-tighter">SUCCESS</span>
            </div>
          </button>
        </div>
      </div>
    </section>

    <!-- Modals -->
    <GiftCardPurchaseModal 
      :show="showPurchaseModal"
      :card="selectedCard"
      @close="showPurchaseModal = false"
      @success="handlePurchaseSuccess"
    />

    <GiftCardOrderModal 
      :show="showOrderModal"
      :order="selectedOrder"
      @close="showOrderModal = false"
    />

    <TransactionStatusModal 
      :show="showStatusModal"
      title="Asset Purchase Successful"
      :amount="'₦' + (selectedCard ? '5,000' : '0')"
      message="Your Digital Asset Code Has Been Generated And Is Now Available In Your Orders History."
      :details="[
        { label: 'Asset', value: selectedCard?.name || 'N/A' },
        { label: 'Order ID', value: 'TX-' + Math.random().toString(36).substr(2, 6).toUpperCase() },
        { label: 'Reference', value: Math.random().toString().substr(2, 9) }
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



<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../../components/layout/AppShell.vue'

const router = useRouter()
const searchQuery = ref('')
const selectedCategory = ref('All')

const categories = ['All', 'Entertainment', 'Gaming', 'Shopping', 'Lifestyle', 'Utilities']

const giftCards = [
  { id: 1, name: 'Netflix', category: 'Entertainment', image: 'https://cdn-icons-png.flaticon.com/512/732/732228.png', description: 'Stream your favorite movies and shows.', rates: 'From ₦5,000' },
  { id: 2, name: 'PlayStation', category: 'Gaming', image: 'https://cdn-icons-png.flaticon.com/512/588/588258.png', description: 'Gaming, add-ons and more.', rates: 'From ₦10,000' },
  { id: 3, name: 'Amazon', category: 'Shopping', image: 'https://cdn-icons-png.flaticon.com/512/732/732192.png', description: 'Your everyday shopping needs.', rates: 'From ₦5,000' },
  { id: 4, name: 'Spotify', category: 'Entertainment', image: 'https://cdn-icons-png.flaticon.com/512/174/174872.png', description: 'Music for every moment.', rates: 'From ₦3,000' },
  { id: 5, name: 'Steam', category: 'Gaming', image: 'https://cdn-icons-png.flaticon.com/512/808/808526.png', description: 'Access thousands of PC games.', rates: 'From ₦5,000' },
  { id: 6, name: 'Apple', category: 'Lifestyle', image: 'https://cdn-icons-png.flaticon.com/512/888/888841.png', description: 'Apps, games, music and more.', rates: 'From ₦5,000' },
  { id: 7, name: 'Uber', category: 'Lifestyle', image: 'https://cdn-icons-png.flaticon.com/512/5969/5969247.png', description: 'Ride across town with ease.', rates: 'From ₦2,000' },
  { id: 8, name: 'Xbox', category: 'Gaming', image: 'https://cdn-icons-png.flaticon.com/512/588/588259.png', description: 'Join the world of Xbox.', rates: 'From ₦5,000' },
]

const filteredCards = computed(() => {
  return giftCards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = selectedCategory.value === 'All' || card.category === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})

const buyCard = (card) => {
  // Store selected card and navigate back to GiftCards with purchase intent
  // For now, navigated back with query param
  router.push({ path: '/app/gift-cards', query: { purchase: card.name } })
}
</script>

<template>
  <AppShell title="Asset Catalog">
    <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 px-2">
      <!-- Search & Filters -->
      <div class="space-y-4">
        <div class="relative group">
          <div class="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400 group-focus-within:text-primary transition-colors"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search 2000+ Gift Cards..."
            class="w-full h-16 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-white/10 rounded-[1.5rem] pl-14 pr-6 text-sm font-bold focus:border-primary focus:ring-8 focus:ring-primary/10 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none outline-none dark:text-white"
          />
        </div>

        <div class="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          <button 
            v-for="cat in categories" 
            :key="cat"
            @click="selectedCategory = cat"
            :class="[
              'px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all shrink-0',
              selectedCategory === cat 
                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' 
                : 'bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-primary/50'
            ]"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Catalog Grid -->
      <div v-if="filteredCards.length" class="grid grid-cols-1 gap-4">
        <div 
          v-for="card in filteredCards" 
          :key="card.id"
          class="p-5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-[2rem] flex items-center gap-5 group hover:border-primary/30 transition-all"
        >
          <div class="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 p-3 shadow-xl border border-black/5 flex-shrink-0 group-hover:scale-110 transition-transform">
            <img :src="card.image" :alt="card.name" class="w-full h-full object-contain" />
          </div>
          <div class="flex-1 space-y-1">
            <div class="flex justify-between items-start">
              <h3 class="text-sm font-bold text-slate-800 dark:text-white tracking-tight">{{ card.name }}</h3>
              <span class="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">{{ card.rates }}</span>
            </div>
            <p class="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-tight line-clamp-2">
              {{ card.description }}
            </p>
            <div class="flex justify-between items-center pt-2">
              <span class="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">{{ card.category }}</span>
              <button @click="buyCard(card)" class="px-5 py-2 bg-primary text-white text-[9px] font-bold uppercase tracking-widest rounded-xl active:scale-95 transition-all shadow-lg shadow-primary/20">
                Buy Asset
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="py-20 text-center space-y-4">
        <div class="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto text-3xl opacity-50">
          🔍
        </div>
        <div class="space-y-1">
          <h4 class="text-sm font-bold text-slate-800 dark:text-white uppercase">No Assets Found</h4>
          <p class="text-[10px] font-medium text-slate-500">Try adjusting your search or filters</p>
        </div>
      </div>
    </div>
  </AppShell>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

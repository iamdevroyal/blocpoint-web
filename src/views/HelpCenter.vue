<script setup>
import { ref, computed } from 'vue'
import AppShell from '../components/layout/AppShell.vue'

const searchQuery = ref('')

const faqCategories = [
  {
    id: 'general',
    name: 'General',
    icon: '🏢',
    questions: [
      { q: 'What is Blocpoint?', a: 'Blocpoint is a modern fintech platform designed for seamless financial management, offering mobile payments, multi-currency wallets, and secure SoftPOS services.' },
      { q: 'Is Blocpoint regulated?', a: 'Yes, we operate in full compliance with local financial regulations and partner with licensed financial institutions to ensure your funds are safe.' },
    ]
  },
  {
    id: 'security',
    name: 'Security',
    icon: '🛡️',
    questions: [
      { q: 'How is my account protected?', a: 'We use multi-layer encryption, 4-digit security PINs, and biometric verification (FaceID/Fingerprint) to protect every transaction.' },
      { q: 'What happens if I forget my PIN?', a: 'You can use the "Forgot PIN" flow on the login screen to reset your access code using your registered phone number and OTP verification.' },
    ]
  },
  {
    id: 'transfers',
    name: 'Transfers & Payments',
    icon: '💸',
    questions: [
      { q: 'Are bank transfers instant?', a: 'Yes, transfers to Nigerian bank accounts via NIP are processed instantly, though occasional bank network delays may occur.' },
      { q: 'What are the transaction fees?', a: 'Intra-app transfers within Blocpoint are free. External bank transfers carry a nominal fee, which is always displayed before you confirm.' },
    ]
  },
  {
    id: 'kyc',
    name: 'Account & KYC',
    icon: '👤',
    questions: [
      { q: 'What are account levels?', a: 'Account levels (Tier 1-3) determine your daily transaction limits. Higher levels require more verification like BVN or Government ID.' },
      { q: 'How do I upgrade my limit?', a: 'Visit Settings > Account Tier & KYC to submit the required documents for your next level upgrade.' },
    ]
  }
]

const activeCategory = ref('general')
const expandedItems = ref([])

const toggleItem = (categoryIndex, questionIndex) => {
  const itemId = `${categoryIndex}-${questionIndex}`
  if (expandedItems.value.includes(itemId)) {
    expandedItems.value = expandedItems.value.filter(id => id !== itemId)
  } else {
    expandedItems.value.push(itemId)
  }
}

const filteredFaqs = computed(() => {
  if (!searchQuery.value) return faqCategories
  
  const query = searchQuery.value.toLowerCase()
  return faqCategories.map(cat => ({
    ...cat,
    questions: cat.questions.filter(f => 
      f.q.toLowerCase().includes(query) || 
      f.a.toLowerCase().includes(query)
    )
  })).filter(cat => cat.questions.length > 0)
})

// Auto-expand if searching
import { watch } from 'vue'
watch(searchQuery, (newVal) => {
  if (newVal) {
    const allIds = []
    filteredFaqs.value.forEach((cat, cIdx) => {
      cat.questions.forEach((_, qIdx) => {
        allIds.push(`${faqCategories.findIndex(f => f.id === cat.id)}-${qIdx}`)
      })
    })
    expandedItems.value = allIds
  } else {
    expandedItems.value = []
  }
})
</script>

<template>
  <AppShell title="Help Center">
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 px-2">
      
      <!-- Search Header -->
      <div class="space-y-4 pt-4">
        <h2 class="text-2xl font-black text-slate-800 dark:text-white tracking-tight px-4 text-center">Platform Knowledge</h2>
        <div class="relative group">
          <input 
            type="text" 
            v-model="searchQuery"
            placeholder="Search FAQs (e.g. PIN, Transfer)"
            class="w-full h-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl px-12 text-sm font-bold outline-none focus:border-primary transition-all dark:text-white shadow-sm"
          />
          <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
            🔍
          </div>
          <button 
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-[10px]"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Category Filter (only show if not searching) -->
      <div v-if="!searchQuery" class="flex gap-3 overflow-x-auto pb-2 scrollbar-hide no-scrollbar -mx-2 px-2">
        <button 
          v-for="cat in faqCategories" 
          :key="cat.id"
          @click="activeCategory = cat.id"
          class="shrink-0 px-6 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all"
          :class="activeCategory === cat.id ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 text-slate-400'"
        >
          <span class="mr-2">{{ cat.icon }}</span> {{ cat.name }}
        </button>
      </div>

      <!-- FAQ Accordion -->
      <div class="space-y-6">
        <div v-for="(cat, cIdx) in filteredFaqs" :key="cat.id">
          <!-- Category Label (only when searching) -->
          <h3 v-if="searchQuery" class="text-[10px] font-black text-primary uppercase tracking-[0.2em] px-4 mb-4 mt-8">{{ cat.name }}</h3>
          
          <!-- Questions -->
          <TransitionGroup name="list" tag="div" class="space-y-3">
            <template v-if="searchQuery || activeCategory === cat.id">
              <div 
                v-for="(faq, qIdx) in cat.questions" 
                :key="faq.q"
                class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden transition-all shadow-sm"
              >
                <button 
                  @click="toggleItem(faqCategories.findIndex(f => f.id === cat.id), qIdx)"
                  class="w-full flex items-center justify-between p-5 text-left group"
                >
                  <span class="text-[13px] font-bold text-slate-800 dark:text-white tracking-tight pr-4 leading-tight">{{ faq.q }}</span>
                  <div class="w-8 h-8 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center transition-transform duration-300"
                    :class="{ 'rotate-180 bg-primary/10 text-primary': expandedItems.includes(`${faqCategories.findIndex(f => f.id === cat.id)}-${qIdx}`) }"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round opacity-40"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </button>
                
                <div 
                  v-show="expandedItems.includes(`${faqCategories.findIndex(f => f.id === cat.id)}-${qIdx}`)"
                  class="px-5 pb-6 animate-in slide-in-from-top-2 duration-300"
                >
                  <div class="h-px bg-slate-100 dark:bg-white/5 mb-4"></div>
                  <p class="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed tracking-wide">{{ faq.a }}</p>
                </div>
              </div>
            </template>
          </TransitionGroup>
        </div>

        <!-- No Results -->
        <div v-if="filteredFaqs.length === 0" class="py-20 text-center space-y-4">
          <div class="text-4xl">🔎</div>
          <div class="space-y-1">
            <h4 class="text-sm font-bold text-slate-800 dark:text-white">No results found</h4>
            <p class="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Try searching for other terms like "PIN" or "Limit"</p>
          </div>
        </div>
      </div>

      <!-- Still need help? -->
      <div class="p-8 bg-gradient-to-br from-primary/5 to-indigo-500/5 border border-primary/10 rounded-[2.5rem] text-center space-y-4">
        <h3 class="text-sm font-black text-slate-800 dark:text-white tracking-tight">Still have questions?</h3>
        <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Our support team is always ready to assist you personally.</p>
        <button 
          @click="$router.push('/app/support')"
          class="px-8 py-4 bg-primary text-white text-[10px] font-black rounded-2xl uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all"
        >
          Contact Support
        </button>
      </div>

    </div>
  </AppShell>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppShell from '../../components/layout/AppShell.vue'
import { articles } from '../../data/knowledge'

const route = useRoute()
const router = useRouter()
const article = ref(null)

onMounted(() => {
  const articleId = route.params.id
  article.value = articles.find(a => a.id === articleId)
  if (!article.value) {
    router.push('/app/dashboard')
  }
})

const goBack = () => router.back()
</script>

<template>
  <AppShell title="Article" v-if="article">
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <!-- Header -->
      <div class="flex items-center justify-between px-2">
        <button @click="goBack" class="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm active:scale-90 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <span class="text-[9px] font-black text-primary uppercase tracking-[0.3em] px-4 py-1.5 bg-primary/10 rounded-full">
          {{ article.category }}
        </span>
      </div>

      <!-- Hero -->
      <div class="relative h-64 rounded-[3rem] overflow-hidden shadow-2xl group mx-2">
        <img :src="article.image" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div class="absolute bottom-6 left-8 right-8">
           <div class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-lg border border-white/10 mb-2">
            {{ article.icon }}
          </div>
          <h1 class="text-2xl font-black text-white tracking-tighter leading-tight">{{ article.title }}</h1>
        </div>
      </div>

      <!-- Content -->
      <div class="px-6 prose prose-slate dark:prose-invert max-w-none">
        <div class="article-content text-slate-600 dark:text-slate-300" v-html="article.content"></div>
      </div>

      <!-- Footer Action -->
      <div class="px-4 pt-12">
        <button @click="goBack" class="w-full h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-black rounded-[1.5rem] shadow-xl active:scale-95 transition-all uppercase tracking-[0.2em]">
          Back to Dashboard
        </button>
      </div>
    </div>
  </AppShell>
</template>

<style scoped>
.article-content :deep(p) {
  margin-bottom: 1.5rem;
  font-size: 1rem;
  line-height: 1.7;
  font-weight: 500;
  opacity: 0.9;
}

.article-content :deep(h4) {
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.article-content :deep(ul) {
  margin-bottom: 1.5rem;
}

.article-content :deep(section) {
  margin-bottom: 2.5rem;
}
</style>

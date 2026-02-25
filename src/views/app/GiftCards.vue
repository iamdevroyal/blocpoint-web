<script setup>
import AppShell from '../../components/layout/AppShell.vue'
</script>

<template>
  <AppShell title="Digital Assets">
    <section class="space-y-4">
      <!-- Catalog teaser -->
      <div
        class="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/30 via-slate-900 to-slate-900 backdrop-blur-xl p-5 shadow-xl shadow-indigo-500/20"
      >
        <h2 class="text-sm font-semibold text-white mb-1">Gift cards & subscriptions</h2>
        <p class="text-xs text-slate-100/80">
          Offer Netflix, Spotify, PlayStation, and more directly from your BlocPoint wallet.
        </p>
        <button
          class="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-semibold"
        >
          <span>Browse catalog</span>
          <span>🛍️</span>
        </button>
      </div>

      <!-- Featured products (mock) -->
      <div class="rounded-2xl border border-white/5 bg-slate-900/70 backdrop-blur-md p-4">
        <h3 class="text-sm font-semibold text-slate-100 mb-3">Featured</h3>
        <div class="grid grid-cols-2 gap-3 text-xs">
          <div class="rounded-xl border border-white/10 bg-slate-900/80 p-3 space-y-2">
            <p class="font-semibold text-slate-100">Netflix</p>
            <p class="text-[11px] text-slate-400">From ₦ 5,000</p>
          </div>
          <div class="rounded-xl border border-white/10 bg-slate-900/80 p-3 space-y-2">
            <p class="font-semibold text-slate-100">Spotify</p>
            <p class="text-[11px] text-slate-400">From ₦ 3,000</p>
          </div>
          <div class="rounded-xl border border-white/10 bg-slate-900/80 p-3 space-y-2">
            <p class="font-semibold text-slate-100">PlayStation</p>
            <p class="text-[11px] text-slate-400">From ₦ 10,000</p>
          </div>
          <div class="rounded-xl border border-white/10 bg-slate-900/80 p-3 space-y-2">
            <p class="font-semibold text-slate-100">Apple</p>
            <p class="text-[11px] text-slate-400">From ₦ 8,000</p>
          </div>
        </div>
      </div>

      <!-- Recent orders (mock) -->
      <div class="rounded-2xl border border-white/5 bg-slate-900/70 backdrop-blur-md p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-slate-100">Recent orders</h3>
          <button class="text-[11px] text-accent">View all</button>
        </div>
        <div v-for="p in ['Netflix 1 Month', 'Spotify 3 Months']" :key="p" class="flex items-center justify-between py-2 border-t border-white/5 first:border-t-0 text-xs">
          <div>
            <p class="font-medium text-slate-100">{{ p }}</p>
            <p class="text-[10px] text-slate-500">Delivered • Code available</p>
          </div>
          <p class="font-semibold text-slate-100">₦ 5,000</p>
        </div>
      </div>
    </section>
  </AppShell>
</template>



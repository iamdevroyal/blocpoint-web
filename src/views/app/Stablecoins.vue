<script setup>
import AppShell from '../../components/layout/AppShell.vue'
</script>

<template>
  <AppShell title="Stablecoins">
    <section class="space-y-4">
      <!-- Eligibility & summary -->
      <div
        class="rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-900 backdrop-blur-xl p-5 shadow-xl shadow-amber-500/20"
      >
        <p class="text-[11px] uppercase tracking-[0.2em] text-amber-300 mb-1">Tier 3 feature</p>
        <h2 class="text-sm font-semibold text-white mb-1">USDT / USDC distribution</h2>
        <p class="text-xs text-slate-100/80">
          Offer compliant access to USD stablecoins for your customers. Quotes, orders, and settlement
          are all handled through BlocPoint.
        </p>
        <button
          class="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-semibold"
        >
          <span>Request quote</span>
          <span>💱</span>
        </button>
      </div>

      <!-- Sample quote cards (mock) -->
      <div class="rounded-2xl border border-white/5 bg-slate-900/70 backdrop-blur-md p-4">
        <h3 class="text-sm font-semibold text-slate-100 mb-3">Indicative rates</h3>
        <div class="space-y-2 text-xs">
          <div class="flex items-center justify-between">
            <p class="text-slate-300">Buy USDT</p>
            <p class="font-semibold text-emerald-400">₦ 1,450 / $1</p>
          </div>
          <div class="flex items-center justify-between">
            <p class="text-slate-300">Sell USDT</p>
            <p class="font-semibold text-rose-300">₦ 1,410 / $1</p>
          </div>
        </div>
      </div>

      <!-- Recent stablecoin orders (mock) -->
      <div class="rounded-2xl border border-white/5 bg-slate-900/70 backdrop-blur-md p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-slate-100">Recent orders</h3>
          <button class="text-[11px] text-accent">View all</button>
        </div>
        <div v-for="i in 3" :key="i" class="flex items-center justify-between py-2 border-t border-white/5 first:border-t-0 text-xs">
          <div>
            <p class="font-medium text-slate-100">{{ i % 2 === 0 ? 'Buy USDT' : 'Sell USDT' }}</p>
            <p class="text-[10px] text-slate-500">Completed • $500</p>
          </div>
          <p class="font-semibold text-slate-100">₦ 725,000</p>
        </div>
      </div>
    </section>
  </AppShell>
</template>



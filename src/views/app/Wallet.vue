<script setup>
import AppShell from '../../components/layout/AppShell.vue'
</script>

<template>
  <AppShell title="Wallet">
    <section class="space-y-4">
      <!-- Balance card -->
      <div
        class="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-xl p-5 shadow-lg shadow-indigo-500/10"
      >
        <p class="text-xs text-slate-400 mb-1">Available balance</p>
        <p class="text-3xl font-semibold text-white">₦ 54,200.00</p>
        <p class="text-[11px] text-slate-500 mt-1">Pending: ₦ 3,500.00</p>

        <div class="flex gap-3 mt-5">
          <button class="flex-1 py-2 rounded-xl bg-white text-slate-900 text-sm font-semibold">
            Add money
          </button>
          <button class="flex-1 py-2 rounded-xl bg-primary text-white text-sm font-semibold">
            Transfer
          </button>
        </div>
      </div>

      <!-- Recent transactions (mocked) -->
      <div class="rounded-2xl border border-white/5 bg-slate-900/60 backdrop-blur-md p-4">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-semibold text-slate-100">Recent transactions</h2>
          <button class="text-[11px] text-accent font-medium">View all</button>
        </div>

        <div
          v-for="i in 4"
          :key="i"
          class="flex items-center justify-between py-3 border-t border-white/5 first:border-t-0"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-full bg-slate-800/80 flex items-center justify-center text-lg"
            >
              {{ i % 2 === 0 ? '⬇️' : '⬆️' }}
            </div>
            <div>
              <p class="text-xs font-medium text-slate-100">
                {{ i % 2 === 0 ? 'Transfer from Michael' : 'Transfer to Sarah' }}
              </p>
              <p class="text-[10px] text-slate-500">Today • 2:3{{ i }} PM</p>
            </div>
          </div>
          <p
            class="text-xs font-semibold"
            :class="i % 2 === 0 ? 'text-emerald-400' : 'text-rose-400'"
          >
            {{ i % 2 === 0 ? '+' : '-' }} ₦ 5,000
          </p>
        </div>
      </div>
    </section>
  </AppShell>
</template>



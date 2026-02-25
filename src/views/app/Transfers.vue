<script setup>
import AppShell from '../../components/layout/AppShell.vue'
</script>

<template>
  <AppShell title="Transfers">
    <section class="space-y-4">
      <!-- Quick transfer CTA -->
      <div
        class="rounded-2xl border border-white/10 bg-gradient-to-br from-primary-soft/40 via-slate-900 to-slate-900 backdrop-blur-xl p-5 shadow-xl shadow-indigo-500/20"
      >
        <h2 class="text-sm font-semibold text-white mb-1">NIP transfers</h2>
        <p class="text-xs text-slate-100/80">
          Send money instantly to any Nigerian bank account with built-in tier and daily limits.
        </p>
        <button
          class="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-semibold"
        >
          <span>New transfer</span>
          <span>➜</span>
        </button>
      </div>

      <!-- Saved beneficiaries (mock) -->
      <div class="rounded-2xl border border-white/5 bg-slate-900/70 backdrop-blur-md p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-slate-100">Saved beneficiaries</h3>
          <button class="text-[11px] text-accent">Manage</button>
        </div>
        <div class="space-y-3">
          <div class="flex items-center justify-between text-xs" v-for="name in ['Sarah A.', 'Michael B.', 'Ade Bank']" :key="name">
            <div>
              <p class="font-medium text-slate-100">{{ name }}</p>
              <p class="text-[10px] text-slate-500">GTBank • ****1234</p>
            </div>
            <button class="px-3 py-1 rounded-full bg-white/5 text-[11px] text-slate-100">
              Send
            </button>
          </div>
        </div>
      </div>

      <!-- Recent transfers -->
      <div class="rounded-2xl border border-white/5 bg-slate-900/70 backdrop-blur-md p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-slate-100">Recent transfers</h3>
          <button class="text-[11px] text-accent">View all</button>
        </div>
        <div v-for="i in 3" :key="i" class="flex items-center justify-between py-2 border-t border-white/5 first:border-t-0">
          <div>
            <p class="text-xs font-medium text-slate-100">Transfer to Sarah {{ i }}</p>
            <p class="text-[10px] text-slate-500">Completed • NIP</p>
          </div>
          <p class="text-xs font-semibold text-rose-400">- ₦ 7,500</p>
        </div>
      </div>
    </section>
  </AppShell>
</template>



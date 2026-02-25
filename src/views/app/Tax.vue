<script setup>
import AppShell from '../../components/layout/AppShell.vue'
</script>

<template>
  <AppShell title="Tax & Compliance">
    <section class="space-y-4">
      <!-- Tax summary -->
      <div
        class="rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-xl p-5 shadow-lg shadow-indigo-500/10"
      >
        <div class="flex items-center justify-between mb-3">
          <div>
            <p class="text-xs text-slate-400">Current month income</p>
            <p class="text-xl font-semibold text-white">₦ 320,000.00</p>
          </div>
          <div class="text-right">
            <p class="text-xs text-slate-400">Est. tax liability</p>
            <p class="text-xl font-semibold text-white">₦ 12,800.00</p>
          </div>
        </div>
        <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-3">
          <div class="h-full bg-primary-soft w-2/3"></div>
        </div>
        <p class="mt-2 text-[11px] text-slate-500">65% of monthly tax threshold reached.</p>
      </div>

      <!-- Upcoming obligations -->
      <div class="rounded-2xl border border-white/5 bg-slate-900/70 backdrop-blur-md p-4">
        <h3 class="text-sm font-semibold text-slate-100 mb-2">Upcoming obligations</h3>
        <ul class="space-y-2 text-xs text-slate-300">
          <li>• Monthly tax remittance due in 7 days.</li>
          <li>• Auto-remittance: <span class="text-emerald-400 font-semibold">Enabled</span>.</li>
          <li>• TIN: <span class="text-slate-100">1234567890</span>.</li>
        </ul>
      </div>

      <!-- Tax records (mock) -->
      <div class="rounded-2xl border border-white/5 bg-slate-900/70 backdrop-blur-md p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-slate-100">Recent tax records</h3>
          <button class="text-[11px] text-accent">View all</button>
        </div>
        <div v-for="m in ['Jan 2026', 'Dec 2025', 'Nov 2025']" :key="m" class="flex items-center justify-between py-2 border-t border-white/5 first:border-t-0">
          <div>
            <p class="text-xs font-medium text-slate-100">{{ m }}</p>
            <p class="text-[10px] text-slate-500">Compliant • Paid</p>
          </div>
          <p class="text-xs font-semibold text-slate-100">₦ 18,500</p>
        </div>
      </div>
    </section>
  </AppShell>
</template>



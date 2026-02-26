<script setup>
import { ref } from 'vue'
import AppShell from '../../components/layout/AppShell.vue'
import TaxDetailModal from '../../components/ui/TaxDetailModal.vue'

const showDetailModal = ref(false)
const selectedRecord = ref(null)

const taxRecords = [
  { id: 'TX-772910', date: 'Jan 2026', amount: 18500, type: 'Income Tax', status: 'Paid' },
  { id: 'TX-772895', date: 'Dec 2025', amount: 15200, type: 'Income Tax', status: 'Paid' },
  { id: 'TX-772844', date: 'Nov 2025', amount: 14800, type: 'Income Tax', status: 'Paid' },
  { id: 'TX-772812', date: 'Oct 2025', amount: 16100, type: 'Income Tax', status: 'Paid' }
]

const openDetail = (record) => {
  selectedRecord.value = record
  showDetailModal.value = true
}
</script>

<template>
  <AppShell title="Tax & Compliance">
    <section class="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 px-2">
      <!-- Tax summary -->
      <div
        class="rounded-[2.5rem] border border-white/5 bg-slate-900/50 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden group"
      >
        <div class="absolute -right-10 -top-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
        
        <div class="relative z-10 flex items-center justify-between mb-8">
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Month Income</p>
            <p class="text-3xl font-black text-white tracking-tighter">₦ 320,000.00</p>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-xl">
            📈
          </div>
        </div>

        <div class="relative z-10 space-y-4">
          <div class="flex justify-between items-end">
             <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Tax Liability</p>
             <p class="text-xl font-black text-primary tracking-tight">₦ 12,800.00</p>
          </div>
          <div class="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
            <div class="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full shadow-[0_0_15px_rgba(var(--color-primary),0.5)] w-2/3"></div>
          </div>
          <p class="text-[10px] font-bold text-slate-500 italic">65% of monthly tax threshold reached for this period.</p>
        </div>
      </div>

      <!-- Upcoming obligations -->
      <div class="rounded-[2rem] border border-white/5 bg-white/5 backdrop-blur-md p-6 space-y-4">
        <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Upcoming Obligations</h3>
        <ul class="space-y-4">
          <li class="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
            <div class="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs">🔔</div>
            <p class="text-[11px] font-medium text-slate-300">Monthly Tax Remittance Due In <span class="text-white font-bold">7 Days</span></p>
          </li>
          <li class="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
            <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs">⚙️</div>
            <p class="text-[11px] font-medium text-slate-300">Auto-Remittance Status: <span class="text-emerald-400 font-black uppercase tracking-widest ml-1">Active</span></p>
          </li>
        </ul>
      </div>

      <!-- Tax records -->
      <div class="space-y-4">
        <div class="flex items-center justify-between px-4">
          <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Tax Records</h3>
          <button class="text-[10px] font-black text-primary uppercase tracking-widest">View Archives</button>
        </div>
        
        <div class="space-y-3">
          <button 
            v-for="record in taxRecords" 
            :key="record.id" 
            @click="openDetail(record)"
            class="w-full flex items-center justify-between p-5 bg-white/5 dark:bg-slate-900/50 backdrop-blur-md border border-white/5 rounded-[2rem] text-left transition-all active:scale-[0.98] group"
          >
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-lg border border-white/5 shadow-lg group-hover:scale-110 transition-transform">
                📄
              </div>
              <div>
                <p class="text-xs font-black text-slate-100 group-hover:text-primary transition-colors">{{ record.date }}</p>
                <p class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Compliant • {{ record.status }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-xs font-black text-slate-100">₦ {{ record.amount.toLocaleString() }}</p>
              <p class="text-[9px] font-black text-slate-600 uppercase tracking-tighter">{{ record.id }}</p>
            </div>
          </button>
        </div>
      </div>
    </section>

    <!-- Side Modal -->
    <TaxDetailModal 
      :show="showDetailModal"
      :record="selectedRecord"
      @close="showDetailModal = false"
    />
  </AppShell>
</template>



<script setup>
import { ref, computed, onMounted } from 'vue'
import AppShell from '../../components/layout/AppShell.vue'
import TaxDetailModal from '../../components/ui/TaxDetailModal.vue'
import { useTaxStore } from '../../stores/tax'

const taxStore = useTaxStore()
const showDetailModal = ref(false)
const selectedRecord = ref(null)

const openDetail = (record) => {
  selectedRecord.value = record
  showDetailModal.value = true
}

// Format number to NGN string
const formatNGN = (amount) => {
  return Number(amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })
}

// Format income type into readable label
const formatIncomeType = (type) => {
  const labels = {
    commission: 'Commission Income',
    gift_card_margin: 'Gift Card Margin',
    stablecoin_profit: 'Digital Asset Gain',
    other_income: 'Other Income',
  }
  return labels[type] || type
}

// Format period from month+year
const formatPeriod = (record) => {
  if (!record?.period_year) return '—'
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = record.period_month ? months[record.period_month - 1] : ''
  return [month, record.period_year].filter(Boolean).join(' ')
}

// Days until end of month (for obligation countdown)
const daysUntilMonthEnd = computed(() => {
  const now = new Date()
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return end.getDate() - now.getDate()
})

onMounted(() => {
  taxStore.loadTaxPage()
})
</script>

<template>
  <AppShell title="Tax &amp; Compliance">
    <section class="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 px-2">

      <!-- Loading skeleton -->
      <div v-if="taxStore.loading && !taxStore.dashboard" class="space-y-4">
        <div class="rounded-[2.5rem] border border-white/5 bg-slate-900/50 backdrop-blur-xl p-8 h-48 animate-pulse" />
        <div class="rounded-[2rem] border border-white/5 bg-white/5 p-6 h-28 animate-pulse" />
      </div>

      <!-- Tax summary card -->
      <div
        v-else
        class="rounded-[2.5rem] border border-white/5 bg-slate-900/50 backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden group"
      >
        <div class="absolute -right-10 -top-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />

        <div class="relative z-10 flex items-center justify-between mb-8">
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Month Income</p>
            <p class="text-3xl font-black text-white tracking-tighter">
              ₦ {{ formatNGN(taxStore.currentMonthIncome) }}
            </p>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-xl">
            📈
          </div>
        </div>

        <div class="relative z-10 space-y-4">
          <div class="flex justify-between items-end">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Tax Liability</p>
            <p class="text-xl font-black text-primary tracking-tight">₦ {{ formatNGN(taxStore.estimatedTax) }}</p>
          </div>
          <div class="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
            <div
              class="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full shadow-[0_0_15px_rgba(var(--color-primary),0.5)] transition-all duration-700"
              :style="{ width: taxStore.taxThresholdPercent + '%' }"
            />
          </div>
          <p class="text-[10px] font-bold text-slate-500 italic">
            {{ taxStore.taxThresholdPercent }}% of monthly tax threshold reached for this period.
          </p>
        </div>

        <!-- VAT / EMTL breakdown if available -->
        <div
          v-if="taxStore.dashboard?.tax_by_type"
          class="relative z-10 mt-6 grid grid-cols-3 gap-3 pt-6 border-t border-white/5"
        >
          <div
            v-for="(val, key) in taxStore.dashboard.tax_by_type"
            :key="key"
            class="bg-white/5 rounded-2xl p-3 border border-white/5"
          >
            <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
              {{ key.toUpperCase() }}
            </p>
            <p class="text-xs font-black text-white">₦ {{ formatNGN(val) }}</p>
          </div>
        </div>
      </div>

      <!-- Upcoming obligations -->
      <div class="rounded-[2rem] border border-white/5 bg-white/5 backdrop-blur-md p-6 space-y-4">
        <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Upcoming Obligations</h3>
        <ul class="space-y-4">
          <li class="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
            <div class="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs">🔔</div>
            <p class="text-[11px] font-medium text-slate-300">
              Monthly Tax Remittance Due In
              <span class="text-white font-bold">{{ daysUntilMonthEnd }} Days</span>
            </p>
          </li>
          <li class="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
            <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs">⚙️</div>
            <p class="text-[11px] font-medium text-slate-300">
              Auto-Remittance Status:
              <span
                :class="taxStore.autoRemittanceEnabled ? 'text-emerald-400' : 'text-rose-400'"
                class="font-black uppercase tracking-widest ml-1"
              >
                {{ taxStore.autoRemittanceEnabled ? 'Active' : 'Inactive' }}
              </span>
            </p>
          </li>
        </ul>
      </div>

      <!-- Tax records -->
      <div class="space-y-4">
        <div class="flex items-center justify-between px-4">
          <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Tax Records</h3>
          <button class="text-[10px] font-black text-primary uppercase tracking-widest">View Archives</button>
        </div>

        <!-- Loading shimmer rows -->
        <div v-if="taxStore.loading && !taxStore.records.length" class="space-y-3">
          <div
            v-for="n in 4"
            :key="n"
            class="h-20 rounded-[2rem] bg-white/5 animate-pulse"
          />
        </div>

        <!-- Empty state -->
        <div
          v-else-if="!taxStore.records.length"
          class="text-center py-12 text-slate-500 text-xs font-bold uppercase tracking-widest"
        >
          No tax records found.
        </div>

        <!-- Record list -->
        <div v-else class="space-y-3">
          <button
            v-for="record in taxStore.records"
            :key="record.id"
            @click="openDetail(record)"
            class="w-full flex items-center justify-between p-5 bg-white/5 dark:bg-slate-900/50 backdrop-blur-md border border-white/5 rounded-[2rem] text-left transition-all active:scale-[0.98] group"
          >
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-lg border border-white/5 shadow-lg group-hover:scale-110 transition-transform">
                📄
              </div>
              <div>
                <p class="text-xs font-black text-slate-100 group-hover:text-primary transition-colors">
                  {{ formatPeriod(record) }}
                </p>
                <p class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  {{ formatIncomeType(record.income_type) }}
                </p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-xs font-black text-slate-100">₦ {{ formatNGN(record.income_amount) }}</p>
              <p class="text-[9px] font-bold text-emerald-400 uppercase tracking-tighter">
                Tax: ₦ {{ formatNGN(record.tax_amount) }}
              </p>
            </div>
          </button>
        </div>

        <!-- Error state -->
        <div
          v-if="taxStore.error"
          class="text-center py-4 text-rose-400 text-xs font-bold"
        >
          {{ taxStore.error }}
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

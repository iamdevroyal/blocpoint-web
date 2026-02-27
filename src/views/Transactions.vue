<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../components/layout/AppShell.vue'

const router = useRouter()
const activeFilter = ref('All')
const filters = ['All', 'Inflow', 'Outflow', 'Bills', 'Assets']

const transactions = [
  { id: 1, type: 'Outbound', name: 'Michael Scott', amount: '-₦5,000.00', time: '10:45 AM', date: 'Today', status: 'Completed', icon: '📤', category: 'Outflow', ref: 'TXN-9921021', method: 'Bank Transfer' },
  { id: 2, type: 'Deposit', name: 'Wallet Top-up', amount: '+₦20,000.00', time: '08:20 AM', date: 'Yesterday', status: 'Completed', icon: '📥', category: 'Inflow', ref: 'TXN-9921022', method: 'Virtual Account' },
  { id: 3, type: 'Bill', name: 'Airtel Airtime', amount: '-₦2,000.00', time: '04:15 PM', date: '2 days ago', status: 'Completed', icon: '📱', category: 'Bills', ref: 'TXN-9921023', method: 'Wallet Pay' },
  { id: 4, type: 'Payment', name: 'Netflix Subscription', amount: '-₦4,400.00', time: '11:00 AM', date: 'Last week', status: 'Completed', icon: '🎬', category: 'Outflow', ref: 'TXN-9921024', method: 'Debit Card' },
  { id: 5, type: 'Deposit', name: 'Transfer from Mom', amount: '+₦50,000.00', time: '09:00 AM', date: 'Last week', status: 'Completed', icon: '📥', category: 'Inflow', ref: 'TXN-9921025', method: 'Bank Transfer' },
  { id: 6, type: 'Asset', name: 'USDT Purchase', amount: '-₦150,000.00', time: '02:30 PM', date: 'Today', status: 'Completed', icon: '🪙', category: 'Assets', ref: 'TXN-9921026', method: 'P2P Trading' },
  { id: 7, type: 'GiftCard', name: 'Amazon Gift Card (US)', amount: '-₦45,000.00', time: '09:15 AM', date: 'Yesterday', status: 'Pending', icon: '🎁', category: 'Assets', ref: 'TXN-9921027', method: 'E-Wallet' },
]

const filteredTransactions = computed(() => {
  if (activeFilter.value === 'All') return transactions
  return transactions.filter(tx => tx.category === activeFilter.value)
})

const selectedTx = ref(null)
const showDetail = ref(false)
const isDownloadingReceipt = ref(false)
const receiptProgress = ref(0)
const showExportModal = ref(false)
const isExporting = ref(false)
const exportProgress = ref(0)
const exportRange = ref('Last 7 Days')
const exportChannel = ref('Download')
const customFromDate = ref('')
const customToDate = ref('')

const openDetail = (tx) => {
  selectedTx.value = tx
  showDetail.value = true
  receiptProgress.value = 0
}

const handleReceiptDownload = () => {
  isDownloadingReceipt.value = true
  receiptProgress.value = 0
  const interval = setInterval(() => {
    receiptProgress.value += 5
    if (receiptProgress.value >= 100) {
      clearInterval(interval)
      setTimeout(() => {
        isDownloadingReceipt.value = false
      }, 500)
    }
  }, 50)
}

const handleStatementExport = () => {
  isExporting.value = true
  exportProgress.value = 0
  const interval = setInterval(() => {
    exportProgress.value += 10
    if (exportProgress.value >= 100) {
      clearInterval(interval)
      setTimeout(() => {
        isExporting.value = false
        showExportModal.value = false
      }, 500)
    }
  }, 100)
}

const reportIssue = () => {
  if (!selectedTx.value) return
  router.push({
    path: '/app/support',
    query: { ref: selectedTx.value.ref, subject: `Issue with ${selectedTx.value.name}` }
  })
}

const goBack = () => router.back()
</script>

<template>
  <AppShell title="Transactions">
    <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <!-- Header -->
      <div class="flex items-center justify-between px-2">
        <div class="flex items-center gap-4">
          <button @click="goBack" class="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm active:scale-90 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div>
            <h2 class="text-lg font-bold text-slate-800 dark:text-white">Recent Activity</h2>
            <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">History & Statements</p>
          </div>
        </div>
        <button @click="showExportModal = true" class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center active:scale-90 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </button>
      </div>

      <!-- Filters -->
      <div class="flex gap-2 overflow-x-auto scrollbar-hide px-2">
        <button 
          v-for="filter in filters" 
          :key="filter"
          @click="activeFilter = filter"
          class="px-5 py-2.5 rounded-full text-[11px] font-bold transition-all whitespace-nowrap border"
          :class="activeFilter === filter ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30' : 'bg-white/50 dark:bg-slate-900/50 text-slate-500 border-slate-200 dark:border-white/10'"
        >
          {{ filter }}
        </button>
      </div>

      <!-- Transactions List -->
      <div class="space-y-4">
        <div class="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden">
          <div v-for="(tx, idx) in filteredTransactions" :key="tx.id" 
            @click="openDetail(tx)"
            class="flex items-center justify-between p-5 transition-colors hover:bg-slate-50 dark:hover:bg-white/5 group ring-inset cursor-pointer active:scale-[0.99] transition-all"
            :class="{ 'border-b border-slate-100 dark:border-white/5': idx !== filteredTransactions.length - 1 }"
          >
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-2xl shadow-sm border border-black/5 dark:border-white/5 group-hover:scale-110 transition-transform">
                {{ tx.icon }}
              </div>
              <div>
                <h4 class="text-sm font-bold text-slate-800 dark:text-white">{{ tx.name }}</h4>
                <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter">{{ tx.time }} • {{ tx.date }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-bold tracking-tight" :class="tx.amount.startsWith('+') ? 'text-emerald-500' : 'text-slate-800 dark:text-white'">{{ tx.amount }}</p>
              <p class="text-[9px] font-bold text-emerald-500/70 uppercase tracking-widest">{{ tx.status }}</p>
            </div>
          </div>
        </div>
        
        <div v-if="filteredTransactions.length === 0" class="py-20 text-center animate-in fade-in duration-500">
          <div class="text-4xl mb-4 opacity-20">📂</div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">No transactions found</p>
        </div>
      </div>
    </div>

    <!-- Transaction Detail Drawer (Right Modal) -->
    <Transition name="drawer-right">
      <div v-if="showDetail" class="fixed inset-0 z-[150] flex justify-end">
        <div class="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" @click="showDetail = false"></div>
        <div class="relative w-[85%] max-w-sm h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-white/10 overflow-hidden animate-in slide-in-from-right duration-500">
          <div class="p-8 space-y-8 flex-1 overflow-y-auto pt-12">
            <!-- Header -->
            <div class="flex items-start justify-between">
              <div>
                <h3 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">Transaction Detail</h3>
                <p class="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">{{ selectedTx.method }}</p>
              </div>
              <button @click="showDetail = false" class="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 border border-black/5 dark:border-white/5">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <!-- Amount Card -->
            <div class="p-8 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-slate-100 dark:border-white/5 text-center space-y-1 relative overflow-hidden group">
              <div class="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">Amount Transferred</p>
              <p class="text-4xl font-black tracking-tighter relative z-10" :class="selectedTx.amount.startsWith('+') ? 'text-emerald-500' : 'text-slate-800 dark:text-white'">
                {{ selectedTx.amount }}
              </p>
              <div class="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full mt-4 relative z-10">
                <div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span class="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Successful</span>
              </div>
              
              <!-- Download Progress Overlay -->
              <Transition name="fade">
                <div v-if="isDownloadingReceipt" class="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 space-y-3">
                  <div class="w-full h-1 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div class="h-full bg-primary transition-all duration-300" :style="{ width: receiptProgress + '%' }"></div>
                  </div>
                  <span class="text-[9px] font-black text-primary uppercase tracking-widest">Generating Receipt {{ receiptProgress }}%</span>
                </div>
              </Transition>
            </div>

            <!-- Details List -->
            <div class="space-y-6 pt-4">
              <div v-for="item in [
                { label: 'Recipient/Source', value: selectedTx.name },
                { label: 'Reference Number', value: selectedTx.ref },
                { label: 'Date & Time', value: selectedTx.date + ' • ' + selectedTx.time },
                { label: 'Category', value: selectedTx.category },
                { label: 'Payment Method', value: selectedTx.method }
              ]" :key="item.label" class="flex justify-between items-center group">
                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ item.label }}</span>
                <span class="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors">{{ item.value }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="pt-8 space-y-3">
              <button 
                @click="handleReceiptDownload"
                :disabled="isDownloadingReceipt"
                class="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-[0.2em] disabled:opacity-50"
              >
                {{ isDownloadingReceipt ? 'Processing...' : 'Download Receipt' }}
              </button>
              <button 
                @click="reportIssue"
                class="w-full h-14 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-[10px] font-black rounded-2xl active:scale-95 transition-all uppercase tracking-[0.2em]"
              >
                Report Issue
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
    <!-- Statement Export Modal (Center Modal) -->
    <Transition name="zoom">
      <div v-if="showExportModal" class="fixed inset-0 z-[200] flex items-center justify-center p-6">
        <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-md" @click="showExportModal = false"></div>
        <div class="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
          <div class="p-8 space-y-6">
            <div class="text-center space-y-2">
              <div class="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">📂</div>
              <h3 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">Export Statement</h3>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Choose your preferred range and channel</p>
            </div>

            <!-- Range Selection -->
            <div class="space-y-3">
              <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Select Period</label>
              <div class="grid grid-cols-2 gap-3">
                <button 
                  v-for="range in ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Custom']" 
                  :key="range"
                  @click="exportRange = range"
                  class="h-12 rounded-xl text-[10px] font-black transition-all border uppercase tracking-widest"
                  :class="exportRange === range ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-500'"
                >
                  {{ range }}
                </button>
              </div>
            </div>

            <!-- Custom Date Inputs -->
            <Transition name="fade">
              <div v-if="exportRange === 'Custom'" class="grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-300">
                <div class="space-y-2">
                  <label class="text-[8px] font-black text-slate-400 uppercase tracking-widest block px-1">From</label>
                  <input 
                    v-model="customFromDate"
                    type="date" 
                    class="w-full h-12 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl px-3 text-[10px] font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:color-white"
                  />
                </div>
                <div class="space-y-2">
                  <label class="text-[8px] font-black text-slate-400 uppercase tracking-widest block px-1">To</label>
                  <input 
                    v-model="customToDate"
                    type="date" 
                    class="w-full h-12 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl px-3 text-[10px] font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:color-white"
                  />
                </div>
              </div>
            </Transition>

            <!-- Export Channel -->
            <div class="space-y-3">
              <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-1">Export Channel</label>
              <div class="flex gap-3">
                <button 
                  v-for="channel in ['Download', 'WhatsApp', 'Email']" 
                  :key="channel"
                  @click="exportChannel = channel"
                  class="flex-1 h-12 rounded-xl text-[10px] font-black transition-all border uppercase tracking-widest"
                  :class="exportChannel === channel ? 'bg-slate-900 dark:bg-white border-transparent text-white dark:text-slate-900 shadow-xl' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-500'"
                >
                  {{ channel }}
                </button>
              </div>
            </div>

            <div class="pt-4 relative">
              <!-- Export Progress -->
              <Transition name="fade">
                <div v-if="isExporting" class="absolute inset-x-0 bottom-full mb-6 space-y-2">
                  <div class="flex justify-between items-center text-[9px] font-black text-primary uppercase tracking-widest">
                    <span>Compiling Data...</span>
                    <span>{{ exportProgress }}%</span>
                  </div>
                  <div class="w-full h-1 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div class="h-full bg-primary transition-all duration-300" :style="{ width: exportProgress + '%' }"></div>
                  </div>
                </div>
              </Transition>

              <button 
                @click="handleStatementExport"
                :disabled="isExporting"
                class="w-full h-16 bg-primary text-white text-[11px] font-black rounded-[1.25rem] shadow-xl shadow-primary/30 active:scale-95 transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <svg v-if="!isExporting" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span v-if="isExporting">Exporting...</span>
                <span v-else>Generate Statement</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </AppShell>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

.drawer-right-enter-active, .drawer-right-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.drawer-right-enter-from, .drawer-right-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.zoom-enter-active, .zoom-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.zoom-enter-from, .zoom-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

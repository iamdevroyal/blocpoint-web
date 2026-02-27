<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../../components/layout/AppShell.vue'
import TransactionStatusModal from '../../components/ui/TransactionStatusModal.vue'

const router = useRouter()
const step = ref(1)
const showStatus = ref(false)
const acceptedTandC = ref(false)

const cardDesigns = [
  { id: 1, name: 'USD Virtual Card', icon: '🇺🇸', currency: 'USD', color: 'bg-blue-500/10 text-blue-500' },
  { id: 2, name: 'EURO Virtual Card', icon: '🇪🇺', currency: 'EUR', color: 'bg-emerald-500/10 text-emerald-500' },
  { id: 3, name: 'Pounds Virtual Card', icon: '🇬🇧', currency: 'GBP', color: 'bg-rose-500/10 text-rose-500' },
]

const selectedCard = ref(cardDesigns[0])

const fees = [
  { label: 'Issuance Fee (Incl. VAT)', value: '₦1,000.00' },
  { label: 'Maintenance Fee', value: 'FREE' },
  { label: 'Total Payment', value: '₦1,000.00', isTotal: true },
]

const handleConfirm = () => {
  if (!acceptedTandC.value) return
  showStatus.value = true
}

const goBack = () => {
  if (step.value > 1) step.value--
  else router.back()
}
</script>

<template>
  <AppShell title="Card Application">
    <div class="w-full max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <!-- Header -->
      <div class="flex items-center gap-4 px-2">
        <button @click="goBack" class="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 transition-transform active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h2 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">Card Application</h2>
      </div>

      <!-- Card Selection (Icons) -->
      <div class="space-y-6 px-4">
        <div class="flex justify-center gap-6">
          <button v-for="card in cardDesigns" :key="card.id"
            @click="selectedCard = card"
            class="flex flex-col items-center gap-3 transition-all active:scale-90"
          >
            <div 
              class="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl border-2 transition-all shadow-sm"
              :class="[
                card.color,
                selectedCard.id === card.id 
                  ? 'border-primary bg-primary/20 scale-110 shadow-primary/30 rotate-3' 
                  : 'border-slate-100 dark:border-white/5 opacity-40 grayscale'
              ]"
            >
              {{ card.icon }}
            </div>
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-500 transition-colors" :class="{ 'text-primary': selectedCard.id === card.id }">
              {{ card.currency }}
            </span>
          </button>
        </div>
        
        <div class="text-center">
            <span class="px-5 py-2.5 bg-slate-100 dark:bg-white/5 rounded-full text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-widest shadow-sm">
                {{ selectedCard.name }}
            </span>
        </div>
      </div>

      <!-- Account Info -->
      <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-white/5 space-y-6">
        <div class="space-y-4">
            <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Account Information</h3>
            <div class="space-y-3 p-5 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5">
                <div class="flex justify-between items-center">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Account Name</span>
                    <span class="text-xs font-black text-slate-800 dark:text-white truncate max-w-[150px]">nnaemeka royal njoku</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Account No.</span>
                    <span class="text-xs font-black text-slate-800 dark:text-white">703 514 8792</span>
                </div>
            </div>
        </div>

        <div class="space-y-4">
            <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">FEE and Charges</h3>
            <div class="space-y-4 p-5 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5">
                <div v-for="fee in fees" :key="fee.label" class="flex justify-between items-center">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{{ fee.label }}</span>
                    <span class="text-xs font-black" :class="fee.isTotal ? 'text-primary' : 'text-slate-800 dark:text-white'">{{ fee.value }}</span>
                </div>
            </div>
        </div>

        <!-- T&C -->
        <label class="flex items-center gap-3 px-2 group cursor-pointer">
            <div class="relative">
                <input 
                    type="checkbox" 
                    v-model="acceptedTandC"
                    class="peer appearance-none w-6 h-6 rounded-lg bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 checked:bg-emerald-500 transition-all"
                >
                <svg v-if="acceptedTandC" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="absolute inset-0 m-auto pointer-events-none transition-all"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-tight">
                Click the button below to accept <span class="text-emerald-500 font-black">Terms & Conditions</span>
            </span>
        </label>

        <!-- CTA -->
        <button 
            @click="handleConfirm"
            :disabled="!acceptedTandC"
            class="w-full h-16 bg-emerald-500 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-[1.25rem] shadow-xl shadow-emerald-500/30 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
        >
            Confirm
        </button>
      </div>
    </div>

    <!-- Status Modal -->
    <TransactionStatusModal 
      v-if="showStatus"
      :show="showStatus"
      status="success"
      title="Request Submitted"
      message="Your virtual card request has been submitted. We'll notify you once it's approved!"
      @action="router.push('/app/cards')"
      @close="showStatus = false"
    />
  </AppShell>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>

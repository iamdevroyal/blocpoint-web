<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../components/layout/AppShell.vue'
import TransactionStatusModal from '../components/ui/TransactionStatusModal.vue'

const router = useRouter()
const currentStep = ref(0) // 0: Discovery, 1: Amount/Terms, 2: Confirmation
const isProcessing = ref(false)
const showStatus = ref(false)
const statusType = ref('success')

// Mock user KYC level (In real app, this comes from a user store)
const kycLevel = ref(2) 

// Application Logic
const loanAmount = ref(50000)
const loanDuration = ref(3) // Months
const interestRate = 0.05 // 5% flat per month

const maxLimit = 500000
const minLimit = 5000

const stats = [
  { label: 'Available Limit', value: kycLevel.value >= 2 ? '₦500,000' : '₦0', icon: '💰' },
  { label: 'Active Loans', value: '0', icon: '📄' },
  { label: 'Credit Score', value: kycLevel.value >= 2 ? '780' : 'Unavailable', icon: '📈' },
]

const totalInterest = computed(() => Number(loanAmount.value) * interestRate * Number(loanDuration.value))
const totalRepayment = computed(() => Number(loanAmount.value) + totalInterest.value)
const monthlyRepayment = computed(() => totalRepayment.value / Number(loanDuration.value))

const formattedAmount = (amt) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amt)

const nextStep = () => {
  if (kycLevel.value < 2) return
  if (currentStep.value < 2) currentStep.value++
}

const prevStep = () => {
  if (currentStep.value > 0) currentStep.value--
  else router.back()
}

const submitApplication = () => {
  isProcessing.value = true
  // Simulate banking system delay
  setTimeout(() => {
    isProcessing.value = false
    statusType.value = 'success'
    showStatus.value = true
  }, 2500)
}

const handleStatusClose = () => {
  showStatus.value = false
  router.push('/app/dashboard')
}
</script>

<template>
  <AppShell title="Micro-Lending">
    <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 px-2">
      
      <!-- Step Header -->
      <div class="flex items-center justify-between px-2">
        <div class="flex items-center gap-4">
          <button @click="prevStep" class="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm active:scale-90 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div>
            <h2 class="text-lg font-black text-slate-800 dark:text-white tracking-tight">
              {{ currentStep === 0 ? 'Quick Cash' : (currentStep === 1 ? 'Configure' : 'Review') }}
            </h2>
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              {{ currentStep === 0 ? 'Micro Lending' : `Step ${currentStep} of 2` }}
            </p>
          </div>
        </div>
        
        <!-- Progress Indicator -->
        <div v-if="currentStep > 0" class="flex gap-1.5">
          <div v-for="i in 2" :key="i" class="w-8 h-1.5 rounded-full transition-all duration-500" :class="i <= currentStep ? 'bg-primary' : 'bg-slate-200 dark:bg-white/10'"></div>
        </div>
      </div>

      <!-- STEP 0: DISCOVERY -->
      <template v-if="currentStep === 0">
        <!-- Credit Stats -->
        <div class="grid grid-cols-3 gap-3">
          <div v-for="stat in stats" :key="stat.label" class="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/5 text-center shadow-sm">
            <span class="text-xl mb-2 block">{{ stat.icon }}</span>
            <p class="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">{{ stat.label }}</p>
            <p class="text-[10px] font-black text-slate-800 dark:text-white">{{ stat.value }}</p>
          </div>
        </div>

        <!-- Main Loan Card -->
        <div class="p-8 bg-slate-950 text-white rounded-[3rem] relative overflow-hidden shadow-2xl group">
          <div class="absolute -right-8 -top-8 w-40 h-40 bg-primary/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
          <div class="relative z-10 text-center space-y-6">
            <div class="space-y-2">
              <h3 class="text-xs font-black text-primary uppercase tracking-[0.2em]">
                {{ kycLevel >= 2 ? 'Ready for Withdrawal' : 'Access Restricted' }}
              </h3>
              <p class="text-4xl font-black tracking-tight" :class="{ 'opacity-20 blur-sm': kycLevel < 2 }">₦100,000</p>
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full" :class="kycLevel >= 2 ? 'bg-white/10 text-white' : 'bg-rose-500/20 text-rose-500'">
                <span class="w-1.5 h-1.5 rounded-full" :class="kycLevel >= 2 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'"></span>
                <span class="text-[9px] font-bold uppercase tracking-widest">
                  {{ kycLevel >= 2 ? 'Pre-Approved Agent' : 'Upgrade to Tier 2' }}
                </span>
              </div>
            </div>
            
            <button 
              @click="kycLevel >= 2 ? nextStep() : router.push('/app/settings/kyc')" 
              class="w-full h-14 text-white text-[10px] font-black rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-[0.2em]"
              :class="kycLevel >= 2 ? 'bg-primary shadow-primary/20' : 'bg-rose-500 shadow-rose-500/20'"
            >
              {{ kycLevel >= 2 ? 'Get Instant Cash' : 'Complete KYC Verification' }}
            </button>
          </div>
        </div>

        <!-- Info Cards -->
        <div v-if="kycLevel >= 2" class="p-6 bg-amber-500/5 border border-amber-500/10 rounded-[2.5rem] flex gap-4">
          <div class="text-2xl">⚡</div>
          <p class="text-[10px] font-medium text-amber-600 uppercase tracking-widest leading-loose">Approval time is less than 60 seconds for verified Tier 2 agents. Funds are disbursed instantly to your wallet.</p>
        </div>
        <div v-else class="p-6 bg-blue-500/5 border border-blue-500/10 rounded-[2.5rem] flex gap-4">
          <div class="text-2xl">ℹ️</div>
          <p class="text-[10px] font-medium text-blue-500 uppercase tracking-widest leading-loose">Loans are exclusively available to Tier 2 and Tier 3 verified agents. Complete your verification to unlock credit.</p>
        </div>
      </template>

      <!-- STEP 1: CONFIGURE -->
      <template v-else-if="currentStep === 1">
        <div class="space-y-6">
          <!-- Amount Slider -->
          <div class="p-8 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-sm space-y-8">
            <div class="text-center space-y-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">How much do you need?</label>
              <p class="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{{ formattedAmount(loanAmount) }}</p>
            </div>
            
            <input 
              type="range" 
              v-model.number="loanAmount" 
              :min="minLimit" 
              :max="maxLimit" 
              step="1000"
              class="w-full h-2 bg-slate-100 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            
            <div class="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Min {{ formattedAmount(minLimit) }}</span>
              <span>Max {{ formattedAmount(maxLimit) }}</span>
            </div>
          </div>

          <!-- Duration Grid -->
          <div class="space-y-4">
            <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Repayment Plan</h3>
            <div class="grid grid-cols-3 gap-3">
              <button 
                v-for="m in [1, 3, 6]" 
                :key="m"
                @click="loanDuration = m"
                class="p-4 rounded-[1.5rem] border-2 transition-all flex flex-col items-center gap-1"
                :class="loanDuration === m ? 'bg-primary/5 border-primary' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5'"
              >
                <span class="text-sm font-black" :class="loanDuration === m ? 'text-primary' : 'text-slate-800 dark:text-white'">{{ m }}</span>
                <span class="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{{ m === 1 ? 'Month' : 'Months' }}</span>
              </button>
            </div>
          </div>

          <!-- Breakdown Card -->
          <div class="p-6 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-slate-100 dark:border-white/10 space-y-4">
            <div class="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest opacity-60">
              <span>Monthly Interest</span>
              <span>5% (Flat)</span>
            </div>
            <div class="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
              <span class="opacity-60">Total Repayment</span>
              <span class="text-slate-800 dark:text-white">{{ formattedAmount(totalRepayment) }}</span>
            </div>
            <div class="pt-4 border-t border-slate-200 dark:border-white/10 flex justify-between items-center">
              <span class="text-[10px] font-black uppercase tracking-widest text-primary">Monthly Installment</span>
              <span class="text-lg font-black text-primary">{{ formattedAmount(monthlyRepayment) }}</span>
            </div>
          </div>

          <button @click="nextStep" class="w-full h-14 bg-primary text-white text-[10px] font-black rounded-2xl uppercase tracking-[0.2em] shadow-xl shadow-primary/20 active:scale-95 transition-all">
            Continue to Review
          </button>
        </div>
      </template>

      <!-- STEP 2: REVIEW -->
      <template v-else-if="currentStep === 2">
        <div class="space-y-6">
          <div class="p-8 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-sm space-y-6">
            <div class="text-center space-y-1">
              <h3 class="text-lg font-black text-slate-800 dark:text-white tracking-tight leading-none">Loan Offer Review</h3>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Please confirm your selection</p>
            </div>

            <div class="space-y-3">
              <div class="flex justify-between items-center p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Requested Amount</span>
                <span class="text-xs font-black text-slate-800 dark:text-white">{{ formattedAmount(loanAmount) }}</span>
              </div>
              <div class="flex justify-between items-center p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration</span>
                <span class="text-xs font-black text-slate-800 dark:text-white">{{ loanDuration }} Months</span>
              </div>
              <div class="flex justify-between items-center p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Interest</span>
                <span class="text-xs font-black text-rose-500">{{ formattedAmount(totalInterest) }}</span>
              </div>
              <div class="flex justify-between items-center p-5 bg-primary/10 rounded-2xl border-2 border-primary/20">
                <span class="text-[10px] font-black text-primary uppercase tracking-widest">You will receive</span>
                <span class="text-lg font-black text-primary">{{ formattedAmount(loanAmount) }}</span>
              </div>
            </div>

            <div class="p-5 bg-rose-500/5 rounded-2xl border border-rose-500/10 flex gap-3">
              <span class="text-lg">⚠️</span>
              <p class="text-[9px] font-medium text-rose-500 uppercase tracking-widest leading-relaxed">
                By clicking "Accept & Receive Funds", you agree to the automatic deduction of {{ formattedAmount(monthlyRepayment) }} from your wallet every month for {{ loanDuration }} months.
              </p>
            </div>
          </div>

          <button 
            @click="submitApplication"
            :disabled="isProcessing"
            class="w-full h-14 bg-primary text-white text-[10px] font-black rounded-2xl uppercase tracking-[0.2em] shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span v-if="!isProcessing">Accept & Receive Funds</span>
            <template v-else>
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span>Processing...</span>
            </template>
          </button>
        </div>
      </template>

    </div>

    <!-- Status Modal -->
    <TransactionStatusModal
      :show="showStatus"
      :type="statusType"
      title="Request Submitted"
      :message="`Your loan request of ${formattedAmount(loanAmount)} has been submitted successfully. It is now pending approval by our credit team.`"
      @close="handleStatusClose"
    />
  </AppShell>
</template>

<style scoped>
/* Range slider custom styling */
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 24px;
  width: 24px;
  border-radius: 50%;
  background: #6366f1;
  cursor: pointer;
  border: 4px solid white;
  box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
}

.tracking-tight {
  letter-spacing: -0.025em;
}
</style>

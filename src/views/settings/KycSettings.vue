<script setup>
import { ref, computed, watch } from 'vue'
import AppShell from '../../components/layout/AppShell.vue'

const currentLevel = ref(1) // Start at Level 1 for demo
const showUpgradeFlow = ref(false)
const upgradeStep = ref(1)
const isProcessing = ref(false)
const bvn = ref('')

// Verification Assets
const idDocument = ref(null)
const facePhoto = ref(null)
const videoStream = ref(null)
const videoEl = ref(null)
const isCameraActive = ref(false)

const handleBvnInput = (e) => {
  const val = e.target.value.replace(/\D/g, '')
  bvn.value = val.slice(0, 11)
}

const handleFileUpload = (e) => {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (res) => { idDocument.value = res.target.result }
    reader.readAsDataURL(file)
  }
}

const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'user', width: 400, height: 400 } 
    })
    videoStream.value = stream
    if (videoEl.value) videoEl.value.srcObject = stream
    isCameraActive.value = true
  } catch (err) {
    alert('Camera access denied. Please enable camera permissions.')
  }
}

const stopCamera = () => {
  if (videoStream.value) {
    videoStream.value.getTracks().forEach(track => track.stop())
    videoStream.value = null
  }
  isCameraActive.value = false
}

const capturePhoto = () => {
  const canvas = document.createElement('canvas')
  canvas.width = videoEl.value.videoWidth
  canvas.height = videoEl.value.videoHeight
  canvas.getContext('2d').drawImage(videoEl.value, 0, 0)
  facePhoto.value = canvas.toDataURL('image/jpeg')
  stopCamera()
}

const levels = computed(() => [
  { 
    id: 1, 
    name: 'Level 1', 
    status: currentLevel.value >= 1 ? 'Verified' : 'Pending', 
    limit: '₦50,000 daily', 
    req: 'Basic Profile + Phone',
  },
  { 
    id: 2, 
    name: 'Level 2', 
    status: currentLevel.value >= 2 ? 'Verified' : 'Not Verified', 
    limit: '₦500,000 daily', 
    req: 'BVN + Address',
  },
  { 
    id: 3, 
    name: 'Level 3', 
    status: currentLevel.value >= 3 ? 'Verified' : 'Not Verified', 
    limit: 'Unlimited', 
    req: 'Valid ID + Face Match',
  }
])

const nextLevel = computed(() => currentLevel.value < 3 ? currentLevel.value + 1 : null)

const startUpgrade = () => {
  if (!nextLevel.value) return
  upgradeStep.value = 1
  showUpgradeFlow.value = true
}

const processUpgrade = () => {
  isProcessing.value = true
  // Simulate verification delay
  setTimeout(() => {
    isProcessing.value = false
    if (nextLevel.value === 2) {
      if (upgradeStep.value < 2) {
        upgradeStep.value++
      } else {
        completeUpgrade()
      }
    } else {
      // Level 3 logic
      if (upgradeStep.value < 2) {
        upgradeStep.value++
      } else {
        completeUpgrade()
      }
    }
  }, 2000)
}

const completeUpgrade = () => {
  currentLevel.value++
  showUpgradeFlow.value = false
  stopCamera()
}

// Ensure camera stops when closing modal
watch(showUpgradeFlow, (val) => {
  if (!val) stopCamera()
})
</script>

<template>
  <AppShell title="Account Tier & KYC">
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 px-2">
      
      <!-- Current Status Card -->
      <div class="p-8 bg-gradient-to-br from-primary/10 to-indigo-500/10 border border-primary/20 rounded-[2.5rem] relative overflow-hidden group">
        <div class="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
        <div class="relative z-10 space-y-4 text-center">
          <div class="w-16 h-16 rounded-full bg-white dark:bg-slate-800 border-2 border-primary/30 flex items-center justify-center text-2xl shadow-xl mx-auto mb-2">🤴</div>
          <div class="space-y-1">
            <span class="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Active Tier Status</span>
            <h2 class="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Level {{ currentLevel }} Account</h2>
            <p class="text-[11px] font-bold text-slate-500 dark:text-slate-400">Daily transaction limit: <span class="text-primary">{{ levels[currentLevel-1].limit }}</span></p>
          </div>
        </div>
      </div>

      <!-- Compliance Timeline -->
      <div class="space-y-4">
        <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">Verification Levels</h3>
        <div class="space-y-4">
          <div 
            v-for="lv in levels" 
            :key="lv.id"
            class="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 flex items-center justify-between gap-4 transition-all"
            :class="{ 
              'ring-2 ring-primary ring-inset shadow-xl': lv.id === currentLevel,
              'opacity-50 grayscale': lv.id > currentLevel
            }"
          >
            <div class="flex items-center gap-5">
              <div class="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-center text-xl font-black transition-all"
                :class="lv.status === 'Verified' ? 'text-emerald-500 bg-emerald-500/5' : 'text-slate-400'"
              >
                <svg v-if="lv.status === 'Verified'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                <span v-else>{{ lv.id }}</span>
              </div>
              <div class="space-y-0.5">
                <h4 class="text-sm font-bold text-slate-800 dark:text-white tracking-tight">{{ lv.name }}</h4>
                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{{ lv.req }}</p>
              </div>
            </div>
            
            <div class="text-right shrink-0">
              <p class="text-[10px] font-black tracking-tight" :class="lv.status === 'Verified' ? 'text-emerald-500' : 'text-slate-400'">{{ lv.limit }}</p>
              <span class="text-[8px] font-black uppercase tracking-tighter opacity-60">{{ lv.status }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Upgrade CTA -->
      <div v-if="nextLevel" 
        @click="startUpgrade"
        class="p-5 bg-slate-900 dark:bg-white text-dark dark:text-white rounded-[2.5rem] shadow-2xl active:scale-[0.98] transition-all group overflow-hidden relative cursor-pointer"
      >
        <div class="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div class="relative z-10 flex items-center justify-between">
          <div class="space-y-1">
            <h3 class="text-xs font-black uppercase tracking-[0.2em] dark:text-slate-900 text-white">Upgrade to Level {{ nextLevel }}</h3>
            <p class="text-[10px] font-bold dark:text-slate-500 text-white/60">Unlock {{ levels[nextLevel-1].limit }} daily limit</p>
          </div>
          <button class="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 group-hover:translate-x-1 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      <!-- Successful Max Level Banner -->
      <div v-else class="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-2xl shadow-lg">👑</div>
        <div>
          <h3 class="text-sm font-bold text-emerald-600 tracking-tight">Maximum Tier Reached</h3>
          <p class="text-[9px] font-bold text-emerald-600/60 uppercase tracking-widest opacity-80">You have no more limits on your account.</p>
        </div>
      </div>

      <!-- Dynamic Upgrade Modal -->
      <Transition name="fade">
        <div v-if="showUpgradeFlow" class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" @click="showUpgradeFlow = false"></div>
          
          <div class="relative w-full max-w-md bg-white dark:bg-slate-950 rounded-[3rem] shadow-2xl border border-white/5 overflow-hidden animate-in slide-in-from-bottom-full duration-500">
            <!-- Modal Header -->
            <div class="p-8 text-center space-y-4">
              <div class="w-20 h-20 rounded-[2.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl mx-auto shadow-inner">
                {{ nextLevel === 2 ? (upgradeStep === 1 ? '🔢' : '🏠') : (upgradeStep === 1 ? '📇' : '🤳') }}
              </div>
              <div class="space-y-1">
                <h3 class="text-xl font-black text-slate-800 dark:text-white tracking-tight">
                  {{ nextLevel === 2 ? 'Level 2 Verification' : 'Level 3 Professional' }}
                </h3>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Step {{ upgradeStep }} of 2: {{ nextLevel === 2 ? (upgradeStep === 1 ? 'Identity' : 'Residency') : (upgradeStep === 1 ? 'Documents' : 'Biometrics') }}
                </p>
              </div>
            </div>

            <!-- Modal Content -->
            <div class="px-8 pb-10 space-y-6">
              <!-- Level 2 Content -->
              <template v-if="nextLevel === 2">
                <div v-if="upgradeStep === 1" class="space-y-4">
                  <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Bank Verification Number (BVN)</label>
                    <input 
                      type="text" 
                      v-model="bvn"
                      @input="handleBvnInput"
                      inputmode="numeric"
                      maxlength="11"
                      placeholder="Enter 11-digit BVN" 
                      class="w-full h-14 bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl px-5 text-sm font-bold tracking-[0.5em] outline-none focus:border-primary transition-all dark:text-white" 
                    />
                  </div>
                  <p class="text-[9px] font-medium text-slate-400 text-center uppercase tracking-widest leading-relaxed">Your BVN is required to verify your identity and protect your account.</p>
                </div>
                <div v-else class="space-y-4">
                  <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Residential Address</label>
                    <textarea placeholder="No. 123, Luxury Estate, Lagos" class="w-full h-24 bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl p-5 text-sm font-bold outline-none focus:border-primary transition-all dark:text-white resize-none"></textarea>
                  </div>
                </div>
              </template>

              <!-- Level 3 Content -->
              <template v-else>
                <div v-if="upgradeStep === 1" class="space-y-4">
                  <div 
                    @click="$refs.fileInput.click()"
                    class="p-8 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-primary transition-colors cursor-pointer group relative overflow-hidden h-48"
                  >
                    <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleFileUpload" />
                    
                    <template v-if="idDocument">
                      <img :src="idDocument" class="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      <div class="relative z-10 bg-slate-900/60 p-3 rounded-xl backdrop-blur-sm">
                        <span class="text-[10px] font-black text-white uppercase tracking-widest">Tap to change ID</span>
                      </div>
                    </template>
                    <template v-else>
                      <div class="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center transition-transform group-hover:scale-110">🖨️</div>
                      <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Upload Government ID</span>
                    </template>
                  </div>
                </div>
                
                <div v-else class="text-center space-y-6 py-4">
                  <div class="relative w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-primary/20 shadow-2xl">
                    <!-- Live Viewfinder -->
                    <video 
                      v-show="isCameraActive && !facePhoto"
                      ref="videoEl" 
                      autoplay 
                      playsinline 
                      class="w-full h-full object-cover scale-x-[-1]"
                    ></video>
                    
                    <!-- Captured Preview -->
                    <img 
                      v-if="facePhoto" 
                      :src="facePhoto" 
                      class="w-full h-full object-cover" 
                    />
                    
                    <!-- Placeholder/Status -->
                    <div v-if="!isCameraActive && !facePhoto" class="absolute inset-0 flex items-center justify-center text-4xl bg-slate-100 dark:bg-white/5">🤳</div>
                    
                    <!-- Scanning Overlay -->
                    <div v-if="isCameraActive && !facePhoto" class="absolute inset-0 border-4 border-primary rounded-full animate-pulse pointer-events-none"></div>
                  </div>

                  <div class="flex flex-col gap-3 items-center">
                    <button 
                      v-if="!isCameraActive && !facePhoto"
                      @click="startCamera"
                      class="px-6 py-2.5 bg-primary/10 text-primary text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                    >
                      Enable Camera
                    </button>
                    
                    <button 
                      v-if="isCameraActive && !facePhoto"
                      @click="capturePhoto"
                      class="px-8 py-3 bg-primary text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-lg shadow-primary/20 animate-bounce"
                    >
                      Take Photo
                    </button>

                    <button 
                      v-if="facePhoto"
                      @click="facePhoto = null; startCamera()"
                      class="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-colors"
                    >
                      Retake Photo
                    </button>
                  </div>
                </div>
              </template>

              <!-- Action Button -->
              <button 
                @click="processUpgrade"
                :disabled="isProcessing"
                class="w-full h-14 bg-primary text-white text-[10px] font-black rounded-2xl uppercase tracking-[0.2em] shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span v-if="!isProcessing">{{ upgradeStep === 1 ? 'Next Step' : 'Verify & Upgrade' }}</span>
                <template v-else>
                  <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span>Verifying...</span>
                </template>
              </button>
            </div>
          </div>
        </div>
      </Transition>

    </div>
  </AppShell>
</template>

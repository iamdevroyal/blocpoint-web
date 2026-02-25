<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUIStore } from '../stores/ui'

const router = useRouter()
const uiStore = useUIStore()
const currentSlide = ref(0)
const slideDuration = 5000 // 5 seconds per slide
let autoplayInterval = null

const slides = [
  {
    title: "Financial Liquidity Hub",
    description: "Your all-in-one platform for managing wallets, transfers, and high-yield digital assets.",
    image: "/mobile.png",
    color: "from-indigo-500 to-emerald-400"
  },
  {
    title: "T+0 Real-time Settlement",
    description: "Experience lightning-fast NIP transfers and instant settlements for your agent transactions.",
    image: "/money.png",
    color: "from-emerald-400 to-cyan-500"
  },
  {
    title: "Secure & Compliant",
    description: "Bank-level encryption and PCI DSS compliance ensure your funds are always protected.",
    image: "/mobile.png",
    color: "from-indigo-500 to-primary-soft"
  },
  {
    title: "Tax Ready & Simplified",
    description: "Automated tax tracking and simplified compliance reporting for FIRS and local states.",
    image: "/tax.png",
    color: "from-amber-400 to-orange-500"
  }
]

const nextSlide = () => {
  if (currentSlide.value < slides.length - 1) {
    currentSlide.value++
    resetAutoplay()
  } else {
    // Keep it on the last slide or pause autoplay
    if (autoplayInterval) clearInterval(autoplayInterval)
  }
}

const prevSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--
    resetAutoplay()
  }
}

const resetAutoplay = () => {
  if (autoplayInterval) clearInterval(autoplayInterval)
  startAutoplay()
}

const startAutoplay = () => {
  autoplayInterval = setInterval(() => {
    if (currentSlide.value < slides.length - 1) {
      currentSlide.value++
    } else {
      clearInterval(autoplayInterval)
    }
  }, slideDuration)
}

onMounted(() => {
  startAutoplay()
})

onUnmounted(() => {
  if (autoplayInterval) clearInterval(autoplayInterval)
})
</script>

<template>
  <div class="h-[100dvh] flex flex-col transition-colors duration-500 bg-slate-50 dark:bg-dark text-slate-900 dark:text-white relative overflow-hidden">
    
    <!-- Segmented Progress Bar -->
    <div class="absolute top-6 inset-x-0 flex gap-1 px-6 z-20">
      <div 
        v-for="(slide, index) in slides" 
        :key="index"
        class="h-1 flex-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden"
      >
        <div 
          class="h-full bg-primary transition-all duration-300"
          :class="{ 'w-full': index < currentSlide, 'w-0': index > currentSlide, 'animate-progress': index === currentSlide }"
          :style="{ animationDuration: slideDuration + 'ms' }"
        ></div>
      </div>
    </div>

    <!-- Background Decoration -->
    <div class="absolute inset-0 z-0 opacity-20 dark:opacity-10 pointer-events-none">
      <div 
        class="absolute -top-[20%] -left-[20%] w-[100%] h-[100%] rounded-full blur-[120px] bg-primary-soft transition-all duration-1000"
        :style="{ transform: `translate(${currentSlide * 10}%, ${currentSlide * 5}%)` }"
      ></div>
    </div>

    <!-- Slides Content -->
    <div class="flex-1 relative z-10 pt-16">
      <TransitionGroup name="onboarding" tag="div" class="h-full relative">
        <div 
          v-for="(slide, index) in slides" 
          :key="index"
          v-show="index === currentSlide"
          class="absolute inset-0 flex flex-col items-center justify-center px-8 text-center"
        >
          <!-- Image Container -->
          <div class="relative w-full aspect-square max-w-[220px] sm:max-w-[280px] mb-8 sm:mb-12 group">
            <div 
              class="absolute inset-0 rounded-full bg-gradient-to-tr opacity-20 blur-3xl transition-colors duration-500"
              :class="slide.color"
            ></div>
            <img 
              :src="slide.image" 
              class="relative w-full h-full object-contain drop-shadow-2xl floating-animation" 
              alt="Slide Image"
            />
          </div>

          <!-- Text Content -->
          <div class="space-y-4 max-w-sm">
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight slide-up">
              {{ slide.title }}
            </h1>
            <p class="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed slide-up-delayed">
              {{ slide.description }}
            </p>
          </div>
        </div>
      </TransitionGroup>
      
      <!-- Manual Navigation Shields/Areas -->
      <div class="absolute inset-0 flex z-30 pointer-events-none">
        <!-- Left Nav Area -->
        <div class="w-1/4 h-full flex items-center justify-start pl-4 pointer-events-auto cursor-pointer group/nav" @click="prevSlide">
          <button 
            v-if="currentSlide > 0"
            class="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-lg border border-white/30 dark:border-white/10 text-slate-700 dark:text-white transition-all active:scale-90"
            aria-label="Previous slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
        </div>
        
        <!-- Next/Tap-Forward Area -->
        <div class="flex-1 h-full flex items-center justify-end pr-4 pointer-events-auto cursor-pointer group/nav" @click="nextSlide">
          <button 
            v-if="currentSlide < slides.length - 1"
            class="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-lg border border-white/30 dark:border-white/10 text-slate-700 dark:text-white transition-all active:scale-90"
            aria-label="Next slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>

    </div>

    <!-- Bottom Actions -->
    <div class="p-8 space-y-4 relative z-40 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent dark:from-dark dark:via-dark transition-colors duration-500">
      <button 
        @click="router.push('/auth/register')"
        class="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98]"
      >
        Create Account
      </button>
      
      <button 
        @click="router.push('/auth/login')"
        class="w-full py-4 rounded-2xl border-2 border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold backdrop-blur-md transition-all active:scale-[0.98]"
      >
        Sign in
      </button>
    </div>

  </div>
</template>

<style scoped>
.onboarding-enter-active,
.onboarding-leave-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.onboarding-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.onboarding-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.floating-animation {
  animation: floating 3s ease-in-out infinite;
}

@keyframes floating {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0px); }
}

@keyframes progress {
  from { width: 0; }
  to { width: 100%; }
}

.animate-progress {
  animation: progress linear forwards;
}

.slide-up {
  animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.slide-up-delayed {
  animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>


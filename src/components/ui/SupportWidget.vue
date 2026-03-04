<template>
  <Teleport to="body">
    <div class="support-widget">
      <!-- Support Window -->
      <transition name="slide-up">
        <div 
          v-if="isOpen" 
          class="fixed bottom-24 right-4 left-4 sm:left-auto sm:right-6 z-[100] w-auto sm:w-[350px] bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-2xl transition-colors duration-500"
        >
          <!-- Header -->
          <div class="p-5 border-b border-slate-200 dark:border-white/10 bg-primary/5 dark:bg-primary/10 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <HeadsetIcon class="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 class="font-bold text-slate-900 dark:text-white text-sm">Support</h3>
                <p class="text-[10px] text-primary flex items-center gap-1 font-bold uppercase tracking-wider">
                  <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Online
                </p>
              </div>
            </div>
            <button @click="isOpen = false" class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-white/5">
              <XIcon class="w-5 h-5" />
            </button>
          </div>

          <!-- Support Options -->
          <div class="p-6 space-y-4">
            <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">How would you like to reach us?</p>
            
            <!-- Call Button -->
            <button 
              @click="handleAction('tel')"
              class="w-full group flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-primary/50 hover:bg-primary/5 transition-all active:scale-[0.98]"
            >
              <div class="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                <PhoneIcon class="w-5 h-5" />
              </div>
              <div class="flex-1 text-left">
                <p class="text-sm font-bold text-slate-900 dark:text-white">Call Support</p>
                <p class="text-[10px] text-slate-500 dark:text-slate-400">Speak with an agent</p>
              </div>
              <ChevronRightIcon class="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-primary transition-colors" />
            </button>

            <!-- WhatsApp Button -->
            <button 
              @click="handleAction('whatsapp')"
              class="w-full group flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-green-500/50 hover:bg-green-500/5 transition-all active:scale-[0.98]"
            >
              <div class="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                <MessageCircleIcon class="w-5 h-5" />
              </div>
              <div class="flex-1 text-left">
                <p class="text-sm font-bold text-slate-900 dark:text-white">WhatsApp</p>
                <p class="text-[10px] text-slate-500 dark:text-slate-400">Chat with us instantly</p>
              </div>
              <ChevronRightIcon class="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-green-500 transition-colors" />
            </button>

            <!-- Email Button -->
            <button 
              @click="handleAction('email')"
              class="w-full group flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all active:scale-[0.98]"
            >
              <div class="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                <MailIcon class="w-5 h-5" />
              </div>
              <div class="flex-1 text-left">
                <p class="text-sm font-bold text-slate-900 dark:text-white">Email Us</p>
                <p class="text-[10px] text-slate-500 dark:text-slate-400">Get help via email</p>
              </div>
              <ChevronRightIcon class="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-purple-500 transition-colors" />
            </button>
          </div>

          <!-- Footer Info -->
          <div class="px-6 py-4 bg-slate-50/50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5">
            <p class="text-[9px] text-center text-slate-400 uppercase tracking-widest font-bold">Typically responds in under 5 minutes</p>
          </div>
        </div>
      </transition>

      <!-- Trigger Button -->
      <button 
        v-if="!isOpen"
        @click="isOpen = true"
        class="fixed bottom-24 right-6 z-[100] group p-2 rounded-full bg-white dark:bg-slate-900 border border-primary/20 shadow-2xl shadow-primary/30 dark:shadow-primary/20 hover:border-primary active:scale-95 transition-all duration-300 animate-soft-bounce"
      >
        <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform duration-300">
          <MessageSquareIcon class="w-6 h-6 text-primary" />
        </div>
      </button>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { 
  XIcon, 
  PhoneIcon, 
  MailIcon, 
  MessageCircleIcon, 
  ChevronRightIcon, 
  HeadsetIcon,
  MessageSquareIcon 
} from 'lucide-vue-next'

const isOpen = ref(false)

const handleAction = (type) => {
  let url = ''
  if (type === 'tel') url = 'tel:+2347035148792'
  if (type === 'email') url = 'mailto:helpdesk@blocpoint.africa'
  if (type === 'whatsapp') url = 'https://wa.me/2347035148792'
  
  if (url) {
    const link = document.createElement('a')
    link.href = url
    if (type === 'whatsapp') link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
</script>

<style scoped>
.support-widget {
  position: relative;
  z-index: 100;
}
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(40px) scale(0.95);
}

.animate-soft-bounce {
  animation: soft-bounce 3s ease-in-out infinite;
}

@keyframes soft-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
</style>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDashboardStore } from '../../stores/dashboard'
import AppShell from '../../components/layout/AppShell.vue'

const route = useRoute()
const router = useRouter()
const dash = useDashboardStore()

const notificationId = computed(() => route.params.id)
const notification = computed(() => dash.notifications.find(n => n.id === notificationId.value))

const goBack = () => router.back()

const markAsRead = async () => {
    if (notification.value && !notification.value.is_read) {
        await dash.markNotificationRead(notification.value.id)
    }
}

const deleteNotif = async () => {
    if (notification.value) {
        await dash.dismissNotification(notification.value.id)
        router.push('/app/dashboard')
    }
}

// Ensure it's marked as read when viewing
if (notification.value && !notification.value.is_read) {
    markAsRead()
}
</script>

<template>
  <AppShell :title="notification?.subject || 'Notification Details'">
    <div class="max-w-2xl mx-auto space-y-6">
      <!-- Back Header -->
      <button @click="goBack" class="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors mb-2 group">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
        <span class="text-xs font-bold uppercase tracking-widest">Back to Dashboard</span>
      </button>

      <div v-if="notification" class="space-y-6">
        <!-- Main Content Card -->
        <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-white/5 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div class="p-8">
            <div class="flex items-center gap-4 mb-6">
              <div class="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl shrink-0">
                {{ notification.type === 'security' ? '🔒' : notification.type === 'transaction' ? '💰' : '🔔' }}
              </div>
              <div>
                <h2 class="text-xl font-black text-slate-900 dark:text-white leading-tight mb-1">{{ notification.subject }}</h2>
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 uppercase tracking-tighter">
                    {{ notification.type }}
                  </span>
                  <span class="text-[10px] font-medium text-slate-400">
                    {{ new Date(notification.sent_at).toLocaleString() }}
                  </span>
                </div>
              </div>
            </div>

            <div class="p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
              <p class="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {{ notification.body }}
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="px-8 py-6 bg-slate-50/50 dark:bg-black/20 border-t border-slate-100 dark:border-white/5 flex flex-wrap gap-3">
            <button 
              @click="deleteNotif"
              class="px-5 py-3 rounded-xl bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all active:scale-95"
            >
              Delete Notification
            </button>
          </div>
        </div>

        <!-- Meta Information -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4" v-if="notification.metadata">
          <div class="bg-white dark:bg-slate-900 px-6 py-5 rounded-3xl border border-slate-100 dark:border-white/5">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Technical Data</p>
            <div class="space-y-3">
              <div v-for="(val, key) in notification.metadata" :key="key" class="flex items-center justify-between">
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{{ key }}</span>
                <span class="text-[11px] font-mono text-slate-800 dark:text-slate-200">{{ val }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Not Found -->
      <div v-else class="py-20 text-center space-y-4">
        <div class="text-6xl">🔍</div>
        <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Notification Not Found</h3>
        <p class="text-sm text-slate-500 max-w-xs mx-auto">The notification you are looking for might have been deleted or moved.</p>
        <button @click="go('/app/dashboard')" class="px-6 py-3 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/30 active:scale-95 transition-all">
          Go Home
        </button>
      </div>
    </div>
  </AppShell>
</template>

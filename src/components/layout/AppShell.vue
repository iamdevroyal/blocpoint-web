<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUIStore } from '../../stores/ui'
import { useAuthStore } from '../../stores/auth'
import { useDashboardStore } from '../../stores/dashboard'

const props = defineProps({
  title: {
    type: String,
    default: 'Blocpoint',
  },
})

const route  = useRoute()
const router = useRouter()
const ui     = useUIStore()
const auth   = useAuthStore()
const dash   = useDashboardStore()

const isDark              = computed(() => ui.isDark)
const showNotifications   = ref(false)
const showUserDropdown    = ref(false)
const notificationRef     = ref(null)
const userDropdownRef     = ref(null)

// ─── Agent display helpers ────────────────────────────────────────────────────

/** Full display name, falls back to phone if profile not yet loaded. */
const displayName = computed(() =>
  auth.user?.full_name
  ?? (auth.user?.first_name ? `${auth.user.first_name} ${auth.user.last_name ?? ''}`.trim() : null)
  ?? auth.user?.phone
  ?? 'Agent'
)

/** Tier level label */
const tierLabel = computed(() =>
  auth.user?.tier?.level != null ? `Level ${auth.user.tier.level}` : 'Level —'
)

/** Avatar URL via ui-avatars from the agent's name */
const avatarUrl = computed(() => {
  const name = encodeURIComponent(displayName.value)
  return `https://ui-avatars.com/api/?name=${name}&background=6366f1&color=fff&size=80`
})

// ─── Notifications ────────────────────────────────────────────────────────────

const unreadCount   = computed(() => dash.unreadCount)
const notifications = computed(() => dash.notifications)

const navItems = [
  { name: 'Home',    path: '/app/dashboard', icon: '🏠' },
  { name: 'Wallet',  path: '/app/wallet',    icon: '�' },
  { name: 'SoftPOS', path: '/app/softpos',   icon: '�' },
  { name: 'Tax',     path: '/app/tax',       icon: '�' },
  { name: 'Assets',  path: '/app/assets',    icon: '�️' },
]

const isActive = (path) => route.path.startsWith(path)
const go = (path) => {
  router.push(path)
  showNotifications.value = false
  showUserDropdown.value  = false
}

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  showUserDropdown.value  = false
}

const toggleUserDropdown = () => {
  showUserDropdown.value  = !showUserDropdown.value
  showNotifications.value = false
}

/** Mark a notification as read when opening the panel. */
const onOpenNotifications = async () => {
  toggleNotifications()
  // Mark unread ones as read after a short delay (UX: let the user see them first)
  if (showNotifications.value) {
    setTimeout(async () => {
      const unread = dash.notifications.filter((n) => !n.is_read)
      await Promise.all(unread.map((n) => dash.markNotificationRead(n.id)))
    }, 1500)
  }
}

/** Logout: call auth store (handles POST /auth/logout + state clear) then redirect. */
const handleLogout = () => {
  ui.showConfirm({
    title:       'Sign Out',
    message:     'Are you sure you want to end your session?',
    confirmText: 'Logout',
    onConfirm: async () => {
      await auth.logout()
      router.push('/auth/login')
    },
  })
}

const handleClickOutside = (event) => {
  if (notificationRef.value && !notificationRef.value.contains(event.target)) {
    showNotifications.value = false
  }
  if (userDropdownRef.value && !userDropdownRef.value.contains(event.target)) {
    showUserDropdown.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <!-- Desktop layout -->
  <div class="hidden md:flex min-h-screen bg-slate-950 text-slate-50 overflow-x-hidden">
    <!-- Sidebar -->
    <aside class="w-64 bg-slate-950/80 border-r border-white/10 backdrop-blur-xl py-6 px-4 flex flex-col gap-6">
      <div class="flex items-center justify-between mb-4">
        <button @click="go('/app/dashboard')" class="flex items-center gap-2">
          <img src="/blocpoint-white.png" alt="BlocPoint" class="h-8 w-auto" />
        </button>
        <button
          class="text-xs px-2 py-1 rounded-full border border-white/20 hover:bg-white/10 transition"
          @click="ui.toggleTheme()"
        >
          {{ isDark ? 'Light' : 'Dark' }}
        </button>
      </div>

      <nav class="flex-1 space-y-1">
        <button
          v-for="item in navItems"
          :key="item.path"
          class="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition"
          :class="isActive(item.path) ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5'"
          @click="go(item.path)"
        >
          <span>{{ item.icon }}</span>
          <span>{{ item.name }}</span>
        </button>
      </nav>
    </aside>

    <!-- Main content -->
    <main class="flex-1 flex flex-col bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900">
      <!-- Desktop header -->
      <header class="sticky top-0 z-20 px-6 py-4 border-b border-white/10 backdrop-blur-xl bg-slate-950/60 flex items-center justify-between">
        <h1 class="text-lg font-semibold text-slate-100">{{ title }}</h1>
        <slot name="header-actions" />
      </header>

      <!-- Page content -->
      <section class="flex-1 px-6 py-4">
        <slot />
      </section>
    </main>
  </div>

  <!-- Mobile layout -->
  <div class="md:hidden min-h-[100dvh] flex flex-col transition-colors duration-500 bg-slate-50 dark:bg-dark text-slate-900 dark:text-white relative overflow-x-hidden">
    <!-- Detached Glassmorphic Header -->
    <header
      class="fixed top-4 inset-x-4 z-50 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl px-4 py-3 flex items-center justify-between shadow-lg shadow-slate-200/50 dark:shadow-none transition-all"
    >
      <!-- User info / dropdown trigger -->
      <div class="flex items-center gap-3 cursor-pointer active:scale-95 transition-transform relative" ref="userDropdownRef" @click="toggleUserDropdown">
        <div class="w-10 h-10 rounded-full border-2 border-primary/20 p-0.5 overflow-hidden ring-2 ring-slate-100 dark:ring-white/5">
          <img :src="avatarUrl" :alt="displayName" class="w-full h-full rounded-full object-cover" />
        </div>
        <div>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{{ tierLabel }}</p>
          <div class="flex items-center gap-1">
            <p class="text-[10px] font-extrabold text-slate-800 dark:text-slate-200">{{ displayName }}</p>
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="opacity-50 transition-transform" :class="{ 'rotate-180': showUserDropdown }"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>

        <!-- User Dropdown Menu -->
        <Transition name="fade-scale">
          <div v-if="showUserDropdown" class="absolute top-12 left-0 w-44 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-2 z-[70] origin-top-left">
            <button @click.stop="go('/app/profile')" class="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-bold hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors">
              <span class="text-lg">👤</span> Profile
            </button>
            <button @click.stop="go('/app/settings')" class="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-bold hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors">
              <span class="text-lg">⚙️</span> Settings
            </button>
            <div class="h-px bg-slate-100 dark:bg-white/5 my-1 mx-2"></div>
            <button @click.stop="handleLogout" class="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors">
              <span class="text-lg">🚪</span> Logout
            </button>
          </div>
        </Transition>
      </div>

      <!-- Header actions -->
      <div class="flex items-center gap-2" ref="notificationRef">
        <!-- Theme toggle -->
        <button
          @click="ui.toggleTheme()"
          class="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all active:scale-90"
        >
          <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
        </button>

        <!-- Support -->
        <button @click="go('/app/support')" class="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all active:scale-90">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
        </button>

        <!-- Notifications -->
        <button
          @click="onOpenNotifications"
          class="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 relative hover:bg-slate-100 dark:hover:bg-white/5 transition-all active:scale-90"
          :class="{ 'bg-primary/10 text-primary': showNotifications }"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          <!-- Unread badge -->
          <span
            v-if="unreadCount > 0"
            class="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] px-0.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-black text-white leading-none"
          >{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
        </button>
      </div>

      <!-- Notification Dropdown -->
      <Transition name="fade-scale">
        <div v-if="showNotifications" class="absolute top-[4.5rem] inset-x-4 z-[60] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-2xl p-5 origin-top">
          <div class="flex items-center justify-between mb-4 px-2">
            <h3 class="text-sm font-black uppercase tracking-tighter">Notifications</h3>
            <span v-if="dash.isLoadingNotifs" class="text-[10px] text-slate-400">Loading…</span>
          </div>

          <!-- Empty state -->
          <div v-if="!dash.isLoadingNotifs && notifications.length === 0" class="py-6 text-center text-slate-400 text-sm font-medium">
            You're all caught up ✅
          </div>

          <!-- Notification list -->
          <div v-else class="space-y-2">
            <div
              v-for="notif in notifications"
              :key="notif.id"
              class="p-4 rounded-2xl border flex gap-4 transition-all active:scale-[0.98]"
              :class="notif.is_read
                ? 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5'
                : 'bg-primary/5 border-primary/20'"
            >
              <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl shrink-0">
                {{ notif.type === 'security' ? '🔒' : notif.type === 'transaction' ? '💰' : '🔔' }}
              </div>
              <div class="space-y-0.5 flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <h4 class="text-xs font-extrabold truncate">{{ notif.subject }}</h4>
                  <span class="text-[9px] font-medium text-slate-400 shrink-0">{{ notif.sent_at ? new Date(notif.sent_at).toLocaleDateString() : '' }}</span>
                </div>
                <p class="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight line-clamp-2">{{ notif.body }}</p>
              </div>
            </div>
          </div>

          <button @click="showNotifications = false" class="w-full mt-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border-t border-slate-100 dark:border-white/5">Close</button>
        </div>
      </Transition>
    </header>

    <!-- Content area -->
    <main class="flex-1 px-4 pt-24 pb-32">
      <slot />
    </main>

    <!-- Detached Glassmorphic Bottom Nav -->
    <nav
      class="fixed bottom-6 inset-x-4 z-50 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/75 backdrop-blur-xl shadow-2xl shadow-slate-200/60 dark:shadow-none px-2 py-2 flex items-center justify-around"
    >
      <button
        v-for="item in navItems"
        :key="item.path"
        class="flex flex-1 flex-col items-center gap-1.5 py-1.5 rounded-xl transition-all active:scale-90"
        :class="isActive(item.path) ? 'text-primary' : 'text-slate-400 dark:text-slate-500'"
        @click="go(item.path)"
      >
        <span class="text-xl px-2 py-1 rounded-lg transition-colors" :class="isActive(item.path) ? 'bg-primary/10' : ''">
          <template v-if="item.name === 'Home'">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </template>
          <template v-if="item.name === 'Wallet'">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          </template>
          <template v-if="item.name === 'SoftPOS'">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h.01"/><path d="M11 15h.01"/><path d="M15 15h.01"/><path d="M19 15h.01"/><path d="M7 11h.01"/><path d="M11 11h.01"/><path d="M15 11h.01"/><path d="M19 11h.01"/><path d="M7 7h.01"/><path d="M11 7h.01"/><path d="M15 7h.01"/><path d="M19 7h.01"/></svg>
          </template>
          <template v-if="item.name === 'Tax'">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
          </template>
          <template v-if="item.name === 'Assets'">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M2 7v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7"/><path d="M12 11v8"/><path d="M8 15h8"/></svg>
          </template>
        </span>
        <span class="text-[9px] font-extrabold tracking-tight uppercase">{{ item.name }}</span>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}
</style>

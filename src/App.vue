<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useUIStore } from './stores/ui'
import LoadingOverlay from './components/ui/LoadingOverlay.vue'
import ConfirmModal from './components/ui/ConfirmModal.vue'
import OfflineOverlay from './components/ui/OfflineOverlay.vue'
import DesktopRestriction from './components/ui/DesktopRestriction.vue'

const ui = useUIStore()

const updateNetworkStatus = () => {
  ui.isOffline = !navigator.onLine
}

onMounted(() => {
  ui.initTheme()
  window.addEventListener('online', updateNetworkStatus)
  window.addEventListener('offline', updateNetworkStatus)
})

onUnmounted(() => {
  window.removeEventListener('online', updateNetworkStatus)
  window.removeEventListener('offline', updateNetworkStatus)
})
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-dark text-slate-900 dark:text-white transition-colors duration-300 overflow-x-hidden">
    <router-view />
    
    <!-- Global UI Components -->
    <LoadingOverlay />
    <ConfirmModal />
    <OfflineOverlay />
    <DesktopRestriction />
  </div>
</template>

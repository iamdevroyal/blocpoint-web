<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useUIStore } from './stores/ui'
import LoadingOverlay from './components/ui/LoadingOverlay.vue'
import ConfirmModal from './components/ui/ConfirmModal.vue'
import OfflineOverlay from './components/ui/OfflineOverlay.vue'
import DesktopRestriction from './components/ui/DesktopRestriction.vue'
import IOSInstallPrompt from './components/ui/IOSInstallPrompt.vue'

const ui = useUIStore()

const handleNetworkChange = () => {
  //console.log('📡 Browser network event detected...')
  ui.isOffline = !navigator.onLine
  //console.log('🌐 Network Status Updated:', ui.isOffline ? 'OFFLINE' : 'ONLINE')
}

onMounted(() => {
  ui.initTheme()
  // Set correct offline state immediately on boot
  ui.isOffline = !navigator.onLine
  window.addEventListener('online',  handleNetworkChange)
  window.addEventListener('offline', handleNetworkChange)
})

onUnmounted(() => {
  window.removeEventListener('online',  handleNetworkChange)
  window.removeEventListener('offline', handleNetworkChange)
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
    <IOSInstallPrompt />
  </div>
</template>

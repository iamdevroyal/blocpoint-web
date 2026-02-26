<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useUIStore } from './stores/ui'
import LoadingOverlay from './components/ui/LoadingOverlay.vue'
import ConfirmModal from './components/ui/ConfirmModal.vue'
import OfflineOverlay from './components/ui/OfflineOverlay.vue'
import DesktopRestriction from './components/ui/DesktopRestriction.vue'

const ui = useUIStore()

const handleNetworkChange = () => {
  console.log('📡 Browser network event detected...')
  ui.updateNetworkStatus()
}

onMounted(() => {
  ui.initTheme()
  // Ensure we check status on boot
  ui.updateNetworkStatus()
  
  // Debug reference
  window.uiStore = ui
  
  window.addEventListener('online', handleNetworkChange)
  window.addEventListener('offline', handleNetworkChange)
})

onUnmounted(() => {
  window.removeEventListener('online', handleNetworkChange)
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
  </div>
</template>

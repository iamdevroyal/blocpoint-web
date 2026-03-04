<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useUIStore } from './stores/ui'
import { useWalletStore } from './stores/wallet'
import { useDashboardStore } from './stores/dashboard'
import LoadingOverlay from './components/ui/LoadingOverlay.vue'
import ConfirmModal from './components/ui/ConfirmModal.vue'
import OfflineOverlay from './components/ui/OfflineOverlay.vue'
import DesktopRestriction from './components/ui/DesktopRestriction.vue'
import IOSInstallPrompt from './components/ui/IOSInstallPrompt.vue'

const ui = useUIStore()
const walletStore = useWalletStore()
const dashboardStore = useDashboardStore()

onMounted(() => {
  ui.initTheme()
  // Set correct offline state immediately on boot
  ui.isOffline = !navigator.onLine
  
  const handleNetworkChange = async () => {
    const wasOffline = ui.isOffline
    ui.isOffline = !navigator.onLine
    ui.updateNetworkStatus()

    // If we just came back online, refresh critical data
    if (wasOffline && !ui.isOffline) {
      ui.showToast('Back online! Refreshing data...', 'success')
      // Refresh wallets, dashboard, etc.
      await Promise.allSettled([
        walletStore.fetchWallets(),
        dashboardStore.load()
      ])
    }
  }

  window.addEventListener('online',  handleNetworkChange)
  window.addEventListener('offline', handleNetworkChange)

  // Cleanup on unmount (though App.vue rarely unmounts)
  onUnmounted(() => {
    window.removeEventListener('online',  handleNetworkChange)
    window.removeEventListener('offline', handleNetworkChange)
  })
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

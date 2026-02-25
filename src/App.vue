<script setup>
import { onMounted } from 'vue'
import { useUIStore } from './stores/ui'

const ui = useUIStore()

onMounted(() => {
  ui.initTheme()
})
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-dark text-slate-900 dark:text-white transition-colors duration-300 overflow-x-hidden">
    <router-view />
  </div>
</template>

import { defineStore } from 'pinia'

/**
 * UI store for global theming and layout flags.
 *
 * For now this only manages dark/light mode, but can later
 * be extended with things like toasts, loading indicators, etc.
 */
export const useUIStore = defineStore('ui', {
  state: () => ({
    theme: localStorage.getItem('bp_theme') || 'dark',
    // Global loading state
    isLoading: false,
    loadingMessage: '',
    // Toasts state
    toasts: [],
  }),
  getters: {
    isDark: (state) => state.theme === 'dark',
    hasToasts: (state) => state.toasts.length > 0,
  },
  actions: {
    initTheme() {
      const root = document.documentElement
      if (this.theme === 'dark') {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    },
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('bp_theme', this.theme)
      this.initTheme()
    },

    // Loading handlers
    setLoading(status, message = '') {
      this.isLoading = status
      this.loadingMessage = status ? message : ''
    },

    // Toast handlers
    /**
     * Show a toast message
     * @param {string} message 
     * @param {'success' | 'error' | 'warning' | 'info'} type 
     * @param {number} duration 
     */
    showToast(message, type = 'info', duration = 3000) {
      const id = Date.now() + Math.random().toString(36).substring(2, 9)
      this.toasts.push({ id, message, type })

      if (duration > 0) {
        setTimeout(() => {
          this.removeToast(id)
        }, duration)
      }
      return id
    },

    removeToast(id) {
      this.toasts = this.toasts.filter((t) => t.id !== id)
    },

    clearToasts() {
      this.toasts = []
    },
  },
})



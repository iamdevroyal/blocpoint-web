import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'
import { useAuthStore } from './stores/auth'

// Globally capture the PWA install prompt in case it fires before Vue mounts
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    window.deferredPWAInstallPrompt = e
})

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)

// ── Boot: refresh user profile from server before first render ────────────────
// fetchUser() calls GET /auth/me if a token exists, gracefully falling back
// to localStorage if the call fails. This keeps the stored user fresh.
const authStore = useAuthStore()
authStore.fetchUser().finally(() => {
    app.mount('#app')
})

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'

// globally capture the PWA install prompt in case it fires before Vue mounts
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    window.deferredPWAInstallPrompt = e
})

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.mount('#app')


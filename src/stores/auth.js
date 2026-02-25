import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: localStorage.getItem('token') || null,
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
    },
    actions: {
        async login(credentials) {
            // Simulate API call
            // const response = await axios.post('/api/login', credentials)
            // this.token = response.data.token
            // this.user = response.data.user
            this.token = 'dummy-token'
            this.user = { name: 'John Doe' }
            localStorage.setItem('token', this.token)
        },
        async register(data) {
            // API call
        },
        logout() {
            this.token = null
            this.user = null
            localStorage.removeItem('token')
        }
    }
})

import { createRouter, createWebHistory } from 'vue-router'
import Install from '../views/landing/Install.vue'
import Onboarding from '../views/Onboarding.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import ForgotPin from '../views/ForgotPin.vue'
import Dashboard from '../views/Dashboard.vue'
import Wallet from '../views/app/Wallet.vue'
import Transfers from '../views/app/Transfers.vue'
import Tax from '../views/app/Tax.vue'
import GiftCards from '../views/app/GiftCards.vue'
import Support from '../views/Support.vue'
import Profile from '../views/Profile.vue'
import Settings from '../views/Settings.vue'
import Stablecoins from '../views/app/Stablecoins.vue'
import AddMoney from '../views/AddMoney.vue'
import Transactions from '../views/Transactions.vue'
import TransferBlocpoint from '../views/TransferBlocpoint.vue'
import TransferBank from '../views/TransferBank.vue'
import Airtime from '../views/Airtime.vue'
import DataPackage from '../views/DataPackage.vue'
import CableTV from '../views/CableTV.vue'
import Loans from '../views/Loans.vue'

const routes = [
  // Public / install + onboarding
  { path: '/', component: Install, meta: { requiresAuth: false } },
  { path: '/onboarding', component: Onboarding, meta: { requiresAuth: false } },

  // Auth
  { path: '/auth/login', component: Login, meta: { requiresAuth: false } },
  { path: '/auth/register', component: Register, meta: { requiresAuth: false } },
  { path: '/auth/forgot-pin', component: ForgotPin, meta: { requiresAuth: false } },

  // App (authenticated – currently mock auth via token in store)
  { path: '/app/dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/app/wallet', component: Wallet, meta: { requiresAuth: true } },
  { path: '/app/transfers', component: Transfers, meta: { requiresAuth: true } },
  { path: '/app/tax', component: Tax, meta: { requiresAuth: true } },
  { path: '/app/gift-cards', component: GiftCards, meta: { requiresAuth: true } },
  { path: '/app/stablecoins', component: Stablecoins, meta: { requiresAuth: true } },
  { path: '/app/support', component: Support, meta: { requiresAuth: true } },
  { path: '/app/profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/app/settings', component: Settings, meta: { requiresAuth: true } },
  { path: '/app/add-money', component: AddMoney, meta: { requiresAuth: true } },
  { path: '/app/transactions', component: Transactions, meta: { requiresAuth: true } },
  { path: '/app/transfer/blocpoint', component: TransferBlocpoint, meta: { requiresAuth: true } },
  { path: '/app/transfer/bank', component: TransferBank, meta: { requiresAuth: true } },
  { path: '/app/airtime', component: Airtime, meta: { requiresAuth: true } },
  { path: '/app/data', component: DataPackage, meta: { requiresAuth: true } },
  { path: '/app/tv', component: CableTV, meta: { requiresAuth: true } },
  { path: '/app/loans', component: Loans, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

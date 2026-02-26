import { createRouter, createWebHistory } from 'vue-router'
import Install from '../views/landing/Install.vue'
import Onboarding from '../views/Onboarding.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import ForgotPin from '../views/ForgotPin.vue'
import Dashboard from '../views/Dashboard.vue'
import Wallet from '../views/app/Wallet.vue'
import SoftPos from '../views/SoftPos.vue'
import Tax from '../views/app/Tax.vue'
import GiftCards from '../views/app/GiftCards.vue'
import GiftCardsCatalog from '../views/app/GiftCardsCatalog.vue'
import Support from '../views/Support.vue'
import HelpCenter from '../views/HelpCenter.vue'
import Profile from '../views/Profile.vue'
import Settings from '../views/Settings.vue'
import Stablecoins from '../views/app/Stablecoins.vue'
import Assets from '../views/app/Assets.vue'
import AddMoney from '../views/AddMoney.vue'
import AddMoneyBank from '../views/AddMoneyBank.vue'
import AddMoneyCard from '../views/AddMoneyCard.vue'
import AddMoneyUSSD from '../views/AddMoneyUSSD.vue'
import Transactions from '../views/Transactions.vue'
import TransferBlocpoint from '../views/TransferBlocpoint.vue'
import TransferBank from '../views/TransferBank.vue'
import Airtime from '../views/Airtime.vue'
import DataPackage from '../views/DataPackage.vue'
import CableTV from '../views/CableTV.vue'
import Loans from '../views/Loans.vue'
import Convert from '../views/Convert.vue'
import ReferEarn from '../views/ReferEarn.vue'
import SecuritySettings from '../views/settings/SecuritySettings.vue'
import NotificationSettings from '../views/settings/NotificationSettings.vue'
import TransactionLimits from '../views/settings/TransactionLimits.vue'
import KycSettings from '../views/settings/KycSettings.vue'
import TaxSettings from '../views/settings/TaxSettings.vue'
import ChangeLoginPin from '../views/settings/ChangeLoginPin.vue'
import ResetPosPin from '../views/settings/ResetPosPin.vue'

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
  { path: '/app/softpos', component: SoftPos, meta: { requiresAuth: true } },
  { path: '/app/tax', component: Tax, meta: { requiresAuth: true } },
  { path: '/app/assets', component: Assets, meta: { requiresAuth: true } },
  { path: '/app/gift-cards', component: GiftCards, meta: { requiresAuth: true } },
  { path: '/app/gift-cards/catalog', component: GiftCardsCatalog, meta: { requiresAuth: true } },
  { path: '/app/stablecoins', component: Stablecoins, meta: { requiresAuth: true } },
  { path: '/app/support', component: Support, meta: { requiresAuth: true } },
  { path: '/app/help-center', component: HelpCenter, meta: { requiresAuth: true } },
  { path: '/app/profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/app/settings', component: Settings, meta: { requiresAuth: true } },
  { path: '/app/settings/security', component: SecuritySettings, meta: { requiresAuth: true } },
  { path: '/app/settings/notifications', component: NotificationSettings, meta: { requiresAuth: true } },
  { path: '/app/settings/limits', component: TransactionLimits, meta: { requiresAuth: true } },
  { path: '/app/settings/kyc', component: KycSettings, meta: { requiresAuth: true } },
  { path: '/app/settings/tax', component: TaxSettings, meta: { requiresAuth: true } },
  { path: '/app/settings/security/change-pin', component: ChangeLoginPin, meta: { requiresAuth: true } },
  { path: '/app/settings/security/reset-pos-pin', component: ResetPosPin, meta: { requiresAuth: true } },
  { path: '/app/add-money', component: AddMoney, meta: { requiresAuth: true } },
  { path: '/app/add-money/bank', component: AddMoneyBank, meta: { requiresAuth: true } },
  { path: '/app/add-money/card', component: AddMoneyCard, meta: { requiresAuth: true } },
  { path: '/app/add-money/ussd', component: AddMoneyUSSD, meta: { requiresAuth: true } },
  { path: '/app/transactions', component: Transactions, meta: { requiresAuth: true } },
  { path: '/app/transfer/blocpoint', component: TransferBlocpoint, meta: { requiresAuth: true } },
  { path: '/app/transfer/bank', component: TransferBank, meta: { requiresAuth: true } },
  { path: '/app/airtime', component: Airtime, meta: { requiresAuth: true } },
  { path: '/app/data', component: DataPackage, meta: { requiresAuth: true } },
  { path: '/app/tv', component: CableTV, meta: { requiresAuth: true } },
  { path: '/app/loans', component: Loans, meta: { requiresAuth: true } },
  { path: '/app/convert', component: Convert, meta: { requiresAuth: true } },
  { path: '/app/refer', component: ReferEarn, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

export default router

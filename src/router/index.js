import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  // Public / install + onboarding
  { path: '/', component: () => import('../views/landing/Install.vue'), meta: { requiresAuth: false } },
  { path: '/onboarding', component: () => import('../views/Onboarding.vue'), meta: { requiresAuth: false } },

  // Auth
  { path: '/auth/login', component: () => import('../views/Login.vue'), meta: { requiresAuth: false } },
  { path: '/auth/register', component: () => import('../views/Register.vue'), meta: { requiresAuth: false } },
  { path: '/auth/forgot-pin', component: () => import('../views/ForgotPin.vue'), meta: { requiresAuth: false } },

  // App — authenticated
  { path: '/app/dashboard', component: () => import('../views/Dashboard.vue'), meta: { requiresAuth: true } },
  { path: '/app/wallet', component: () => import('../views/app/Wallet.vue'), meta: { requiresAuth: true } },
  { path: '/app/softpos', component: () => import('../views/SoftPos.vue'), meta: { requiresAuth: true } },
  { path: '/app/tax', component: () => import('../views/app/Tax.vue'), meta: { requiresAuth: true } },
  { path: '/app/assets', component: () => import('../views/app/Assets.vue'), meta: { requiresAuth: true } },
  { path: '/app/gift-cards', component: () => import('../views/app/GiftCards.vue'), meta: { requiresAuth: true } },
  { path: '/app/gift-cards/catalog', component: () => import('../views/app/GiftCardsCatalog.vue'), meta: { requiresAuth: true } },
  { path: '/app/stablecoins', component: () => import('../views/app/Stablecoins.vue'), meta: { requiresAuth: true } },
  { path: '/app/support', component: () => import('../views/Support.vue'), meta: { requiresAuth: true } },
  { path: '/app/help-center', component: () => import('../views/HelpCenter.vue'), meta: { requiresAuth: true } },
  { path: '/app/profile', component: () => import('../views/Profile.vue'), meta: { requiresAuth: true } },
  { path: '/app/settings', component: () => import('../views/Settings.vue'), meta: { requiresAuth: true } },
  { path: '/app/settings/security', component: () => import('../views/settings/SecuritySettings.vue'), meta: { requiresAuth: true } },
  { path: '/app/settings/notifications', component: () => import('../views/settings/NotificationSettings.vue'), meta: { requiresAuth: true } },
  { path: '/app/settings/limits', component: () => import('../views/settings/TransactionLimits.vue'), meta: { requiresAuth: true } },
  { path: '/app/settings/kyc', component: () => import('../views/settings/KycSettings.vue'), meta: { requiresAuth: true } },
  { path: '/app/settings/tax', component: () => import('../views/settings/TaxSettings.vue'), meta: { requiresAuth: true } },
  { path: '/app/settings/security/change-pin', component: () => import('../views/settings/ChangeLoginPin.vue'), meta: { requiresAuth: true } },
  { path: '/app/settings/security/reset-pos-pin', component: () => import('../views/settings/ResetPosPin.vue'), meta: { requiresAuth: true } },
  { path: '/app/add-money', component: () => import('../views/AddMoney.vue'), meta: { requiresAuth: true } },
  { path: '/app/add-money/bank', component: () => import('../views/AddMoneyBank.vue'), meta: { requiresAuth: true } },
  { path: '/app/add-money/card', component: () => import('../views/AddMoneyCard.vue'), meta: { requiresAuth: true } },
  { path: '/app/add-money/ussd', component: () => import('../views/AddMoneyUSSD.vue'), meta: { requiresAuth: true } },
  { path: '/app/transactions', component: () => import('../views/Transactions.vue'), meta: { requiresAuth: true } },
  { path: '/app/transfer/blocpoint', component: () => import('../views/TransferBlocpoint.vue'), meta: { requiresAuth: true } },
  { path: '/app/transfer/bank', component: () => import('../views/TransferBank.vue'), meta: { requiresAuth: true } },
  { path: '/app/airtime', component: () => import('../views/Airtime.vue'), meta: { requiresAuth: true } },
  { path: '/app/data', component: () => import('../views/DataPackage.vue'), meta: { requiresAuth: true } },
  { path: '/app/tv', component: () => import('../views/CableTV.vue'), meta: { requiresAuth: true } },
  { path: '/app/loans', component: () => import('../views/Loans.vue'), meta: { requiresAuth: true } },
  { path: '/app/convert', component: () => import('../views/Convert.vue'), meta: { requiresAuth: true } },
  { path: '/app/refer', component: () => import('../views/ReferEarn.vue'), meta: { requiresAuth: true } },
  { path: '/app/cards', component: () => import('../views/app/Cards.vue'), meta: { requiresAuth: true } },
  { path: '/app/cards/apply', component: () => import('../views/app/CardApplication.vue'), meta: { requiresAuth: true } },
  { path: '/app/knowledge/:id', component: () => import('../views/app/KnowledgeArticle.vue'), meta: { requiresAuth: true } },
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

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../components/layout/AppShell.vue'
import SearchablePicker from '../components/ui/SearchablePicker.vue'
import { useAuthStore } from '../stores/auth'
import apiClient from '../api/axios'
import { getStates, getLgasByState } from 'nigerian-states-lgas-cities-towns'

const router    = useRouter()
const authStore = useAuthStore()

// ─── Edit form state ───
const editForm = ref({
  first_name:    '',
  last_name:     '',
  email:         '',
  address:       '',
  state:         '',
  lga:           '',
  business_name: '',
})

// ─── Nigerian Geography ───
const allStates = getStates()

const availableLgas = computed(() => {
  const s = editForm.value.state
  if (!s) return []
  return getLgasByState(s)
})

const onStateChange = () => {
  editForm.value.lga = '' // reset lga
}

// ─── Live profile data ─────────────────────────────────────────────────────────

const agent       = ref(null)   // full AgentResource
const isLoading   = ref(true)
const loadError   = ref(null)

/**
 * Fetch the full agent profile via GET /agents/me.
 * AgentResource includes profile, tier, and wallet references.
 */
const loadProfile = async () => {
  isLoading.value = true
  loadError.value = null
  try {
    const { data } = await apiClient.get('/agents/me')
    agent.value = data.data
  } catch (err) {
    loadError.value = err?.response?.data?.message ?? 'Failed to load profile.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadProfile)

// ─── Derived display values ────────────────────────────────────────────────────

const displayName = computed(() => {
  if (!agent.value) return (authStore.user?.full_name ?? authStore.user?.phone) ?? '—'
  const p = agent.value?.profile
  if (!p) return agent.value?.phone ?? '—'
  const nameFromProfile = (p.full_name ?? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim()) || null
  return nameFromProfile || agent.value?.phone || '—'
})

const initials = computed(() => {
  const name = displayName.value
  if (!name || name.startsWith('+')) return '?'
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
})

const tierLevel = computed(() => agent.value?.tier?.level ?? '—')
const tierName  = computed(() => agent.value?.tier?.name  ?? 'Standard')

const joinedDate = computed(() => {
  const raw = agent.value?.created_at
  if (!raw) return '—'
  return new Date(raw).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

// ─── Edit drawer ───────────────────────────────────────────────────────────────

const showEdit    = ref(false)
const isSaving    = ref(false)
const saveError   = ref(null)
const saveSuccess = ref(false)

const openEdit = () => {
  const p = agent.value?.profile ?? {}
  editForm.value = {
    first_name:    p.first_name    ?? '',
    last_name:     p.last_name     ?? '',
    email:         p.email         ?? '',
    address:       p.location?.address ?? '',
    state:         p.location?.state   ?? '',
    lga:           p.location?.lga     ?? '',
    business_name: p.business_name ?? '',
  }
  saveError.value   = null
  saveSuccess.value = false
  showEdit.value    = true
}

/**
 * Submit profile update to PUT /agents/profile.
 * Only sends non-empty fields.
 */
const saveProfile = async () => {
  isSaving.value  = true
  saveError.value = null
  try {
    const { data } = await apiClient.put('/agents/profile', editForm.value)
    agent.value = data.data

    // Sync first/last name into the auth store so the header updates immediately
    if (authStore.user) {
      const p = data.data?.profile
      if (p) {
        authStore.user = {
          ...authStore.user,
          first_name: p.first_name,
          last_name:  p.last_name,
          full_name:  p.full_name,
        }
        localStorage.setItem('bp_user', JSON.stringify(authStore.user))
      }
    }

    saveSuccess.value = true
    setTimeout(() => { showEdit.value = false; saveSuccess.value = false }, 1200)
  } catch (err) {
    const resp = err?.response?.data
    saveError.value = resp?.errors
      ? Object.values(resp.errors).flat().join(' ')
      : (resp?.message ?? 'Could not save profile.')
  } finally {
    isSaving.value = false
  }
}

// ─── Copy account number ───────────────────────────────────────────────────────

const copied = ref(false)
const copyAccountNumber = async (num) => {
  try {
    await navigator.clipboard.writeText(num)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch { /* unsupported */ }
}
</script>

<template>
  <AppShell title="Profile">
    <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 px-2">

      <!-- Loading skeleton -->
      <div v-if="isLoading" class="space-y-4">
        <div class="flex flex-col items-center gap-4 py-6">
          <div class="w-32 h-32 rounded-[2.5rem] bg-slate-200 dark:bg-white/10 animate-pulse" />
          <div class="h-5 w-40 bg-slate-200 dark:bg-white/10 rounded-full animate-pulse" />
          <div class="h-3 w-24 bg-slate-200 dark:bg-white/10 rounded-full animate-pulse" />
        </div>
        <div class="h-32 bg-slate-100 dark:bg-white/5 rounded-[2.5rem] animate-pulse" />
      </div>

      <!-- Error state -->
      <div v-else-if="loadError" class="py-16 text-center">
        <p class="text-xs font-bold text-red-500">{{ loadError }}</p>
        <button @click="loadProfile" class="mt-4 text-xs font-black text-primary uppercase tracking-widest">Retry</button>
      </div>

      <!-- Profile content -->
      <template v-else>

        <!-- Profile Header -->
        <div class="flex flex-col items-center gap-5 py-6 relative">
          <!-- Avatar -->
          <div class="w-32 h-32 rounded-[2.5rem] border-4 border-primary/20 bg-primary/10 flex items-center justify-center shadow-2xl relative">
            <span class="text-4xl font-black text-primary">{{ initials }}</span>
          </div>

          <div class="text-center space-y-2">
            <h2 class="text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-none">{{ displayName }}</h2>
            <div class="flex items-center justify-center gap-2">
              <span class="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-emerald-500/20">
                Level {{ tierLevel }} · {{ tierName }}
              </span>
            </div>
            <p class="text-[11px] font-semibold text-slate-400">{{ agent?.phone }}</p>
          </div>

          <!-- Edit button -->
          <button
            @click="openEdit"
            class="flex items-center gap-2 px-6 py-2.5 bg-primary/10 text-primary rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all border border-primary/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
            Edit Profile
          </button>
        </div>

        <!-- Account Info Card -->
        <div class="space-y-3">
          <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-4">Account</h3>
          <div class="p-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-sm space-y-5">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg">🏦</div>
              <div>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Bank Name</p>
                <p class="text-[13px] font-black text-slate-800 dark:text-white">Blocpoint Microfinance Bank</p>
              </div>
            </div>

            <div v-if="agent?.account_number" class="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-lg">💳</div>
                <div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Account Number</p>
                  <p class="text-[15px] font-black text-slate-800 dark:text-white tracking-widest">{{ agent.account_number }}</p>
                </div>
              </div>
              <button @click="copyAccountNumber(agent.account_number)" class="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-white/10 active:scale-90 transition-transform shadow-sm">
                <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                <span v-else class="text-emerald-500 text-xs font-black">✓</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Personal Details Card -->
        <div class="space-y-3">
          <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-4">Personal Details</h3>
          <div class="p-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-sm">
            <div class="space-y-5">
              <!-- Phone -->
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-lg shrink-0">📱</div>
                <div><p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Phone</p><p class="text-sm font-black text-slate-800 dark:text-white">{{ agent?.phone ?? '—' }}</p></div>
              </div>
              <!-- Email -->
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-lg shrink-0">✉️</div>
                <div><p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Email</p><p class="text-sm font-black text-slate-800 dark:text-white">{{ agent?.profile?.email ?? '—' }}</p></div>
              </div>
              <!-- Business -->
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-lg shrink-0">🏢</div>
                <div><p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Business</p><p class="text-sm font-black text-slate-800 dark:text-white">{{ agent?.profile?.business_name ?? '—' }}</p></div>
              </div>
              <!-- Address -->
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-lg shrink-0">🏠</div>
                <div><p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Address</p><p class="text-sm font-black text-slate-800 dark:text-white break-all">{{ agent?.profile?.location?.address ?? '—' }}</p></div>
              </div>
              <div class="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-white/5">
                <div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">State</p>
                  <p class="text-sm font-black text-slate-800 dark:text-white">{{ agent?.profile?.location?.state ?? '—' }}</p>
                </div>
                <div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">LGA</p>
                  <p class="text-sm font-black text-slate-800 dark:text-white">{{ agent?.profile?.location?.lga ?? '—' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- KYC status -->
        <div class="p-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-sm flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-lg">🔐</div>
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">KYC Verification</p>
              <p class="text-[13px] font-black text-slate-800 dark:text-white">
                BVN: {{ agent?.profile?.kyc?.bvn_verified ? '✅ Verified' : '⚠️ Not verified' }}
              </p>
            </div>
          </div>
          <button @click="router.push('/app/settings/kyc')" class="px-4 py-2 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-xl active:scale-95 transition-all border border-primary/20">
            Manage
          </button>
        </div>

        <!-- Member since -->
        <div class="text-center pt-2">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Member since {{ joinedDate }}</p>
        </div>

      </template>
    </div>

    <!-- ── Edit Profile Drawer ─────────────────────────────────────────────── -->
    <Transition name="drawer-right">
      <div v-if="showEdit" class="fixed inset-0 z-[150] flex justify-end">
        <div class="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" @click="showEdit = false" />
        <div class="relative w-[90%] max-w-sm h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-white/10 overflow-hidden">

          <!-- Drawer header -->
          <div class="flex items-center justify-between px-6 pt-12 pb-4 border-b border-slate-100 dark:border-white/10">
            <div>
              <h3 class="text-lg font-black text-slate-800 dark:text-white">Edit Profile</h3>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Personal Information</p>
            </div>
            <button @click="showEdit = false" class="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="saveProfile" class="flex-1 overflow-y-auto px-6 py-6 space-y-5">

            <!-- Success -->
            <Transition name="fade">
              <div v-if="saveSuccess" class="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-[11px] font-bold text-emerald-600 text-center">
                ✅ Profile updated!
              </div>
            </Transition>

            <!-- Error -->
            <Transition name="fade">
              <div v-if="saveError" class="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-[11px] font-bold text-red-500 text-center">
                {{ saveError }}
              </div>
            </Transition>

            <div v-for="field in [
              { key: 'first_name',    label: 'First Name',    placeholder: 'e.g. Emeka',        type: 'text'  },
              { key: 'last_name',     label: 'Last Name',     placeholder: 'e.g. Njoku',        type: 'text'  },
              { key: 'email',         label: 'Email Address', placeholder: 'you@example.com',   type: 'email' },
              { key: 'business_name', label: 'Business Name', placeholder: 'Optional',           type: 'text'  },
              { key: 'address',       label: 'Address',       placeholder: 'Street address',    type: 'text'  },
              { key: 'state',         label: 'State',         placeholder: 'Select State',      type: 'picker' },
              { key: 'lga',           label: 'LGA',           placeholder: 'Select LGA',        type: 'picker' },
            ]" :key="field.key" class="space-y-1.5 relative">
              
              <!-- Custom Searchable Picker for State/LGA -->
              <SearchablePicker
                v-if="field.type === 'picker'"
                v-model="editForm[field.key]"
                :options="field.key === 'state' ? allStates : availableLgas"
                :label="field.label"
                :placeholder="field.placeholder"
                :disabled="field.key === 'lga' && !editForm.state"
                disabled-label="Select a state first"
                @change="field.key === 'state' ? onStateChange() : null"
              />

              <!-- Standard input -->
              <div v-else class="space-y-1.5">
                <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-2">{{ field.label }}</label>
                <input
                  :type="field.type"
                  v-model="editForm[field.key]"
                  :placeholder="field.placeholder"
                  class="w-full h-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-2xl px-4 text-[13px] font-bold outline-none focus:ring-2 focus:ring-primary/20 dark:text-white transition hover:border-primary/30"
                />
              </div>
            </div>

            <button type="submit" :disabled="isSaving"
              class="w-full h-14 bg-primary text-white text-[11px] font-black rounded-2xl shadow-xl shadow-primary/30 active:scale-95 transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-50 mt-4">
              <svg v-if="!isSaving" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              {{ isSaving ? 'Saving…' : 'Save Changes' }}
            </button>
          </form>
        </div>
      </div>
    </Transition>

  </AppShell>
</template>



<style scoped>
.drawer-right-enter-active, .drawer-right-leave-active { transition: all 0.4s cubic-bezier(0.4,0,0.2,1); }
.drawer-right-enter-from, .drawer-right-leave-to      { opacity: 0; transform: translateX(100%); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from,   .fade-leave-to     { opacity: 0; }

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(var(--color-primary), 0.2);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--color-primary), 0.4);
}
</style>

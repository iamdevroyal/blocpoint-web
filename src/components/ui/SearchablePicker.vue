<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  options: {
    type: Array,
    required: true,
    default: () => []
  },
  placeholder: {
    type: String,
    default: 'Select option'
  },
  label: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  disabledLabel: {
    type: String,
    default: 'Unavailable'
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)
const search = ref('')
const pickerRef = ref(null)

const filteredOptions = computed(() => {
  const query = search.value.toLowerCase()
  if (!query) return props.options
  return props.options.filter(opt => 
    opt.toLowerCase().includes(query)
  )
})

const toggle = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) search.value = ''
}

const select = (opt) => {
  emit('update:modelValue', opt)
  emit('change', opt)
  isOpen.value = false
  search.value = ''
}

const handleClickOutside = (e) => {
  if (pickerRef.value && !pickerRef.value.contains(e.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Focus search input when opened
const searchInput = ref(null)
watch(isOpen, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      searchInput.value?.focus()
    }, 100)
  }
})
</script>

<template>
  <div class="space-y-1.5 relative" ref="pickerRef">
    <label v-if="label" class="text-[9px] font-black text-slate-400 uppercase tracking-widest block px-2">
      {{ label }}
    </label>

    <div class="relative">
      <button 
        type="button"
        @click="toggle"
        class="w-full h-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-2xl px-4 text-[13px] font-bold outline-none flex items-center justify-between transition hover:border-primary/30"
        :class="[
          modelValue ? 'text-slate-800 dark:text-white' : 'text-slate-400 opacity-60',
          {'opacity-50 cursor-not-allowed': disabled}
        ]"
      >
        <span>{{ disabled ? disabledLabel : (modelValue || placeholder) }}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-slate-300 transition-transform duration-300" :class="{'rotate-180': isOpen}">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      <!-- Dropdown List -->
      <Transition name="picker-fade">
        <div 
          v-if="isOpen"
          class="absolute top-[calc(100%+8px)] left-0 right-0 z-[200] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-2xl overflow-hidden backdrop-blur-2xl"
        >
          <!-- Search Input -->
          <div class="p-3 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/30">
            <div class="relative">
              <input 
                ref="searchInput"
                v-model="search"
                :placeholder="'Search...'"
                class="w-full h-10 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-9 text-[12px] font-bold outline-none focus:border-primary/50 dark:text-white transition"
              />
              <div class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Items container -->
          <div class="max-h-60 overflow-y-auto py-2 custom-scrollbar relative">
            <button 
              v-for="opt in filteredOptions" :key="opt"
              type="button"
              @click="select(opt)"
              class="w-full px-6 py-3 text-left text-[13px] font-bold text-slate-700 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between"
              :class="{'bg-primary/5 text-primary': modelValue === opt}"
            >
              {{ opt }}
              <span v-if="modelValue === opt" class="text-primary font-black">✓</span>
            </button>
            <div v-if="filteredOptions.length === 0" class="px-6 py-4 text-center text-[11px] font-bold text-slate-400">
              No results found
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.picker-fade-enter-active, .picker-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.picker-fade-enter-from, .picker-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}

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

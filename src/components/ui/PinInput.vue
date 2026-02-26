<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  length: { type: Number, default: 4 },
  label: { type: String, default: 'Enter PIN' },
  modelValue: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'complete'])

const pin = ref(new Array(props.length).fill(''))
const inputs = ref([])

onMounted(() => {
  if (inputs.value[0]) inputs.value[0].focus()
})

const handleInput = (index, event) => {
  const val = event.target.value
  if (!/^\d*$/.test(val)) {
    pin.value[index] = ''
    return
  }

  if (val.length > 0) {
    pin.value[index] = val.slice(-1)
    if (index < props.length - 1) {
      inputs.value[index + 1].focus()
    }
  }

  const currentPin = pin.value.join('')
  emit('update:modelValue', currentPin)
  
  if (currentPin.length === props.length) {
    emit('complete', currentPin)
  }
}

const handleBackspace = (index, event) => {
  if (event.key === 'Backspace' && !pin.value[index] && index > 0) {
    inputs.value[index - 1].focus()
  }
}

const handlePaste = (event) => {
  const pasteData = event.clipboardData.getData('text').slice(0, props.length)
  if (!/^\d+$/.test(pasteData)) return
  
  const chars = pasteData.split('')
  chars.forEach((char, i) => {
    if (i < props.length) pin.value[i] = char
  })
  
  const currentPin = pin.value.join('')
  emit('update:modelValue', currentPin)
  if (currentPin.length === props.length) {
    emit('complete', currentPin)
  }
}

// Reset PIN externally
watch(() => props.modelValue, (newVal) => {
  if (!newVal) {
    pin.value = new Array(props.length).fill('')
  }
})
</script>

<template>
  <div class="flex flex-col items-center space-y-4">
    <label v-if="label" class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2">{{ label }}</label>
    <div class="flex gap-4 justify-center">
      <input
        v-for="i in length"
        :key="i"
        :ref="el => { if (el) inputs[i-1] = el }"
        type="password"
        inputmode="numeric"
        maxlength="1"
        v-model="pin[i-1]"
        @input="handleInput(i-1, $event)"
        @keydown="handleBackspace(i-1, $event)"
        @paste="handlePaste"
        class="w-14 h-16 text-2xl font-black text-center bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-primary dark:focus:border-primary rounded-2xl outline-none transition-all shadow-inner dark:text-white"
        autocomplete="one-time-code"
      />
    </div>
  </div>
</template>

<template>
  <button
    type="button"
    class="theme-toggle flex min-h-11 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
    :aria-pressed="darkTheme"
    @click="toggleTheme"
  >
    <span>{{ darkTheme ? t('lightTheme') : t('darkTheme') }}</span>
    <span aria-hidden="true">{{ darkTheme ? '☀️' : '🌙' }}</span>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '../utils/i18n'
import { applyTheme, saveTheme } from '../utils/theme'

const { t } = useI18n()
const darkTheme = ref(document.documentElement.classList.contains('dark'))

function toggleTheme(): void {
  darkTheme.value = !darkTheme.value
  applyTheme(darkTheme.value)
  saveTheme(darkTheme.value)
}
</script>

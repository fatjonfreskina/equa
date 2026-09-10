<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 transition-colors">
    <div class="fixed bottom-4 right-4 z-40 flex items-center gap-2">
      <LanguageSwitcher />
      <button
        type="button"
        class="theme-toggle flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-xl shadow-sm transition hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
        :aria-label="darkTheme ? t('darkOn') : t('darkOff')"
        :title="darkTheme ? t('lightTheme') : t('darkTheme')"
        @click="toggleTheme"
      >
        <span aria-hidden="true">{{ darkTheme ? '☀️' : '🌙' }}</span>
      </button>
    </div>
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { applyTheme, saveTheme } from './utils/theme'
import LanguageSwitcher from './components/LanguageSwitcher.vue'
import { useI18n } from './utils/i18n'

const { t } = useI18n()

const darkTheme = ref(document.documentElement.classList.contains('dark'))

function toggleTheme() {
  darkTheme.value = !darkTheme.value
  applyTheme(darkTheme.value)
  saveTheme(darkTheme.value)
}
</script>

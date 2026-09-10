<template>
  <label
    class="language-switcher flex items-center rounded-full border border-gray-200 bg-white p-1 text-xs shadow-sm"
  >
    <span class="sr-only">{{ t('language') }}</span>
    <select
      :value="locale"
      class="cursor-pointer rounded-full bg-transparent px-2 py-1.5 font-semibold text-gray-700 outline-none focus-visible:ring-2 focus-visible:ring-green-600"
      :aria-label="t('language')"
      @change="setLocale(($event.target as HTMLSelectElement).value as AppLocale)"
    >
      <option value="it">IT · {{ t('italian') }}</option>
      <option value="en">EN · {{ t('english') }}</option>
    </select>
  </label>
</template>

<script setup lang="ts">
import { useI18n, type AppLocale } from '../utils/i18n'

const { locale, setLocale, t } = useI18n()
</script>

<template>
  <label class="language-switcher flex min-h-11 w-full items-center justify-between px-3 py-2">
    <span class="text-sm font-semibold text-gray-700">{{ t('language') }}</span>
    <span class="relative flex items-center">
      <select
        :value="locale"
        class="cursor-pointer appearance-none bg-transparent py-1 pl-2 pr-6 text-right text-sm font-semibold text-gray-700 outline-none focus-visible:ring-2 focus-visible:ring-green-600"
        :aria-label="t('language')"
        @change="setLocale(($event.target as HTMLSelectElement).value as AppLocale)"
      >
        <option value="it">IT · {{ t('italian') }}</option>
        <option value="en">EN · {{ t('english') }}</option>
      </select>
      <span class="pointer-events-none absolute right-1 text-xs text-gray-500" aria-hidden="true"
        >⌄</span
      >
    </span>
  </label>
</template>

<script setup lang="ts">
import { useI18n, type AppLocale } from '../utils/i18n'

const { locale, setLocale, t } = useI18n()
</script>

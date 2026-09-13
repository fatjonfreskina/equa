<template>
  <div class="text-center text-xs text-gray-400 space-y-2">
    <p>
      {{ t('openSource') }}
      <a
        href="https://github.com/fatjonfreskina/equa"
        target="_blank"
        class="text-green-600 hover:underline"
        >{{ t('viewCode') }}</a
      >
      <span class="text-gray-300 mx-1">·</span>
      <span>v{{ APP_VERSION }}</span>
    </p>
    <div class="flex flex-wrap items-center justify-center gap-2">
      <span>{{ t('useful') }}</span>
      <a
        :href="DONATION_URL"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-block rounded-lg border border-amber-400 bg-amber-300 px-3 py-1.5 font-semibold text-gray-950 shadow-sm transition hover:border-amber-500 hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 dark:border-amber-300 dark:bg-amber-300 dark:text-gray-950 dark:hover:border-amber-200 dark:hover:bg-amber-200 dark:focus-visible:outline-amber-300"
        @click="trackEvent('donation_clicked')"
        >{{ t('offerCoffee') }}</a
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { APP_VERSION, DONATION_URL } from '../config'
import { trackEvent } from '../utils/analytics'
import { useI18n } from '../utils/i18n'
const { t } = useI18n()
</script>

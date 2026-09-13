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
        class="inline-block rounded-lg border border-yellow-300 bg-yellow-300 px-3 py-1.5 font-semibold text-gray-900 transition hover:border-yellow-400 hover:bg-yellow-400"
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

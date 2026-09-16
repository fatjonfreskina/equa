<template>
  <main class="min-h-screen bg-gray-50 px-4 py-10 text-gray-800">
    <article
      class="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <RouterLink to="/" class="text-sm font-semibold text-green-700 underline underline-offset-2">
        {{ t('privacyBackHome') }}
      </RouterLink>
      <h1 class="mt-5 text-3xl font-bold text-gray-900">{{ t('privacyTitle') }}</h1>
      <p class="mt-2 text-xs text-gray-500">{{ t('privacyUpdated') }}</p>
      <p class="mt-5 leading-7 text-gray-700">{{ t('privacyIntro') }}</p>

      <div class="mt-8 space-y-8">
        <section>
          <h2 class="text-xl font-semibold text-gray-900">{{ t('privacyGroupsTitle') }}</h2>
          <p class="mt-2 leading-7 text-gray-700">{{ t('privacyGroupsText') }}</p>
          <p class="mt-2 leading-7 text-amber-800">{{ t('privacyGroupLinkText') }}</p>
        </section>
        <section>
          <h2 class="text-xl font-semibold text-gray-900">{{ t('privacyLocalTitle') }}</h2>
          <p class="mt-2 leading-7 text-gray-700">{{ t('privacyLocalText') }}</p>
        </section>
        <section>
          <h2 class="text-xl font-semibold text-gray-900">{{ t('privacyEmailTitle') }}</h2>
          <p class="mt-2 leading-7 text-gray-700">{{ t('privacyEmailText') }}</p>
        </section>
        <section>
          <h2 class="text-xl font-semibold text-gray-900">{{ t('privacyFeedbackTitle') }}</h2>
          <p class="mt-2 leading-7 text-gray-700">{{ t('privacyFeedbackText') }}</p>
        </section>
        <section>
          <h2 class="text-xl font-semibold text-gray-900">{{ t('privacyTechnicalTitle') }}</h2>
          <p class="mt-2 leading-7 text-gray-700">{{ t('privacyTechnicalText') }}</p>
        </section>
        <section>
          <h2 class="text-xl font-semibold text-gray-900">{{ t('privacyAnalyticsTitle') }}</h2>
          <p class="mt-2 leading-7 text-gray-700">{{ t('privacyAnalyticsText') }}</p>
        </section>
        <section>
          <h2 class="text-xl font-semibold text-gray-900">{{ t('privacyProvidersTitle') }}</h2>
          <p class="mt-2 leading-7 text-gray-700">{{ t('privacyProvidersText') }}</p>
        </section>
        <section>
          <h2 class="text-xl font-semibold text-gray-900">{{ t('privacyRetentionTitle') }}</h2>
          <p class="mt-2 leading-7 text-gray-700">{{ t('privacyRetentionText') }}</p>
        </section>
        <section>
          <h2 class="text-xl font-semibold text-gray-900">{{ t('privacyChoicesTitle') }}</h2>
          <p class="mt-2 leading-7 text-gray-700">{{ t('privacyChoicesText') }}</p>
        </section>
        <section>
          <h2 class="text-xl font-semibold text-gray-900">{{ t('privacyContactTitle') }}</h2>
          <p class="mt-2 leading-7 text-gray-700">{{ t('privacyContactText') }}</p>
          <a
            href="https://github.com/fatjonfreskina/equa"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-3 inline-block font-semibold text-green-700 underline underline-offset-2"
          >
            {{ t('privacyProjectLink') }}
          </a>
        </section>
      </div>
    </article>
  </main>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useI18n } from '../utils/i18n'

const { t } = useI18n()
const defaultTitle = document.title

onMounted(() => {
  document.title = `${t('privacyTitle')} · Equa`
})

onUnmounted(() => {
  document.title = defaultTitle
})
</script>

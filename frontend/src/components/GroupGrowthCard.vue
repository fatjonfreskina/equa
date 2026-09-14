<template>
  <section
    class="my-4 rounded-xl border border-green-100 bg-green-50 p-4"
    aria-labelledby="next-group-title"
  >
    <h2 id="next-group-title" class="text-sm font-semibold text-gray-800">
      {{ t('growthTitle') }}
    </h2>
    <p class="mt-1 text-sm leading-6 text-gray-600">
      {{ t('growthText') }}
    </p>
    <div class="mt-3 flex flex-wrap gap-2">
      <RouterLink
        to="/"
        class="min-h-11 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white"
        >{{ t('growthNewGroup') }}</RouterLink
      >
      <button
        type="button"
        :disabled="sharing"
        class="min-h-11 rounded-lg border border-green-300 bg-white px-4 py-2.5 text-sm font-semibold text-green-800 disabled:opacity-50"
        @click="shareApp"
      >
        {{ t('growthRecommend') }}
      </button>
      <a
        :href="whatsAppUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="min-h-11 px-3 py-2.5 text-sm font-medium text-green-800"
        >{{ t('growthWhatsApp') }}</a
      >
    </div>
    <p class="mt-2 text-xs text-gray-500">
      {{ t('growthPrivacy') }}
    </p>
    <p v-if="feedback" class="mt-2 text-sm text-green-800" role="status">{{ feedback }}</p>
    <input
      v-if="showManualLink"
      :value="appUrl"
      readonly
      :aria-label="t('growthPublicLink')"
      class="mt-2 w-full rounded-lg border border-green-200 bg-white px-3 py-2 text-sm"
      @focus="selectLink"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from '../utils/i18n'

const { t } = useI18n()

// Never derive referrals from location.href: it can contain a private group UUID.
const appUrl = new URL('/', window.location.origin).toString()
const message = computed(() => t('growthShareMessage'))
const whatsAppUrl = computed(
  () => `https://wa.me/?text=${encodeURIComponent(`${message.value} ${appUrl}`)}`,
)
const feedback = ref('')
const showManualLink = ref(false)
const sharing = ref(false)

function selectLink(event: FocusEvent): void {
  ;(event.target as HTMLInputElement).select()
}

async function shareApp(): Promise<void> {
  if (sharing.value) return
  sharing.value = true
  feedback.value = ''
  try {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('growthShareTitle'),
          text: message.value,
          url: appUrl,
        })
        return
      } catch (failure: unknown) {
        if ((failure as { name?: string })?.name === 'AbortError') return
      }
    }
    try {
      await navigator.clipboard.writeText(`${message.value} ${appUrl}`)
      feedback.value = t('growthCopied')
    } catch {
      showManualLink.value = true
      feedback.value = t('growthManualCopy')
    }
  } finally {
    sharing.value = false
  }
}
</script>

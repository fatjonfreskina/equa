<template>
  <Teleport to="body">
    <dialog
      ref="element"
      class="user-feedback-dialog rounded-2xl bg-white p-0 text-gray-800 shadow-xl"
      aria-modal="true"
      :aria-labelledby="titleId"
      @cancel.prevent="close"
    >
      <form class="p-5 sm:p-6" @submit.prevent="submit">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-2xl" aria-hidden="true">{{ category === 'bug' ? '🐛' : '💡' }}</p>
            <h2 :id="titleId" class="mt-1 text-xl font-bold">
              {{ category === 'bug' ? t('reportBug') : t('suggestFeature') }}
            </h2>
          </div>
          <button
            type="button"
            class="min-h-11 min-w-11 text-2xl text-gray-500"
            :aria-label="t('closeFeedback')"
            @click="close"
          >
            ×
          </button>
        </div>

        <p class="mt-3 text-sm leading-6 text-gray-600">{{ t('feedbackIntro') }}</p>
        <label :for="messageId" class="mt-4 block text-sm font-semibold">
          {{ t('feedbackMessage') }}
        </label>
        <textarea
          :id="messageId"
          ref="messageInput"
          v-model="message"
          required
          minlength="10"
          maxlength="2000"
          rows="6"
          :placeholder="
            category === 'bug' ? t('feedbackBugPlaceholder') : t('feedbackFeaturePlaceholder')
          "
          :disabled="busy"
          class="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
        />
        <p class="text-right text-xs text-gray-500">{{ message.length }}/2000</p>

        <label :for="contactId" class="mt-3 block text-sm font-semibold">
          {{ t('feedbackContact') }} <span class="font-normal">{{ t('optional') }}</span>
        </label>
        <input
          :id="contactId"
          v-model="contactEmail"
          type="email"
          autocomplete="email"
          maxlength="254"
          :disabled="busy"
          class="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm"
        />
        <p class="mt-1 text-xs leading-5 text-gray-500">{{ t('feedbackContactHint') }}</p>

        <p class="mt-4 text-xs leading-5 text-gray-500">
          {{ t('feedbackNoGroupData') }}
          <a
            v-if="privacyUrl"
            :href="privacyUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="underline"
            >{{ t('feedbackPrivacy') }}</a
          >.
        </p>
        <p v-if="error" class="mt-3 text-sm text-red-600" role="alert">{{ error }}</p>

        <div class="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            :disabled="busy"
            class="min-h-11 rounded-xl border border-gray-300 px-4 py-2 font-semibold"
            @click="close"
          >
            {{ t('cancel') }}
          </button>
          <button
            type="submit"
            :disabled="busy || message.trim().length < 10"
            class="min-h-11 rounded-xl bg-green-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
          >
            {{ busy ? t('sendingFeedback') : t('sendFeedback') }}
          </button>
        </div>
      </form>
    </dialog>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import { feedbackApi, type FeedbackCategory } from '../api/feedback'
import { useI18n } from '../utils/i18n'

const props = defineProps<{
  category: FeedbackCategory | null
  privacyUrl: string | null
}>()
const emit = defineEmits<{ close: []; submitted: [] }>()
const { locale, t } = useI18n()
const element = ref<HTMLDialogElement | null>(null)
const messageInput = ref<HTMLTextAreaElement | null>(null)
const message = ref('')
const contactEmail = ref('')
const error = ref('')
const busy = ref(false)
const titleId = useId()
const messageId = useId()
const contactId = useId()
let previousFocus: HTMLElement | null = null

function close(): void {
  if (busy.value) return
  element.value?.close()
  message.value = ''
  contactEmail.value = ''
  error.value = ''
  emit('close')
  void nextTick(() => previousFocus?.isConnected && previousFocus.focus())
}

watch(
  () => props.category,
  async (category) => {
    if (!category) {
      element.value?.close()
      return
    }
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    element.value?.showModal()
    await nextTick()
    messageInput.value?.focus()
  },
  { flush: 'post' },
)

async function submit(): Promise<void> {
  if (!props.category || busy.value || message.value.trim().length < 10) return
  busy.value = true
  error.value = ''
  try {
    await feedbackApi.submit({
      category: props.category,
      message: message.value.trim(),
      contact_email: contactEmail.value.trim() || null,
      locale: locale.value,
    })
    element.value?.close()
    emit('submitted')
    emit('close')
    message.value = ''
    contactEmail.value = ''
  } catch (failure: unknown) {
    const status = (failure as { response?: { status?: number } })?.response?.status
    error.value = status === 429 ? t('feedbackRateLimit') : t('feedbackError')
  } finally {
    busy.value = false
  }
}

onBeforeUnmount(() => element.value?.close())
</script>

<style scoped>
.user-feedback-dialog {
  width: min(34rem, calc(100% - 2rem));
  max-height: calc(100dvh - 2rem);
  margin: auto;
  overflow-y: auto;
}

.user-feedback-dialog::backdrop {
  background: rgb(0 0 0 / 45%);
}
</style>

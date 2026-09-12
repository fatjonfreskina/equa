<template>
  <div ref="root" class="fixed bottom-4 right-4 z-40">
    <div
      v-if="open"
      id="app-utilities-panel"
      ref="panel"
      class="absolute bottom-14 right-0 w-[min(19rem,calc(100vw-2rem))] rounded-2xl border border-gray-200 bg-white p-4 text-gray-800 shadow-xl"
      role="dialog"
      :aria-label="t('utilities')"
    >
      <div class="flex items-center justify-between">
        <h2 class="font-bold">{{ t('utilities') }}</h2>
        <button
          type="button"
          class="min-h-11 min-w-11 text-xl"
          :aria-label="t('closeUtilities')"
          @click="close"
        >
          ×
        </button>
      </div>
      <div class="mt-3 grid gap-3">
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>
      <div v-if="feedbackEnabled" class="mt-4 border-t border-gray-200 pt-4">
        <p class="text-sm font-semibold">{{ t('feedback') }}</p>
        <div class="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            class="min-h-11 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold"
            @click="startFeedback('bug')"
          >
            🐛 {{ t('reportBug') }}
          </button>
          <button
            type="button"
            class="min-h-11 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold"
            @click="startFeedback('feature')"
          >
            💡 {{ t('suggestFeature') }}
          </button>
        </div>
      </div>
      <p v-if="status" class="mt-3 text-sm text-green-700" role="status">{{ status }}</p>
    </div>

    <button
      ref="trigger"
      type="button"
      class="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-xl shadow-lg transition hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
      :aria-label="open ? t('closeUtilities') : t('openUtilities')"
      aria-controls="app-utilities-panel"
      :aria-expanded="open"
      @click="toggle"
    >
      <span aria-hidden="true">{{ open ? '×' : '⚙️' }}</span>
    </button>

    <UserFeedbackDialog
      :category="feedbackCategory"
      :privacy-url="privacyUrl"
      @close="feedbackCategory = null"
      @submitted="feedbackSubmitted"
    />
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { feedbackApi, type FeedbackCategory } from '../api/feedback'
import { useI18n } from '../utils/i18n'
import LanguageSwitcher from './LanguageSwitcher.vue'
import ThemeSwitcher from './ThemeSwitcher.vue'
import UserFeedbackDialog from './UserFeedbackDialog.vue'

const { t } = useI18n()
const root = ref<HTMLElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const open = ref(false)
const feedbackEnabled = ref(false)
const privacyUrl = ref<string | null>(null)
const feedbackCategory = ref<FeedbackCategory | null>(null)
const status = ref('')

onMounted(async () => {
  document.addEventListener('keydown', onKeydown)
  document.addEventListener('pointerdown', onPointerdown)
  try {
    const { data } = await feedbackApi.options()
    feedbackEnabled.value = data.enabled
    privacyUrl.value = data.privacy_url
  } catch {
    // Utilities remain usable against an older backend.
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('pointerdown', onPointerdown)
})

async function toggle(): Promise<void> {
  open.value = !open.value
  status.value = ''
  if (open.value) {
    await nextTick()
    panel.value?.querySelector<HTMLElement>('button, select')?.focus()
  }
}

function close(): void {
  open.value = false
  trigger.value?.focus()
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && open.value && !feedbackCategory.value) close()
}

function onPointerdown(event: PointerEvent): void {
  if (open.value && !feedbackCategory.value && !root.value?.contains(event.target as Node))
    open.value = false
}

function startFeedback(category: FeedbackCategory): void {
  feedbackCategory.value = category
}

function feedbackSubmitted(): void {
  status.value = t('feedbackSent')
}
</script>

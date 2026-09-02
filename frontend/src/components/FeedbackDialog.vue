<template>
  <Teleport to="body">
    <dialog
      ref="element"
      class="feedback-dialog rounded-2xl bg-white p-0 text-gray-800 shadow-xl"
      :role="request?.kind === 'alert' ? 'alertdialog' : 'dialog'"
      aria-modal="true"
      :aria-labelledby="titleId"
      :aria-describedby="messageId"
      @cancel.prevent="emit('respond', false)"
    >
      <div v-if="request" class="p-5 sm:p-6">
        <h2 :id="titleId" class="break-words text-xl font-bold">{{ request.title }}</h2>
        <p
          :id="messageId"
          class="mt-3 whitespace-pre-line break-words text-sm leading-6 text-gray-600"
        >
          {{ request.message }}
        </p>
        <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            v-if="request.kind === 'confirm'"
            ref="cancelButton"
            type="button"
            class="min-h-12 rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            @click="emit('respond', false)"
          >
            Annulla
          </button>
          <button
            ref="confirmButton"
            type="button"
            class="min-h-12 rounded-xl px-5 py-3 font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            :class="
              request.destructive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            "
            @click="emit('respond', true)"
          >
            {{ request.confirmLabel || (request.kind === 'alert' ? 'Ho capito' : 'Conferma') }}
          </button>
        </div>
      </div>
    </dialog>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import type { FeedbackDialogRequest } from '../composables/useFeedbackDialog'

const props = defineProps<{ request: FeedbackDialogRequest | null }>()
const emit = defineEmits<{ respond: [confirmed: boolean] }>()
const element = ref<HTMLDialogElement | null>(null)
const cancelButton = ref<HTMLButtonElement | null>(null)
const confirmButton = ref<HTMLButtonElement | null>(null)
const titleId = useId()
const messageId = useId()
let previousFocus: HTMLElement | null = null
let previousOverflow: string | undefined

function close() {
  element.value?.close()
  if (previousOverflow !== undefined) {
    document.body.style.overflow = previousOverflow
    previousOverflow = undefined
  }
  const focusTarget = previousFocus
  // Wait for the invoking action to re-enable its button after cancellation.
  void nextTick(() => {
    if (focusTarget?.isConnected && !element.value?.open) focusTarget.focus()
  })
  previousFocus = null
}

watch(
  () => props.request,
  (request) => {
    if (!request) {
      close()
      return
    }
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Native modal semantics keep keyboard focus inside and the page behind inert.
    element.value?.showModal()
    const initialFocus = cancelButton.value || confirmButton.value
    initialFocus?.focus()
  },
  { flush: 'post' },
)

onBeforeUnmount(close)
</script>

<style scoped>
.feedback-dialog {
  width: min(28rem, calc(100% - 2rem));
  max-height: calc(100dvh - 2rem);
  margin: auto;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.feedback-dialog::backdrop {
  background: rgb(0 0 0 / 40%);
}
</style>

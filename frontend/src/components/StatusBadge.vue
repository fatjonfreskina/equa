<template>
  <span
    class="inline-block shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold"
    :class="toneClasses[tone]"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
export type StatusTone = 'info' | 'warning' | 'success'

withDefaults(defineProps<{ tone?: StatusTone }>(), { tone: 'info' })

const toneClasses: Record<StatusTone, string> = {
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
}
</script>

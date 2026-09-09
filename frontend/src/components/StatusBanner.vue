<template>
  <section class="rounded-xl border" :class="toneClasses[tone]">
    <slot />
  </section>
</template>

<script setup lang="ts">
type StatusTone = 'info' | 'warning' | 'success'

withDefaults(defineProps<{ tone?: StatusTone }>(), { tone: 'info' })

const toneClasses: Record<StatusTone, string> = {
  info: 'border-blue-100 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200',
  warning:
    'border-amber-100 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200',
  success:
    'border-green-100 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-200',
}
</script>

<template>
  <span
    :class="[
      'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
      variant === 'new' ? 'bg-amber-100 text-amber-700' : 'bg-violet-100 text-violet-700',
    ]"
  >
    {{ variant === 'new' ? 'Novità' : 'Beta' }}
  </span>
</template>

<script setup lang="ts">
defineProps<{
  variant: 'new' | 'beta'
}>()
</script>

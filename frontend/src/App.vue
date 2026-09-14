<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 transition-colors">
    <AppUtilities />
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import AppUtilities from './components/AppUtilities.vue'
</script>

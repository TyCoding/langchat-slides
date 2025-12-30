<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'
import { useAppStore } from '@/stores/useAppStore'

const store = useAppStore()
const { t } = useI18n()
</script>

<template>
  <div v-if="!store.isConfigured()" class="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
    <div class="text-center p-8 bg-card border rounded-lg">
      <h2 class="text-lg font-semibold">{{ t('welcomeTitle').value }}</h2>
      <p class="text-muted-foreground mt-2">{{ t('welcomeDesc').value }}</p>
    </div>
  </div>
</template>
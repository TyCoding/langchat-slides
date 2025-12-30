<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()
</script>

<template>
  <div class="h-full flex flex-col items-center justify-center p-8 text-center bg-card">
    <div class="max-w-md">
      <h1 class="text-2xl font-semibold tracking-tight">{{ t('welcomeTitle').value }}</h1>
      <p class="mt-2 text-muted-foreground">
        {{ t('welcomeDesc').value }}
      </p>
    </div>
  </div>
</template>
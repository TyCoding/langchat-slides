<script lang="ts" setup>
import type {Slide} from '@/types'
import {useI18n} from '@/composables/useI18n'

const { t } = useI18n()

defineProps<{
  slide: Slide
  isActive: boolean
  index: number
}>()
</script>

<template>
  <div 
    :class="isActive ? 'border-primary ring-2 ring-primary ring-offset-2 dark:ring-offset-background' : 'border-transparent bg-muted'"
    class="cursor-pointer rounded-md border-2 p-2 transition-all hover:border-primary w-full aspect-video bg-card flex flex-col justify-between overflow-hidden"
  >
    <div class="text-[10px] text-muted-foreground font-mono mb-1">{{ t('slide').value }} {{ index + 1 }}</div>
    <div class="flex-1 flex items-center justify-center text-xs text-center font-semibold break-words px-1 text-foreground">
      {{ slide.title || 'Untitled' }}
    </div>
  </div>
</template>

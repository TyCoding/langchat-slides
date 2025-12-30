<script lang="ts" setup>
import {ref} from 'vue'
import {Button} from '@/components/ui/button'
import {Textarea} from '@/components/ui/textarea'
import {Loader2, SendHorizontal} from 'lucide-vue-next'
import {useAppStore} from '@/stores/useAppStore'
import {useI18n} from '@/composables/useI18n'

const emit = defineEmits<{
  (e: 'send', text: string): void
}>()

const store = useAppStore()
const { t } = useI18n()
const input = ref('')

function handleSend() {
  if (!input.value.trim() || store.isStreaming) return
  emit('send', input.value)
  input.value = ''
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}
</script>

<template>
  <div class="">
    <div class="relative">
      <Textarea 
        v-model="input" 
        :placeholder="t('sendPlaceholder').value" 
        class="min-h-[80px] max-h-[200px] pr-12 resize-none overflow-y-auto border-border/50 bg-muted/20 focus:bg-background transition-colors"
        @keydown="handleKeydown"
      />
      <Button 
        :disabled="!input.trim() || store.isStreaming"
        class="absolute bottom-2 right-2 h-8 w-8 rounded-lg"
        size="icon"
        @click="handleSend"
      >
        <Loader2 v-if="store.isStreaming" class="h-4 w-4 animate-spin" />
        <SendHorizontal v-else class="h-4 w-4" />
      </Button>
    </div>
    <div class="mt-2 flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <!-- Stream mode enabled by default -->
      </div>
    </div>
  </div>
</template>

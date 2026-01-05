<script lang="ts" setup>
import {ref} from 'vue'
import {Button} from '@/components/ui/button'
import {Textarea} from '@/components/ui/textarea'
import {Loader2, SendHorizontal} from 'lucide-vue-next'
import {useAppStore} from '@/stores/useAppStore'
import {useI18n} from '@/composables/useI18n'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from '@/components/ui/select'
import {infographicTemplates} from '@/lib/slide-utils'

const emit = defineEmits<{
  (e: 'send', text: string, theme?: string): void
}>()

const store = useAppStore()
const { t } = useI18n()
const input = ref('')
const selectedTheme = ref(infographicTemplates[0]!.value)

function handleSend() {
  if (!input.value.trim() || store.isStreaming) return
  emit('send', input.value, selectedTheme.value)
  input.value = ''
  // Keep theme selected or reset? Usually reset might be better if per-message but user might want persistence.
  // Requirement says "choose subject... then as theme variable". I'll keep it simple and not reset for now, or maybe I should?
  // Let's NOT reset it, assuming user might want to generate multiple slides with same theme.
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}
</script>

<template>
  <div class="relative flex flex-col bg-card border border-border/60 rounded-xl shadow-sm focus-within:ring-1 focus-within:ring-primary/30 focus-within:border-primary/50 transition-all duration-200 overflow-hidden">
    <!-- Input Area -->
    <Textarea 
      v-model="input" 
      :placeholder="t('sendPlaceholder').value" 
      class="min-h-[100px] max-h-[200px] w-full resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 p-4 text-sm leading-relaxed"
      @keydown="handleKeydown"
    />
    
    <!-- Bottom Toolbar -->
    <div class="flex items-center justify-between px-3 py-2 border-t border-border/40 bg-muted/5">
      <div class="flex items-center gap-2">
        <Select v-model="selectedTheme">
          <SelectTrigger class="h-8 min-w-[140px] max-w-[220px] text-xs font-medium border-0 bg-secondary/50 hover:bg-secondary transition-colors px-2.5 rounded-lg shadow-none focus:ring-0 group">
            <div class="flex items-center gap-2 overflow-hidden mr-1">
              <div class="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0 group-hover:bg-primary transition-colors"></div>
            <SelectValue :placeholder="t('selectTemplate').value || 'Select Template'" class="truncate" />
            </div>
          </SelectTrigger>
          <SelectContent class="w-[200px]">
            <SelectItem 
              v-for="template in infographicTemplates" 
              :key="template.value" 
              :value="template.value"
              class="text-xs cursor-pointer py-2"
            >
              {{ template.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="flex items-center gap-2">
        <Button 
          :disabled="!input.trim() || store.isStreaming"
          class="h-8 w-8 rounded-lg shadow-sm hover:translate-y-[-1px] active:translate-y-[0px] transition-all duration-200"
          size="icon"
          @click="handleSend"
        >
          <Loader2 v-if="store.isStreaming" class="h-4 w-4 animate-spin" />
          <SendHorizontal v-else class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>

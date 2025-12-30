<script lang="ts" setup>
import { ref } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAppStore } from '@/stores/useAppStore'
import { PlusCircle } from 'lucide-vue-next'
import { useI18n } from '@/composables/useI18n'

const store = useAppStore()
const { t } = useI18n()

const isOpen = ref(false)
const customSyntax = ref('')
const renderMode = ref<'replace' | 'append'>('replace')

function handleRender() {
  if (!customSyntax.value.trim()) return
  
  const content = customSyntax.value
  const parts = content.split('[slide]')
  const potentialSlides = parts.slice(1)
  
  if (potentialSlides.length > 0) {
    const newSlides = potentialSlides.map((part, index) => {
      let body = part
      const closingIndex = part.indexOf('[/slide]')
      if (closingIndex !== -1) {
        body = part.substring(0, closingIndex)
      }
      
      body = body.trim()
      const titleMatch = body.match(/^title\s+(.*)/m)
      
      const slide = {
        id: `slide-${Date.now()}-${index}`,
        title: (titleMatch && titleMatch[1]) ? titleMatch[1] : `Slide ${index + 1}`,
        content: body,
        syntax: body
      }
      return slide
    })
    
    const validSlides = newSlides.filter(s => s.content.length > 5)
    
    if (validSlides.length > 0) {
      if (renderMode.value === 'append') {
        store.appendSlides(validSlides)
        store.currentSlideIndex = store.slides.length - 1
      } else {
        store.setSlides(validSlides)
        store.currentSlideIndex = 0
      }
      
      // Close dialog and clear input
      isOpen.value = false
      customSyntax.value = ''
    }
  }
}

function handleCancel() {
  isOpen.value = false
  customSyntax.value = ''
}
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger as-child>
      <Button class="h-8 gap-2" size="sm" variant="ghost">
        <PlusCircle class="h-4 w-4" />
        <span class="text-xs">{{ t('custom').value }}</span>
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>{{ t('customSlide').value }}</DialogTitle>
        <DialogDescription>
          {{ t('customSlideDesc').value }}
        </DialogDescription>
      </DialogHeader>
      
      <div class="max-h-[70vh] flex flex-col space-y-4 py-4">
        <!-- Mode Selection -->
        <div class="flex items-center gap-4 shrink-0">
          <span class="text-sm font-medium">{{ t('mode').value }}:</span>
          <div class="flex gap-2">
            <Button
              :variant="renderMode === 'replace' ? 'default' : 'outline'"
              size="sm"
              @click="renderMode = 'replace'"
            >
              {{ t('replace').value }}
            </Button>
            <Button
              :variant="renderMode === 'append' ? 'default' : 'outline'"
              size="sm"
              @click="renderMode = 'append'"
            >
              {{ t('append').value }}
            </Button>
          </div>
        </div>
        
        <!-- Textarea for syntax input -->
        <div class="space-y-2 flex-1 flex flex-col min-h-0">
          <label class="text-sm font-medium shrink-0">{{ t('slideSyntax').value }}:</label>
          <Textarea
            v-model="customSyntax"
            class="flex-1 font-mono text-xs resize-none"
            :placeholder="t('slideSyntaxPlaceholder').value"
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" @click="handleCancel">
          {{ t('cancel').value }}
        </Button>
        <Button @click="handleRender">
          {{ t('render').value }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

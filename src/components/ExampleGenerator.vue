<script lang="ts" setup>
import {ref} from 'vue'
import {Button} from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {useAppStore} from '@/stores/useAppStore'
import {nanoid} from 'nanoid'
import {Check, PlayCircle, Sparkles} from 'lucide-vue-next'
import {useThrottleFn} from '@vueuse/core'
import type {Example} from '@/examples/examples'
import {examples} from '@/examples/examples'

const store = useAppStore()

// Store reference to initial slides for throttled updates
let initialSlides: any[] = []

// Throttle updates to avoid excessive re-renders
const throttledUpdate = useThrottleFn((content: string) => {
  store.updateLastMessage(content)
  parseSlides(content)
}, 100)

// Track currently selected example
const selectedExample = ref<Example | null>(null)

// Simulate streaming output
async function simulateStreamResponse(example: Example) {
  // Set selected example
  selectedExample.value = example

  // Add user message with natural language
  store.addMessage({
    id: nanoid(),
    role: 'user',
    content: example.userMessage
  })

  // Add placeholder AI message
  const aiMsgId = nanoid()
  store.addMessage({
    id: aiMsgId,
    role: 'assistant',
    content: ''
  })

  store.isStreaming = true
  let fullContent = ''

  try {
    // Simulate streaming with chunks
    const chunkSize = 10 // Process 10 characters at a time
    const delay = 100 // 100ms delay between chunks

    for (let i = 0; i < example.slides.length; i += chunkSize) {
      const chunk = example.slides.slice(i, i + chunkSize)
      fullContent += chunk
      // Use throttled update for smooth rendering
      throttledUpdate(fullContent)
      
      // Wait before next chunk
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  } catch (error: any) {
    store.updateLastMessage(`Error: ${error.message}`)
    console.error('Stream error:', error)
  } finally {
    store.isStreaming = false
    // Final update to ensure all content is rendered
    store.updateLastMessage(fullContent)
    // parseSlides(fullContent)
  }
}

function parseSlides(content: string) {
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
      
      const slide = {
        id: `slide-${index}`,
        content: body,
        syntax: body
      }
      return slide
    })
    
    const validSlides = newSlides.filter((s: any) => s.content.length > 5)
    
    if (validSlides.length > 0) {
      const latestIndex = validSlides.length - 1
      
      store.setSlides(validSlides)
      // Always switch to the latest slide
      store.currentSlideIndex = latestIndex
    }
  }
}

function handleGenerateExample(example: Example) {
  simulateStreamResponse(example)
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button class="gap-2 justify-start" size="sm" variant="outline">
        <PlayCircle class="h-4 w-4" />
        <span class="truncate">{{ selectedExample ? selectedExample.name : 'Example' }}</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="w-72">
      <DropdownMenuLabel class="flex items-center gap-2">
        <Sparkles class="h-4 w-4" />
        选择示例
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        v-for="example in examples"
        :key="example.id"
        :class="selectedExample?.id === example.id ? 'bg-accent' : ''"
        class="cursor-pointer gap-2"
        @click="handleGenerateExample(example)"
      >
        <div class="flex flex-col gap-0.5 flex-1">
          <span class="font-medium">{{ example.name }}</span>
          <span class="text-xs text-muted-foreground">{{ example.description }}</span>
        </div>
        <Check 
          v-if="selectedExample?.id === example.id"
          class="h-4 w-4 text-primary flex-shrink-0"
        />
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

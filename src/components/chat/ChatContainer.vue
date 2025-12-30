<script lang="ts" setup>
import {computed, nextTick, onMounted, ref, watch} from 'vue'
import ChatMessage from './ChatMessage.vue'
import ChatInput from './ChatInput.vue'
import ChatOverlay from './ChatOverlay.vue'
import {useAppStore} from '@/stores/useAppStore'
import {useAI} from '@/api/ai'
import {nanoid} from 'nanoid'
import {type Slide} from '@/types'
import {useI18n} from '@/composables/useI18n'
import {useThrottleFn} from '@vueuse/core'

const store = useAppStore()
const { streamChat } = useAI()
const scrollRef = ref<HTMLElement | null>(null)
const { t } = useI18n()

// Store reference to initial slides for throttled updates
let initialSlides: Slide[] = []

// Function fixSlideSyntax removed as it was corrupting valid syntax
// by stripping indentation and adding dashes to properties.

// Throttle updates to avoid excessive re-renders
const throttledUpdate = useThrottleFn((content: string) => {
  store.updateLastMessage(content)
  parseSlides(content, initialSlides)
  scrollToBottom()
}, 100)

// Preset questions for empty state
const presetQuestions = computed(() => [
  t('presetQuestion1').value,
  t('presetQuestion2').value,
  t('presetQuestion3').value,
  t('presetQuestion4').value,
  t('presetQuestion5').value,
  t('presetQuestion6').value
])

function scrollToBottom() {
  nextTick(() => {
    if (scrollRef.value) {
      scrollRef.value.scrollTop = scrollRef.value.scrollHeight
    }
  })
}

watch(() => store.messages.length, scrollToBottom)

async function handleSendMessage(content: string) {
  if (!content.trim() || store.isStreaming) return

  // Add user message
  store.addMessage({
    id: nanoid(),
    role: 'user',
    content
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
  
  // Snapshot current slides if appending and set for throttled updates
  initialSlides = store.slideRenderMode === 'append' ? [...store.slides] : []

  try {
    const config = {
      apiKey: store.apiKey,
      baseUrl: store.baseUrl,
      model: store.model
    }

    const stream = streamChat(store.messages.filter(m => m.id !== aiMsgId), config)

    for await (const chunk of stream) {
      fullContent += chunk
      // Use throttled update for smooth rendering
      throttledUpdate(fullContent)
    }
  } catch (error: any) {
    store.updateLastMessage(`Error: ${error.message}`)
    console.error('Stream error:', error)
  } finally {
    store.isStreaming = false
    // Final update to ensure all content is rendered
    store.updateLastMessage(fullContent)
    parseSlides(fullContent, initialSlides)
  }
}

function parseSlides(content: string, initialSlides: Slide[] = []) {
  // Use split for robust streaming parsing (handles unclosed tags)
  const parts = content.split('[slide]')
  
  // parts[0] is usually text before first slide, ignore it for slide generation
  const potentialSlides = parts.slice(1)
  
  if (potentialSlides.length > 0) {
    const newSlides: Slide[] = potentialSlides.map((part, index) => {
      // Remove closing tag if present, but still render without it
      let body = part
      const closingIndex = part.indexOf('[/slide]')
      if (closingIndex !== -1) {
        body = part.substring(0, closingIndex)
      }
      
      body = body.trim()
      
      // Fix formatting: ensure items have proper indentation and dash prefix
      // AI might output without dashes, so we need to add them
      // body = fixSlideSyntax(body) // DISABLED: Causing issues with valid syntax
      
      // Try to extract title from syntax or default
      const titleMatch = body.match(/^title\s+(.*)/m)
      
      // Calculate offset index for ID generation if appending
      // For replace mode, index is just index
      const globalIndex = store.slideRenderMode === 'append' ? (initialSlides.length + index) : index
      
      const slide: Slide = {
        id: `slide-${globalIndex}`, // Stable ID
        title: (titleMatch && titleMatch[1]) ? titleMatch[1] : `Slide ${globalIndex + 1}`,
        content: body,
        syntax: body
      }
      return slide
    })
    
    // Filter out empty slides that might occur during early streaming
    const validSlides = newSlides.filter(s => s.content.length > 5)

    if (validSlides.length > 0) {
      const prevCount = store.slides.length
      const latestIndex = validSlides.length - 1
      
      if (store.slideRenderMode === 'append') {
        store.setSlides([...initialSlides, ...validSlides])
        // If we added new slides, switch to the last one
        if (store.slides.length > prevCount) {
          store.currentSlideIndex = store.slides.length - 1
        }
      } else {
        store.setSlides(validSlides)
        // Always switch to the latest slide during streaming in replace mode
        store.currentSlideIndex = latestIndex
      }
    }
  }
}

onMounted(() => {
  scrollToBottom()
})
</script>

<template>
  <div class="flex flex-col h-full relative overflow-hidden">
    <ChatOverlay />
    
    <div ref="scrollRef" class="flex-1 overflow-y-auto p-4 custom-scrollbar scroll-smooth">
      <div v-if="store.messages.length === 0" class="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <!-- Header -->
        <div class="mb-8">
          <div class="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 mx-auto shadow-lg shadow-primary/10">
            <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-foreground mb-2">{{ t('aiSlidesGenerator').value }}</h2>
          <p class="text-muted-foreground max-w-md mx-auto">{{ t('aiSlidesDesc').value }}</p>
        </div>

        <!-- Preset Questions -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full mb-8">
          <button 
            v-for="(question, index) in presetQuestions" 
            :key="index"
            class="group relative p-4 text-left rounded-xl border border-border/50 bg-card/50 hover:border-primary/50 hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/10 transition-all duration-200"
            @click="handleSendMessage(question)"
          >
            <div class="flex items-start gap-3">
              <div class="mt-0.5 flex-shrink-0">
                <div class="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                  </svg>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {{ question }}
                </p>
              </div>
              <div class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                </svg>
              </div>
            </div>
          </button>
        </div>

        <!-- Tips -->
        <p class="text-xs text-muted-foreground">
          <span class="inline-flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
            {{ t('customInputTip').value }}
          </span>
        </p>
      </div>
      
      <div class="space-y-6 pb-4">
        <ChatMessage 
          v-for="message in store.messages" 
          :key="message.id" 
          :message="message" 
        />
      </div>
    </div>

    <div class="p-4 border-t border-border/50 bg-card/50 shrink-0 z-10 backdrop-blur-sm">
      <ChatInput @send="handleSendMessage" />
    </div>
  </div>
</template>

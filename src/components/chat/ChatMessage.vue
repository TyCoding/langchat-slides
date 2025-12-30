<script lang="ts" setup>
import {computed, nextTick, ref, watch, onMounted} from 'vue'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar'
import MarkdownIt from 'markdown-it'
import type {Message} from '@/types'
import {Button} from '@/components/ui/button'
import {Check, ChevronDown, Copy, Loader2, Maximize2, RefreshCw} from 'lucide-vue-next'
import {useI18n} from '@/composables/useI18n'
import {useAppStore} from '@/stores/useAppStore'

const { t } = useI18n()
const store = useAppStore()

const props = defineProps<{
  message: Message
}>()

const md = new MarkdownIt({ breaks: true })
const contentRef = ref<HTMLElement | null>(null)
const isExpanded = ref(false)
const maxHeight = '320px'
const isCopied = ref(false)

// Check if content overflows (persists even when expanded)
const showExpandControl = ref(false)

function checkOverflow() {
  if (!contentRef.value) return
  // Use a threshold slightly larger than maxHeight to avoid flickering near boundary
  showExpandControl.value = contentRef.value.scrollHeight > 320
}

watch(() => props.message.content, () => {
  nextTick(checkOverflow)
})

watch(isExpanded, () => {
  nextTick(checkOverflow)
})

onMounted(() => {
  // Initial check
  setTimeout(checkOverflow, 100)
  // Use ResizeObserver for robust detection
  if (contentRef.value) {
    const ro = new ResizeObserver(checkOverflow)
    ro.observe(contentRef.value)
  }
})

const renderedContent = computed(() => {
  // Check if content contains slide syntax - display as raw text to preserve indentation
  if (props.message.content && props.message.content.includes('[slide]')) {
    return props.message.content
  }
  // Otherwise use markdown rendering
  return md.render(props.message.content || '')
})

function toggleExpand() {
  isExpanded.value = !isExpanded.value
  
  // If collapsing, scroll back to top nicely
  if (!isExpanded.value && contentRef.value) {
    contentRef.value.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// Auto-scroll to bottom during streaming
watch(() => props.message.content, () => {
  if (!isExpanded.value && contentRef.value && props.message.role === 'assistant') {
    nextTick(() => {
      // Only scroll if near bottom or if it's a new message? 
      // Current behavior: strict scroll to bottom
      contentRef.value!.scrollTop = contentRef.value!.scrollHeight
    })
  }
})

// Copy text to clipboard
async function copyText() {
  if (!props.message.content) return
  try {
    await navigator.clipboard.writeText(props.message.content)
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

// Re-render slides from this message content
function reRender() {
  if (!props.message.content || props.message.role !== 'assistant') return
  
  // Parse and render slides from this message
  const content = props.message.content
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
        id: `slide-${index}`,
        title: (titleMatch && titleMatch[1]) ? titleMatch[1] : `Slide ${index + 1}`,
        content: body,
        syntax: body
      }
      return slide
    })
    
    const validSlides = newSlides.filter(s => s.content.length > 5)
    
    if (validSlides.length > 0) {
      store.setSlides(validSlides)
      // Switch to the latest slide
      store.currentSlideIndex = validSlides.length - 1
    }
  }
}
</script>

<template>
  <div :class="{ 'flex-row-reverse': message.role === 'user' }" class="flex gap-3 mb-6">
    <Avatar>
      <AvatarImage :src="message.role === 'user' ? '' : '/logo.png'" />
      <AvatarFallback>{{ message.role === 'user' ? 'U' : 'AI' }}</AvatarFallback>
    </Avatar>
    
    <div 
      :class="{ 'items-end': message.role === 'user' }"
      class="flex flex-col w-full"
    >
      <div 
        :class="message.role === 'user' ? 'bg-primary text-primary-foreground border-transparent' : 'bg-muted'"
        class="rounded-lg text-sm border border-border/50 overflow-hidden relative group"
      >
        <!-- Content Container with Scroll -->
        <div 
          ref="contentRef"
          :class="[
            isExpanded ? 'max-h-none' : `max-h-[${maxHeight}]`,
            message.role === 'user' ? 'max-h-none' : '',
            showExpandControl && message.role === 'assistant' ? 'pb-8' : ''
          ]"
          :style="isExpanded ? '' : { maxHeight }"
          class="relative overflow-y-auto p-3 transition-all duration-300"
        >
          <div 
            v-if="props.message.content && props.message.content.includes('[slide]')"
            class="whitespace-pre-wrap font-mono text-xs break-words"
          >{{ props.message.content }}</div>
          <div 
            v-else
            v-html="renderedContent"
          ></div>
          
          <!-- Loading Indicator for empty assistant message -->
          <div v-if="message.role === 'assistant' && !message.content" class="flex items-center gap-2 py-1 px-1 text-muted-foreground">
            <Loader2 class="h-3.5 w-3.5 animate-spin" />
            <span class="text-xs">{{ t('thinking').value }}</span>
          </div>
        </div>
        
        <!-- Integrated Expand/Collapse Control (Assistant Only) -->
        <div 
          v-if="showExpandControl && message.role === 'assistant'"
          class="absolute bottom-0 left-0 right-0 flex items-end justify-center cursor-pointer hover:bg-black/5 transition-colors z-10"
          :class="isExpanded ? 'h-6 bg-muted/80 backdrop-blur-[1px]' : 'h-20 bg-gradient-to-t from-muted via-muted/90 to-transparent'"
          @click="toggleExpand"
        >
           <div class="mb-1 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
             <ChevronDown 
                :class="{ 'rotate-180': isExpanded }"
                class="h-4 w-4 text-foreground/50 transition-transform duration-300"
             />
           </div>
        </div>
      </div>
      
      <!-- Copy and Re-render Buttons for slide content -->
      <Transition name="fade">
        <div 
          v-if="message.role === 'assistant' && props.message.content && props.message.content.includes('[slide]')"
          class="mt-2 flex gap-2"
        >
          <Button 
            class="h-7 text-xs gap-1.5 hover:bg-primary/10"
            size="sm" 
            title="Copy text"
            variant="ghost"
            @click="copyText"
          >
            <Check v-if="isCopied" class="h-3 w-3" />
            <Copy v-else class="h-3 w-3" />
            <span>{{ isCopied ? 'Copied' : 'Copy' }}</span>
          </Button>
          <Button 
            class="h-7 text-xs gap-1.5 hover:bg-primary/10"
            size="sm" 
            title="Re-render slides"
            variant="ghost"
            @click="reRender"
          >
            <RefreshCw class="h-3 w-3" />
            <span>Re-render</span>
          </Button>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style>
.prose p {
  margin-bottom: 0.5em;
  line-height: 1.6;
  text-indent: 2em;
}
.prose p:last-child {
  margin-bottom: 0;
}
.prose pre {
  background-color: rgba(0,0,0,0.1);
  padding: 0.5rem;
  border-radius: 0.25rem;
  overflow-x: auto;
}

/* Custom scrollbar for content */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: hsl(var(--muted-foreground) / 0.3);
  border-radius: 2px;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: hsl(var(--muted-foreground) / 0.5);
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

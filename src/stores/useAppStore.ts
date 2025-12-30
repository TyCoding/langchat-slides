import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import {useDark, useStorage, useToggle} from '@vueuse/core'
import {type Message, type Slide} from '@/types'

export const useAppStore = defineStore('app-store', () => {
  // --- UI State ---
  // Load default locale from environment variable
  const defaultLocale = (import.meta.env.VITE_DEFAULT_LOCALE || 'zh') as 'zh' | 'en'
  const locale = useStorage<'zh' | 'en'>('langchat-slides-locale', defaultLocale)
  
  // Defaults to Dark Mode
  const isDark = useDark({
    selector: 'html',
    attribute: 'class',
    valueDark: 'dark',
    valueLight: 'light',
    initialValue: 'dark', // Prefer dark
  })
  const toggleDark = useToggle(isDark)

  // --- API State ---
  // Load defaults from environment variables
  const defaultApiKey = import.meta.env.VITE_OPENAI_API_KEY
  const defaultBaseUrl = import.meta.env.VITE_OPENAI_BASE_URL
  const defaultModel = import.meta.env.VITE_OPENAI_MODEL

  const apiKey = useStorage('langchat-slides-apikey-v1', defaultApiKey)
  const baseUrl = useStorage('langchat-slides-baseurl-v1', defaultBaseUrl)
  const model = useStorage('langchat-slides-model-v1', defaultModel)
  
  // --- Functional State ---
  const messages = ref<Message[]>([])
  const slides = ref<Slide[]>([])
  const currentSlideIndex = ref(0)
  const isStreaming = ref(false)
  const slideRenderMode = ref<'replace' | 'append'>('replace')

  const currentSlide = computed(() => slides.value[currentSlideIndex.value] || null)

  const isConfigured = () => {
    return !!apiKey.value && apiKey.value.trim().length > 0
  }

  function addMessage(message: Omit<Message, 'timestamp'>) {
    messages.value.push({
      ...message,
      timestamp: Date.now()
    })
  }

  function updateLastMessage(content: string) {
    const lastMessage = messages.value[messages.value.length - 1]
    if (lastMessage) {
      lastMessage.content = content
    }
  }

  function setSlides(newSlides: Slide[]) {
    slides.value = newSlides
    // Do not reset index here to support streaming updates without jumping
  }

  function appendSlides(newSlides: Slide[]) {
    slides.value = [...slides.value, ...newSlides]
  }

  function clearSlides() {
    slides.value = []
    currentSlideIndex.value = 0
  }

  function toggleLocale() {
    locale.value = locale.value === 'zh' ? 'en' : 'zh'
  }

  return {
    locale,
    isDark,
    toggleDark,
    toggleLocale,
    apiKey,
    baseUrl,
    model,
    isConfigured,
    messages,
    slides,
    currentSlideIndex,
    isStreaming,
    slideRenderMode,
    currentSlide,
    addMessage,
    updateLastMessage,
    setSlides,
    appendSlides,
    clearSlides
  }
})
